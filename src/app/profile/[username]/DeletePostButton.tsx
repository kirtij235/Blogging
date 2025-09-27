"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("Error deleting post: " + error.message);
    } else {
      router.refresh(); // refresh the page after deletion
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-sm px-3 py-1 border rounded text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  );
}
