// app/profile/[username]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image"; // Add this import

// Helper to format date nicely
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

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const usernameOrSlug = params.username;

  const supabase = createServerComponentClient({ cookies });

  // Get session user (if any)
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  // 1) Try to find profile by username (fetch avatar_url too)
  let profileRes = await supabase
    .from("profiles")
    .select("id, username, created_at, name, age, gender, location, avatar_url")
    .eq("username", usernameOrSlug)
    .maybeSingle();

  // 2) If not found and param === 'me' -> fetch current user's profile
  if (!profileRes.data) {
    if (usernameOrSlug === "me") {
      if (!sessionUser) return notFound();
      profileRes = await supabase
        .from("profiles")
        .select("id, username, created_at, name, age, gender, location")
        .eq("id", sessionUser.id)
        .maybeSingle();
    } else {
      // 3) Try lookup by id
      profileRes = await supabase
        .from("profiles")
        .select("id, username, created_at, name, age, gender, location")
        .eq("id", usernameOrSlug)
        .maybeSingle();
    }
  }

  const profile = profileRes.data;
  if (!profile) return notFound();

  const isOwner = !!sessionUser && sessionUser.id === profile.id;

  // ✅ Fetch posts safely
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, title, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error loading posts for profile:", postsError);
  }

  const posts =
    postsData ?? ([] as { id: string; title: string; content: string; created_at: string }[]);

  // Get counts
  const postCount = posts.length;
  const commentsCountRes = await supabase
    .from("comments")
    .select("*", { count: "exact", head: false })
    .eq("author_id", profile.id);

  const commentCount = commentsCountRes.count ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              profile.username?.charAt(0).toUpperCase() ?? "U"
            )}
          </div>

          {/* Profile info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                {profile.username}
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Joined {formatDate(profile.created_at)} •{" "}
              <span className="font-medium">{postCount}</span> posts •{" "}
              <span className="font-medium">{commentCount}</span> comments
            </p>

            {/* Extra profile fields */}
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

            <p className="mt-4 text-gray-600 max-w-2xl">
              {isOwner
                ? "This is your public profile. Your posts and comments are visible to everyone."
                : `Read ${profile.username}'s latest posts and contributions.`}
            </p>
          </div>
        </div>
      </header>

      {/* Action bar */}
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-3 py-2 bg-white rounded shadow-sm">All posts</span>
          <Link
            href={`/profile/${profile.username}?tab=about`}
            className="px-3 py-2 rounded hover:bg-gray-100"
          >
            About
          </Link>
          <Link
            href={`/profile/${profile.username}?tab=comments`}
            className="px-3 py-2 rounded hover:bg-gray-100"
          >
            Comments
          </Link>
          
            <Link
              href="/profile/edit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow"
            >
              Edit Profile
            </Link>
        
        </div>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <Link
              href="/editor"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write a new post
            </Link>
          ) : (
            <button className="px-4 py-2 border rounded-lg">Follow</button>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Posts by {profile.username}
          </h2>

          {postCount === 0 ? (
            <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
              <p className="mb-2">No posts yet.</p>
              {isOwner ? (
                <Link
                  href="/editor"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Write your first post
                </Link>
              ) : (
                <p>Check back later or explore other authors.</p>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link
                        href={`/post/${post.id}`}
                        className="text-lg font-semibold text-gray-800"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(post.created_at).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Edit link only for owner */}
                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/editor?postId=${post.id}`}
                          className="text-sm px-3 py-1 border rounded text-blue-600"
                        >
                          Edit
                        </Link>
                        <button
                          className="text-sm px-3 py-1 border rounded text-red-600"
                          disabled
                          title="Delete (implement server action)"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-gray-700 line-clamp-3">
                    {String(post.content).slice(0, 300)}...
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MyBlog.
        </div>
      </footer>
    </div>
  );
}



