

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import FollowButton from "../../components/FollowButton";
import MySubscriptionsButton from "../../components/MySubscriptions";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default async function AuthorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  // Fetch author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, created_at, name, age, gender, location, avatar_url")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) return notFound();

  const isOwner = sessionUser?.id === profile.id;

  // Fetch posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, media, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-6">
          <div className="flex flex-col items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.username}'s avatar`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {profile.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2">
              {profile.username}
              {isOwner ? (
                <MySubscriptionsButton />
              ) : (
                <FollowButton authorId={profile.id} />
              )}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Joined {formatDate(profile.created_at)}
            </p>
            <div className="mt-4 text-gray-700 space-y-1">
              {profile.name && (
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
              )}
              {profile.age && (
                <p>
                  <strong>Age:</strong> {profile.age}
                </p>
              )}
              {profile.gender && (
                <p>
                  <strong>Gender:</strong> {profile.gender}
                </p>
              )}
              {profile.location && (
                <p>
                  <strong>Location:</strong> {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Posts by {profile.username}
        </h2>
        {!posts || posts.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
            No posts yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  {Array.isArray(post.media) &&
                    post.media.length > 0 &&
                    post.media[0]?.url && (
                      <img
                        src={post.media[0].url}
                        alt="thumbnail"
                        className="w-28 h-20 object-cover rounded"
                      />
                    )}
                  <div>
                    <Link
                      href={`/post/${post.id}`}
                      className="text-lg font-semibold text-gray-800 hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-3 text-gray-700 line-clamp-3">
                      {String(post.content).slice(0, 300)}...
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}



