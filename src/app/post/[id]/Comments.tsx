"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ FIX: import Link

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    supabase
      .from("comments")
      .select("id, content, created_at, profiles(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data ?? []));
  }, [postId]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: postId, content: newComment, author_id: user.id }])
      .select("id, content, created_at, profiles(username)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
    }
  }

  return (
    <section className="mt-10">
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="p-3 bg-white border rounded">
            <p className="text-sm text-gray-700">{c.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              By {c.profiles?.username || "Anonymous"} •{" "}
              {new Date(c.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Write a comment..."
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm">
          <Link href="/auth" className="text-blue-600 underline">
            Login
          </Link>{" "}
          to add a comment.
        </p>
      )}
    </section>
  );
}
