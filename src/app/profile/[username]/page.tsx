

// // FILE: app/profile/[username]/page.tsx
// import React from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import TabsClient from "../[username]/TabsClient"; // client-side tabs UI

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

//   // Session user (may be null)
//   const {
//     data: { user: sessionUser },
//   } = await supabase.auth.getUser();

//   // Fetch profile by username (or 'me' fallback)
//   let profileRes = await supabase
//     .from("profiles")
//     .select("id, username, created_at, name, age, gender, location, avatar_url")
//     .eq("username", usernameOrSlug)
//     .maybeSingle();

//   if (!profileRes.data) {
//     if (usernameOrSlug === "me") {
//       if (!sessionUser) return notFound();
//       profileRes = await supabase
//         .from("profiles")
//         .select("id, username, created_at, name, age, gender, location, avatar_url")
//         .eq("id", sessionUser.id)
//         .maybeSingle();
//     } else {
//       // fallback: try by id
//       profileRes = await supabase
//         .from("profiles")
//         .select("id, username, created_at, name, age, gender, location, avatar_url")
//         .eq("id", usernameOrSlug)
//         .maybeSingle();
//     }
//   }

//   const profile = profileRes.data;
//   if (!profile) return notFound();

//   // Fetch posts for profile
//   const { data: postsData, error: postsError } = await supabase
//     .from("posts")
//     .select("id, title, content, created_at, media")
//     .eq("author_id", profile.id)
//     .order("created_at", { ascending: false });

//   if (postsError) {
//     console.error("Error loading posts for profile:", postsError);
//   }

//   const posts = postsData ?? [];

//   // comment count
//   const commentsCountRes = await supabase
//     .from("comments")
//     .select("*", { count: "exact", head: false })
//     .eq("author_id", profile.id);
//   const commentCount = commentsCountRes.count ?? 0;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b">
//         <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-6">
//           {/* Avatar */}
//           <div>
//             {profile.avatar_url ? (
//               <img
//                 src={profile.avatar_url}
//                 alt={`${profile.username}'s avatar`}
//                 className="w-24 h-24 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
//                 {profile.username?.charAt(0).toUpperCase() ?? "U"}
//               </div>
//             )}
//           </div>

//           {/* Profile info */}
//           <div className="flex-1">
//             <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
//               {profile.username}
//             </h1>

//             <p className="mt-2 text-sm text-gray-500">
//               Joined {formatDate(profile.created_at)} •{" "}
//               <span className="font-medium">{posts.length}</span> posts •{" "}
//               <span className="font-medium">{commentCount}</span> comments
//             </p>

//             <Link
//               href="/profile/edit"
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow mt-3 inline-block"
//             >
//               Edit Profile
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* TabsClient handles the action bar + tabbed content inline (client-side) */}
//       <TabsClient
//         profile={profile}
//         posts={posts}
//         sessionUserId={sessionUser?.id ?? null}
//       />

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
import TabsClient from "../[username]/TabsClient"; // client-side tabs UI

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

  // Session user (may be null)
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  // Fetch profile by username (or 'me' fallback)
  let profileRes = await supabase
    .from("profiles")
    .select(
      "id, username, created_at, name, age, gender, location, avatar_url"
    )
    .eq("username", usernameOrSlug)
    .maybeSingle();

  if (!profileRes.data) {
    if (usernameOrSlug === "me") {
      if (!sessionUser) return notFound();
      profileRes = await supabase
        .from("profiles")
        .select(
          "id, username, created_at, name, age, gender, location, avatar_url"
        )
        .eq("id", sessionUser.id)
        .maybeSingle();
    } else {
      // fallback: try by id
      profileRes = await supabase
        .from("profiles")
        .select(
          "id, username, created_at, name, age, gender, location, avatar_url"
        )
        .eq("id", usernameOrSlug)
        .maybeSingle();
    }
  }

  const profile = profileRes.data;
  if (!profile) return notFound();

  // Fetch posts for profile
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, title, content, created_at, media")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error loading posts for profile:", postsError);
  }

  const posts = postsData ?? [];

  // comment count
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
          <div>
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

          {/* Profile info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              {profile.username}
            </h1>

            {/* Extra author details */}
            <div className="mt-1 text-sm text-black-bold-700 space-y-1">
              {/* {profile.name && <p><span className="font-medium">Name:</span> {profile.name}</p>} */}
              {profile.age && <p><span className="font-medium">Age:</span> {profile.age}</p>}
              {profile.gender && (
                <p><span className="font-medium">Gender:</span> {profile.gender}</p>
              )}
              {profile.location && (
                <p><span className="font-medium">Location:</span> {profile.location}</p>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Joined {formatDate(profile.created_at)} •{" "}
              <span className="font-medium">{posts.length}</span> posts •{" "}
              <span className="font-medium">{commentCount}</span> comments
            </p>

            <Link
              href="/profile/edit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow mt-3 inline-block"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      {/* TabsClient handles the action bar + tabbed content inline (client-side) */}
      <TabsClient
        profile={profile}
        posts={posts}
        sessionUserId={sessionUser?.id ?? null}
      />

      <footer className="bg-white border-t mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MyBlog.
        </div>
      </footer>
    </div>
  );
}




