// FILE: app/post/[id]/page.tsx
import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Comments from "./Comments";

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch post and author profile
const { data, error } = await supabase
  .from("posts")
  .select(`
    id,
    title,
    content,
    created_at,
    author_id,
    media,
    profiles(id, username, name, age, gender, location, avatar_url)
  `)
  .eq("id", params.id);

const post = data?.[0] || null;
  // 👈 use single() since one post expected


  if (error || !post) return <div className="p-6">Post not found</div>;

  const media: { url: string; type: string; name?: string }[] = post.media ?? [];
  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

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
          <p className="mb-6 text-sm">
            By{" "}
            <Link
              href={`/profile/${author.username}`}
              className="text-blue-600 hover:underline"
            >
              {author.name || author.username || "Unknown"}
            </Link>
          </p>
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
                {m.type.startsWith("image/") ? (
                  <img
                    src={m.url}
                    alt={m.name || `media-${i}`}
                    className="w-full h-auto rounded"
                  />
                ) : m.type.startsWith("video/") ? (
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
          <Comments postId={params.id} />
        </section>
      </main>
    </div>
  );
}
