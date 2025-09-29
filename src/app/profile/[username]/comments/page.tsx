// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
// import Link from "next/link";

// export default function UserCommentsPage() {
//   const params = useParams<{ username: string }>();
//   const router = useRouter();
//   const [user, setUser] = useState<any | null>(null);
//   const [comments, setComments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editText, setEditText] = useState("");

//   useEffect(() => {
//     async function load() {
//       const { data: auth } = await supabase.auth.getUser();
//       if (!auth.user) {
//         router.push("/auth");
//         return;
//       }
//       setUser(auth.user);

//       // Fetch user comments + related post
//       const { data, error } = await supabase
//         .from("comments")
//         .select("id, content, created_at, post_id, posts(title)")
//         .eq("author_id", auth.user.id)
//         .order("created_at", { ascending: false });

//       if (!error) setComments(data ?? []);
//       setLoading(false);
//     }
//     load();
//   }, [router]);

//   async function handleDelete(id: string) {
//     await supabase.from("comments").delete().eq("id", id);
//     setComments((prev) => prev.filter((c) => c.id !== id));
//   }

//   async function handleEdit(id: string) {
//     await supabase.from("comments").update({ content: editText }).eq("id", id);
//     setComments((prev) =>
//       prev.map((c) => (c.id === id ? { ...c, content: editText } : c))
//     );
//     setEditingId(null);
//     setEditText("");
//   }

//   if (loading) return <p className="p-6">Loading comments...</p>;

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-8">
//       <h1 className="text-2xl font-bold mb-6">Your Comments</h1>

//       {comments.length === 0 ? (
//         <p className="text-gray-500">You haven't commented on any posts yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {comments.map((c) => (
//             <div
//               key={c.id}
//               className="bg-white border rounded-lg p-4 flex justify-between items-start"
//             >
//               <div>
//                 {editingId === c.id ? (
//                   <textarea
//                     className="border rounded w-full p-2"
//                     value={editText}
//                     onChange={(e) => setEditText(e.target.value)}
//                   />
//                 ) : (
//                   <p className="text-gray-800">{c.content}</p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   On{" "}
//                   <Link
//                     href={`/post/${c.post_id}`}
//                     className="text-blue-600 underline"
//                   >
//                     {c.posts?.title || "View Post"}
//                   </Link>{" "}
//                   • {new Date(c.created_at).toLocaleString()}
//                 </p>
//               </div>

//               <div className="flex gap-2">
//                 {editingId === c.id ? (
//                   <>
//                     <button
//                       onClick={() => handleEdit(c.id)}
//                       className="px-3 py-1 bg-green-600 text-white rounded text-sm"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={() => setEditingId(null)}
//                       className="px-3 py-1 border rounded text-sm"
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => {
//                         setEditingId(c.id);
//                         setEditText(c.content);
//                       }}
//                       className="px-3 py-1 border rounded text-sm text-blue-600"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(c.id)}
//                       className="px-3 py-1 border rounded text-sm text-red-600"
//                     >
//                       Delete
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// FILE: app/profile/[username]/comments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function CommentsPanel({
  ownerId,
  compact,
}: {
  ownerId?: string; // if provided, show comments for this author; otherwise uses logged-in user
  compact?: boolean;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser ?? null);

      const authorId = ownerId ?? authUser?.id;
      if (!authorId) {
        setComments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, post_id, posts(title), author_id")
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });

      if (!error) setComments(data ?? []);
      setLoading(false);
    }
    load();
  }, [ownerId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleEditSave(id: string) {
    const { error } = await supabase.from("comments").update({ content: editText }).eq("id", id);
    if (!error) {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, content: editText } : c)));
      setEditingId(null);
      setEditText("");
    }
  }

  if (loading) return <p className="p-6">Loading comments...</p>;
  if (comments.length === 0) return <p className="text-gray-500">No comments found.</p>;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-white border rounded-lg p-4 flex justify-between items-start"
        >
          <div>
            {editingId === c.id ? (
              <textarea
                className="border rounded w-full p-2"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <p className="text-gray-800">{c.content}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              On{" "}
              <Link href={`/post/${c.post_id}`} className="text-blue-600 underline">
                {c.posts?.title || "View Post"}
              </Link>{" "}
              • {new Date(c.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            {editingId === c.id ? (
              <>
                <button
                  onClick={() => handleEditSave(c.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {user && user.id === c.author_id && (
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditText(c.content);
                    }}
                    className="px-3 py-1 border rounded text-sm text-blue-600"
                  >
                    Edit
                  </button>
                )}
                {user && user.id === c.author_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 border rounded text-sm text-red-600"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
