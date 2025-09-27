

// FILE: app/post/[id]/page.tsx
import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Comments from "./Comments";

// ---------- Types ----------
type MediaItem = { url: string; type: string; name?: string };

type Author = {
  id: string;
  username: string;
  name?: string;
  age?: number;
  gender?: string;
  location?: string;
  avatar_url?: string; // ✅ added
};

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  media: MediaItem[] | null;
  profiles: Author;
};
// ----------------------------

// Change the function signature to mark params as async
export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  // Await params destructuring
  const { id } = await params;

  const supabase = createServerComponentClient({
    cookies, // pass the function reference, not the result
  });

  // Fetch post + author (1-to-1 relation)
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      content,
      created_at,
      updated_at,
      media,
      profiles:author_id (
        id,
        username,
        name,
        age,
        gender,
        location,
        avatar_url
      )
    `
    )
    .eq("id", id) // <-- use the awaited id
    .single<Post>();

  if (error || !data) {
    console.error("Error fetching post:", error);
    return <div className="p-6">Post not found</div>;
  }

  const post = data;
  const media = post.media ?? [];
  const author = post.profiles;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Post Title */}
        <h1 className="text-3xl font-extrabold mb-4">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(post.created_at).toLocaleString()}
        </p>

        {/* Author Info */}
        {author && (
          <div className="mb-6 flex items-center gap-2 text-sm">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={`${author.username}'s avatar`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300" />
            )}
            <p>
              By{" "}
              <Link
                href={`/profile/${author.username}`}
                className="text-blue-600 hover:underline"
              >
                {author.name || author.username || "Unknown"}
              </Link>
            </p>
          </div>
        )}

        {/* Post Content */}
        <article className="prose max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Post Media */}
        {media.length > 0 && (
          <section className="mt-8 grid gap-4">
            {media.map((m, i) => (
              <div
                key={i}
                className="rounded overflow-hidden border bg-white p-2"
              >
                {m.type?.startsWith("image/") ? (
                  <img
                    src={m.url}
                    alt={m.name || `media-${i}`}
                    className="w-full h-auto rounded"
                  />
                ) : m.type?.startsWith("video/") ? (
                  <video controls className="w-full rounded" src={m.url} />
                ) : (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download {m.name ?? `file-${i}`}
                  </a>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Comments Section */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <Comments postId={id} /> {/* <-- use awaited id */}
        </section>
      </main>
    </div>
  );
}
