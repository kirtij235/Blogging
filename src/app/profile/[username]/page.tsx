// // FILE: app/profile/[username]/page.tsx
// import React from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import DeletePostButton from "./DeletePostButton"; // ✅ Import client delete button
// import EditPostButton from "./EditPostButton";
// import MySubscriptionsButton from "../../components/MySubscriptions";
// import FollowButton from "@/app/components/FollowButton";

// // Helper to format date nicely
// function formatDate(iso?: string | null) {
//   if (!iso) return "";
//   try {
//     return new Date(iso).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//     });
//   } catch {
//     return iso;
//   }
// }

// export default async function ProfilePage({
//   params,
// }: {
//   params: { username: string };
// }) {
//   const usernameOrSlug = params.username;
//   const supabase = createServerComponentClient({ cookies });

//   // Session user
//   const {
//     data: { user: sessionUser },
//   } = await supabase.auth.getUser();

//   // Fetch profile
//   let profileRes = await supabase
//     .from("profiles")
//     .select("id, username, created_at, name, age, gender, location, avatar_url")
//     .eq("username", usernameOrSlug)
//     .maybeSingle();

//   // 2) If not found and param === 'me' -> fetch current user's profile
//   if (!profileRes.data) {
//     if (usernameOrSlug === "me") {
//       if (!sessionUser) return notFound();
//     profileRes = await supabase
//       .from("profiles")
//       .select("id, username, created_at, name, age, gender, location, avatar_url")
//       .eq("id", sessionUser.id)
//       .maybeSingle();
//     } else {
//       // 3) Try lookup by id
//       profileRes = await supabase
//         .from("profiles")
//         .select("id, username, created_at, name, age, gender, location")
//         .eq("id", usernameOrSlug)
//         .maybeSingle();
//     }
//   }

//   const profile = profileRes.data;
//   if (!profile) return notFound();
//   const isOwner = !!sessionUser && sessionUser.id === profile.id;

//   // ✅ Fetch posts with media
//   const { data: postsData, error: postsError } = await supabase
//     .from("posts")
//     .select("id, title, content, created_at, media")
//     .eq("author_id", profile.id)
//     .order("created_at", { ascending: false });

//   if (postsError) {
//     console.error("Error loading posts for profile:", postsError);
//   }

//   const posts =
//     postsData ??
//     ([] as { id: string; title: string; content: string; created_at: string; media?: any }[]);

//   // Counts
//   const postCount = posts.length;
//   const commentsCountRes = await supabase
//     .from("comments")
//     .select("*", { count: "exact", head: false })
//     .eq("author_id", profile.id);

//   const commentCount = commentsCountRes.count ?? 0;

// let followers: any[] = [];
// if (isOwner) {
//   const { data: followerData } = await supabase
//     .from("follows")
//     .select("follower_id, profiles:follower_id(username, avatar_url, id)")
//     .eq("following_id", profile.id);

//   followers = followerData?.map((f) => f.profiles).filter(Boolean) ?? [];
// }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b">
//         <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-6">
//           {/* Avatar */}
//           <div className="flex flex-col items-center">
//             {profile.avatar_url ? (
//               <img
//                 src={profile.avatar_url}
//                 alt={`${profile.username}'s avatar`}
//                 className="w-24 h-24 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
//                 {profile.username?.charAt(0).toUpperCase() ?? "U"}
//               </div>
//             )}
//           </div>

//           {/* Profile info */}
//           <div className="flex-1">
//             <div className="flex items-center gap-4">
//               <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
//                 {profile.username}
//               </h1>
//             </div>

//             <p className="mt-2 text-sm text-gray-500">
//               Joined {formatDate(profile.created_at)} •{" "}
//               <span className="font-medium">{postCount}</span> posts •{" "}
//               <span className="font-medium">{commentCount}</span> comments
//             </p>

//             {/* Extra fields */}
//             <div className="mt-4 text-gray-700 space-y-1">
//               {profile.name && (
//                 <p>
//                   <strong>Name:</strong> {profile.name}
//                 </p>
//               )}
//               {profile.age && (
//                 <p>
//                   <strong>Age:</strong> {profile.age}
//                 </p>
//               )}
//               {profile.gender && (
//                 <p>
//                   <strong>Gender:</strong> {profile.gender}
//                 </p>
//               )}
//               {profile.location && (
//                 <p>
//                   <strong>Location:</strong> {profile.location}
//                 </p>
//               )}
//             </div>

//             <Link
//               href="/profile/edit"
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow"
//             >
//               Edit Profile
//             </Link>

//             <p className="mt-4 text-gray-600 max-w-2xl">
//               {isOwner
//                 ? "This is your public profile. Your posts and comments are visible to everyone."
//                 : `Read ${profile.username}'s latest posts and contributions.`}
//             </p>
//           </div>
//         </div>
//       </header>

//       {/* Action bar */}
//       <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
//         <div className="flex items-center gap-2 text-sm text-gray-600">
//           <span className="px-3 py-2 bg-white rounded shadow-sm">My posts</span>
//           <Link
//             href={`/profile/${profile.username}/comments`}
//             className="px-3 py-2 rounded hover:bg-gray-100"
//           >
//             My Comments
//           </Link>
//         </div>
//         <div className="flex items-center gap-2">

// <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-2">
//   {profile.username}
//   {isOwner ? (
//     <MySubscriptionsButton />
//   ) : (
//     // ✅ pass sessionUser?.id to the client FollowButton
//     <FollowButton authorId={profile.id} currentUserId={sessionUser?.id ?? null} />
//   )}
// </h1>
// // ...

// </div>

//       </div>

//       {/* Main content */}
//       <main className="max-w-5xl mx-auto px-6 py-8">
//         <section>
//           <h2 className="text-xl font-bold text-gray-800 mb-4">
//             Posts by {profile.username}
//           </h2>

//           {postCount === 0 ? (
//             <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
//               <p className="mb-2">No posts yet.</p>
//               {isOwner ? (
//                 <Link
//                   href="/editor"
//                   className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
//                 >
//                   Write your first post
//                 </Link>
//               ) : (
//                 <p>Check back later or explore other authors.</p>
//               )}
//             </div>
//           ) : (
//             <div className="grid gap-6">
//               {posts.map((post) => (
//                 <article
//                   key={post.id}
//                   className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
//                 >
//                   <div className="flex gap-4 items-start">
//                     {/* Media (optional) */}
//                     {Array.isArray(post.media) &&
//                       post.media.length > 0 &&
//                       post.media[0]?.url && (
//                         <img
//                           src={post.media[0].url}
//                           alt="thumbnail"
//                           className="w-28 h-20 object-cover rounded"
//                         />
//                       )}

//                     <div className="flex-1">
//                       <div className="flex justify-between items-start gap-4">
//                         <div>
//                           <Link
//                             href={`/post/${post.id}`}
//                             className="text-lg font-semibold text-gray-800 hover:underline"
//                           >
//                             {post.title}
//                           </Link>
//                           <p className="text-sm text-gray-500 mt-1">
//                             {new Date(post.created_at).toLocaleString(undefined, {
//                               year: "numeric",
//                               month: "short",
//                               day: "numeric",
//                             })}
//                           </p>
//                         </div>

//                         {/* Only show Edit & Delete if isOwner */}
//                         {/* ✅ Edit & Delete buttons */}
//                         <div className="flex items-center gap-2">
//                           <EditPostButton post={post} />
//                           <DeletePostButton postId={post.id} />
//                         </div>
//                       </div>

//                       <p className="mt-4 text-gray-700 line-clamp-3">
//                         {String(post.content).slice(0, 300)}...
//                       </p>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}
//         </section>

//        {/* Followers section */}
// <section id="followers" className="max-w-5xl mx-auto px-6 py-8">
//   <h2 className="text-lg font-bold mb-4">People following {profile.username}</h2>
//   {isOwner ? (
//     followers.length === 0 ? (
//       <p className="text-gray-500">No one is following you yet.</p>
//     ) : (
//       <ul className="grid gap-4">
//         {followers.map((follower) => (
//           <li key={follower.id} className="flex items-center gap-3 bg-white p-3 rounded shadow">
//             {follower.avatar_url ? (
//               <img
//                 src={follower.avatar_url}
//                 alt={follower.username}
//                 className="w-8 h-8 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-8 h-8 rounded-full bg-gray-200" />
//             )}
//             <Link
//               href={`/author/${follower.username}`}
//               className="text-blue-600 hover:underline"
//             >
//               {follower.username}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     )
//   ) : (
//     <p className="text-gray-500">Followers are only visible to the profile owner.</p>
//   )}
// </section>
//      </main>

//       <footer className="bg-white border-t mt-12">
//         <div className="max-w-5xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
//           © {new Date().getFullYear()} MyBlog.
//         </div>
//       </footer>
//     </div>
//   );
// }



// FILE: app/profile/[username]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import DeletePostButton from "./DeletePostButton"; 
import EditPostButton from "./EditPostButton";
import MySubscriptionsButton from "../../components/MySubscriptions";

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

  // Session user
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  // Fetch profile
  let profileRes = await supabase
    .from("profiles")
    .select("id, username, created_at, name, age, gender, location, avatar_url")
    .eq("username", usernameOrSlug)
    .maybeSingle();

  // If not found and param === 'me' -> fetch current user's profile
  if (!profileRes.data) {
    if (usernameOrSlug === "me") {
      if (!sessionUser) return notFound();
      profileRes = await supabase
        .from("profiles")
        .select("id, username, created_at, name, age, gender, location, avatar_url")
        .eq("id", sessionUser.id)
        .maybeSingle();
    } else {
      // Try lookup by id
      profileRes = await supabase
        .from("profiles")
        .select("id, username, created_at, name, age, gender, location")
        .eq("id", usernameOrSlug)
        .maybeSingle();
    }
  }

  const profile = profileRes.data;
  if (!profile) return notFound();

  // ✅ Fetch posts with media
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, title, content, created_at, media")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error loading posts for profile:", postsError);
  }

  const posts =
    postsData ?? ([] as { id: string; title: string; content: string; created_at: string; media?: any }[]);

  // Counts
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
          <div className="flex flex-col items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.username}'s avatar`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
                {profile.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
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

            {/* Extra fields */}
            <div className="mt-4 text-gray-700 space-y-1">
              {profile.name && <p><strong>Name:</strong> {profile.name}</p>}
              {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
              {profile.gender && <p><strong>Gender:</strong> {profile.gender}</p>}
              {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
            </div>

            <Link
              href="/profile/edit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow"
            >
              Edit Profile
            </Link>                                                                             

          </div>
        </div>
      </header>

      {/* Action bar */}
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-3 py-2 bg-white rounded shadow-sm">My posts</span>
          <Link
            href={`/profile/${profile.username}/comments`}
            className="px-3 py-2 rounded hover:bg-gray-100"
          >
            My Comments
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Always show subscriptions button on own profile */}
          <MySubscriptionsButton />
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
              <Link
                href="/editor"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex gap-4 items-start">
                    {/* Media (optional) */}
                    {Array.isArray(post.media) && post.media.length > 0 && post.media[0]?.url && (
                      <img
                        src={post.media[0].url}
                        alt="thumbnail"
                        className="w-28 h-20 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link
                            href={`/post/${post.id}`}
                            className="text-lg font-semibold text-gray-800 hover:underline"
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

                        {/* Edit & Delete buttons */}
                        <div className="flex items-center gap-2">
                          <EditPostButton post={post} />
                          <DeletePostButton postId={post.id} />
                        </div>
                      </div>

                      <p className="mt-4 text-gray-700 line-clamp-3">
                        {String(post.content).slice(0, 300)}...
                      </p>
                    </div>
                  </div>
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
