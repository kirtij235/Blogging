// FILE: app/page.tsx
import Link from "next/link";
import WelcomeClient from "../app/components/WelcomeClient";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import StartWritingButton from "./components/StartWritingButton"; // new button component


async function getPosts() {
const supabase = createServerComponentClient({ cookies: () => cookies() });  
const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      media,
      created_at,
      author_id,
      profiles!posts_author_id_fkey (
        id,
        username,
        name,
        age,
        gender,
        location,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data ?? [];
}

async function getUserProfile() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile?.name || null; // ✅ no email fallback, only name
}


export default async function HomePage() {
  const posts = await getPosts();
  const displayName = await getUserProfile(); // ✅ fetch name

  // Get current user (for follow button)
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
  {displayName ? `Welcome ${displayName}` : "Welcome"}{" "}
  <span className="text-blue-600">MyBlog</span>
</h1>

        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Share your thoughts, ideas, and stories with the world. Join the
          community and start writing today.
        </p>
        <WelcomeClient />
        <div className="mt-6">
          <StartWritingButton />
        </div>
      </section>

      {/* Posts List */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Posts</h2>

        {posts.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg">
              No posts yet. Be the first to{" "}
              <Link href="/auth" className="text-blue-600 underline">
                write a blog post
              </Link>
              !
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <article
                key={post.id}
                className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  {/* Media (optional thumbnail) */}
                  {Array.isArray(post.media) &&
                    post.media.length > 0 &&
                    post.media[0]?.url && (
                      <img
                        src={post.media[0].url}
                        alt="thumbnail"
                        className="w-28 h-20 object-cover rounded"
                      />
                    )}

                  {/* Post details */}
                  <div>
                    <Link
                      href={`/post/${post.id}`}
                      className="text-xl font-semibold text-gray-800 hover:underline"
                    >
                      {post.title}
                    </Link>

                    {/* ✅ Avatar + Author name */}
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      {post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
                          alt={`${post.profiles.username}'s avatar`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300" />
                      )}
                      By{" "}
                      {post.profiles?.username ? (
                        <>
                          <Link
                            href={`/author/${post.profiles.username}`}
                            className="text-blue-600 hover:underline"
                          >
                            {post.profiles.username}
                          </Link>
                        </>
                      ) : (
                        "unknown"
                      )}
                    </p>

                    <p className="mt-3 text-gray-700 line-clamp-3">
                      {String(post.content).slice(0, 180)}...
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MyBlog. Built with ❤️ using Next.js &
          Supabase
        </div>
      </footer>
    </div>
  );
}
