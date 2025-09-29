

// // FILE: app/components/MySubscriptions.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import Link from "next/link";
// import FollowButton from "./FollowButton";

// export default function MySubscriptions({ ownerId }: { ownerId?: string }) {
//   const [loading, setLoading] = useState(false);
//   const [followers, setFollowers] = useState<any[]>([]);
//   const [following, setFollowing] = useState<any[]>([]);
//   const [sessionUserId, setSessionUserId] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);

//       // If ownerId not provided, fall back to current logged-in user
//       let targetId = ownerId;
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!targetId) {
//         if (!user) {
//           setFollowers([]);
//           setFollowing([]);
//           setLoading(false);
//           return;
//         }
//         targetId = user.id;
//       }
//       setSessionUserId(user?.id ?? null);

//       // Followers (who follow target)
//       const { data: followersData } = await supabase
//         .from("follows")
//         .select("follower_id, profiles:follower_id(username, avatar_url, id)")
//         .eq("following_id", targetId);

//       // Following (who target follows)
//       const { data: followingData } = await supabase
//         .from("follows")
//         .select("following_id, profiles:following_id(username, avatar_url, id)")
//         .eq("follower_id", targetId);

//       setFollowers(followersData?.map((f) => f.profiles).filter(Boolean) ?? []);
//       setFollowing(followingData?.map((f) => f.profiles).filter(Boolean) ?? []);
//       setLoading(false);
//     }

//     fetchData();
//   }, [ownerId]);

//   if (loading) return <p className="p-6">Loading subscriptions...</p>;

//   return (
//     <div>
//       <h3 className="font-semibold mb-4 text-gray-800 text-lg">
//         Followers & Following
//       </h3>

//       <div className="overflow-x-auto border rounded-lg">
//         <table className="w-full text-sm border-collapse">
//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="px-4 py-2 w-1/2">Following</th>
//               <th className="px-4 py-2 w-1/2">Followers</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="align-top">
//               {/* Following column */}
//               <td className="px-4 py-3 border-r">
//                 {following.length === 0 ? (
//                   <p className="text-gray-500 text-sm">Not following anyone.</p>
//                 ) : (
//                   <ul className="space-y-3">
//                     {following.map((user) => (
//                       <li
//                         key={user.id}
//                         className="flex items-center gap-3 bg-gray-50 p-2 rounded"
//                       >
//                         {user.avatar_url ? (
//                           <img
//                             src={user.avatar_url}
//                             alt={user.username}
//                             className="w-8 h-8 rounded-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-8 h-8 rounded-full bg-gray-200" />
//                         )}
//                         <Link
//                           href={`/author/${user.username}`}
//                           className="text-blue-600 hover:underline font-medium"
//                         >
//                           {user.username}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </td>

//               {/* Followers column */}
//               <td className="px-4 py-3">
//                 {followers.length === 0 ? (
//                   <p className="text-gray-500 text-sm">No followers yet.</p>
//                 ) : (
//                   <ul className="space-y-3">
//                     {followers.map((user) => (
//                       <li
//                         key={user.id}
//                         className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded"
//                       >
//                         <div className="flex items-center gap-3">
//                           {user.avatar_url ? (
//                             <img
//                               src={user.avatar_url}
//                               alt={user.username}
//                               className="w-8 h-8 rounded-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-8 h-8 rounded-full bg-gray-200" />
//                           )}
//                           <Link
//                             href={`/author/${user.username}`}
//                             className="text-blue-600 hover:underline font-medium"
//                           >
//                             {user.username}
//                           </Link>
//                         </div>

//                         {/* Follow Back button */}
//                         {sessionUserId && sessionUserId !== user.id && (
//                           <FollowButton authorId={user.id} />
//                         )}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import FollowButton from "./FollowButton";

export default function MySubscriptions({ ownerId }: { ownerId?: string }) {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // If ownerId not provided, fall back to current logged-in user
      let targetId = ownerId;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!targetId) {
        if (!user) {
          setFollowers([]);
          setFollowing([]);
          setLoading(false);
          return;
        }
        targetId = user.id;
      }
      setSessionUserId(user?.id ?? null);

      // Followers (who follow target)
      const { data: followersData } = await supabase
        .from("follows")
        .select("follower_id, profiles:follower_id(username, avatar_url, id)")
        .eq("following_id", targetId);

      // Following (who target follows)
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id, profiles:following_id(username, avatar_url, id)")
        .eq("follower_id", targetId);

      setFollowers(followersData?.map((f) => f.profiles).filter(Boolean) ?? []);
      setFollowing(followingData?.map((f) => f.profiles).filter(Boolean) ?? []);
      setLoading(false);
    }

    fetchData();
  }, [ownerId]);

  if (loading) return <p className="p-6">Loading subscriptions...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-4 text-gray-800 text-lg">
        Followers & Following
      </h3>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 w-1/2">Following</th>
              <th className="px-4 py-2 w-1/2">Followers</th>
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              {/* Following column */}
              <td className="px-4 py-3 border-r">
                {following.length === 0 ? (
                  <p className="text-gray-500 text-sm">Not following anyone.</p>
                ) : (
                  <ul className="space-y-3">
                    {following.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200" />
                          )}
                          <Link
                            href={`/author/${user.username}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {user.username}
                          </Link>
                        </div>

                        {/* ✅ Unfollow button (toggle) */}
                        {sessionUserId && sessionUserId !== user.id && (
                          <FollowButton authorId={user.id} />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </td>

              {/* Followers column */}
              <td className="px-4 py-3">
                {followers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No followers yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {followers.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between gap-3 bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200" />
                          )}
                          <Link
                            href={`/author/${user.username}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {user.username}
                          </Link>
                        </div>

                        {/* ✅ Follow back button */}
                        {sessionUserId && sessionUserId !== user.id && (
                          <FollowButton authorId={user.id} />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


