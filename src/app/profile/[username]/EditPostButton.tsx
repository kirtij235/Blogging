// FILE: app/profile/[username]/EditPostButton.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditPostButton({ post }: { post: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.media?.[0]?.url || "");
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // ✅ Upload image to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `posts/${post.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images") // ⚡ Make sure you created a bucket called "post-images"
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save updates
  const handleSave = async () => {
    const updates: any = { title, content };

    if (imageUrl) {
      updates.media = [{ url: imageUrl }]; // store media in array format
    }

    const { error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", post.id);

    if (error) {
      alert("Error updating post: " + error.message);
    } else {
      setIsOpen(false);
      router.refresh(); // reload updated post list
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm px-3 py-1 border rounded text-blue-600 hover:bg-blue-50"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Edit Post</h2>

            {/* Title */}
            <label className="block text-sm mb-2 font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 rounded mb-6"
            />

            {/* Content */}
            <label className="block text-sm mb-2 font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border p-3 rounded h-40 mb-6"
            />

            {/* Image Upload */}
            <label className="block text-sm mb-2 font-medium">Post Image</label>
            {imageUrl && (
              <div className="mb-4">
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="mb-6"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

