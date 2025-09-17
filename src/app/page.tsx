// // FILE: app/page.tsx
// import Link from "next/link";
// import NavbarClient from "../app/components/NavbarClient";
// import WelcomeClient from "../app/components/WelcomeClient";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// async function getPosts() {
//   const supabase = createServerComponentClient({ cookies });

//   const { data, error } = await supabase
//     .from("posts")
//     .select("id, title, content, media, created_at, author_id, profiles(username)")
//     .order("created_at", { ascending: false });

//   if (error) {
//     console.error("Error fetching posts:", error);
//     return [];
//   }
//   return data ?? [];
// }

// export default async function HomePage() {
//   const posts = await getPosts();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <NavbarClient />
//       {/* Hero Section */}
//       <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 text-center">
//         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
//           Welcome to <span className="text-blue-600">MyBlog</span>
//         </h1>
//         <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//           Share your thoughts, ideas, and stories with the world. Join the
//           community and start writing today.
//         </p>
//         <WelcomeClient />
//         <div className="mt-6">
//           <Link href="/auth">
//             <button
//               className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
//             >
//               ✍️ Start Writing
//             </button>
//           </Link>
//         </div>
//       </section>

//       {/* Posts List */}
//       <main className="max-w-4xl mx-auto px-6 py-12">
//         <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Posts</h2>

//         {posts.length === 0 ? (
//           <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
//             <p className="text-gray-600 text-lg">
//               No posts yet. Be the first to{" "}
//               <Link
//                 href="/auth"
//                 className="text-blue-600 underline"
//               >
//                 write a blog post
//               </Link>
//               !
//             </p>
//           </div>
//         ) : (
//           <div className="grid gap-6">
//             {posts.map((post: any) => (
//               <Link
//                 key={post.id}
//                 href={`/post/${post.id}`}
//                 className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
//               >
//                 <div className="flex gap-4 items-start">
//                   {post.media?.length > 0 && post.media[0]?.url ? (
//                     <img
//                       src={post.media[0].url}
//                       alt="thumb"
//                       className="w-28 h-20 object-cover rounded"
//                     />
//                   ) : (
//                     <div className="w-28 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
//                       No media
//                     </div>
//                   )}
//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {post.title}
//                     </h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       By{" "}
//                       <span className="text-blue-600 hover:underline">
//                         {post.profiles?.username || "unknown"}
//                       </span>
//                     </p>
//                     <p className="mt-3 text-gray-700 line-clamp-3">
//                       {String(post.content).slice(0, 180)}...
//                     </p>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t mt-12">
//         <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
//           © {new Date().getFullYear()} MyBlog. Built with ❤️ using Next.js & Supabase
//         </div>
//       </footer>
//     </div>
//   );
// }


// FILE: app/page.tsx
import Link from "next/link";
import WelcomeClient from "../app/components/WelcomeClient";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import StartWritingButton from "./components/StartWritingButton"; // new button component

async function getPosts() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, media, created_at, author_id, profiles(username)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Welcome to <span className="text-blue-600">MyBlog</span>
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
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  {/* Media section (optional) */}
                 {Array.isArray(post.media) && post.media.length > 0 && post.media[0]?.url && (
                      <img
                        src={post.media[0].url}
                        alt="thumbnail"
                        className="w-28 h-20 object-cover rounded"
                      />
                    )}


                  {/* Post details */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      By{" "}
                      <span className="text-blue-600 hover:underline">
                        {post.profiles?.username || "unknown"}
                      </span>
                    </p>
                    <p className="mt-3 text-gray-700 line-clamp-3">
                      {String(post.content).slice(0, 180)}...
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MyBlog. Built with ❤️ using Next.js & Supabase
        </div>
      </footer>
    </div>
  );
}
