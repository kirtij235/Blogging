// FILE: app/components/PostEditor.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type MediaItem = { url: string; type: string; name?: string; path?: string };

export default function PostEditor({ existingPost }: { existingPost?: any }) {
  const [title, setTitle] = useState(existingPost?.title ?? "");
  const [content, setContent] = useState(existingPost?.content ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<MediaItem[]>(existingPost?.media ?? []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      // revoke object URLs
      preview.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch (e) {}
      });
    };
  }, [preview]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files;
    if (!chosen) return;
    const arr = Array.from(chosen);
    setFiles((s) => s.concat(arr));

    // generate previews (local blob urls)
    const newPreviews = arr.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type,
      name: f.name,
    }));
    setPreview((p) => p.concat(newPreviews));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      setMessage("You must be logged in to create a post.");
      setLoading(false);
      return;
    }

    const uploaded: MediaItem[] = [];

    for (const f of files) {
      console.log("Uploading file", f);
      try {
        const timestamp = Date.now();
        const safeName = `${timestamp}_${Math.random()
          .toString(36)
          .slice(2, 8)}_${f.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const path = `${user.id}/${safeName}`;
        console.log("Storage path:", path);

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(path, f, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          setMessage(`Failed to upload ${f.name}: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from("post-media")
          .getPublicUrl(path);
        console.log("Public URL for", path, publicData);

        const url = publicData.publicUrl;

        // Verify URL works (HEAD request)
        try {
          const res = await fetch(url, { method: "HEAD" });
          console.log("VERIFY", path, res.status);
        } catch (err) {
          console.warn("Could not HEAD public url:", err);
        }

        uploaded.push({ url, type: f.type, name: f.name, path });
      } catch (err: any) {
        console.error("Upload error", err);
        setMessage(`Failed to upload ${f.name}: ${err.message ?? err}`);
        setLoading(false);
        return; // stop the whole operation to avoid partial DB entries
      }
    }

    // Only insert post if all uploads succeeded (or there were no files)
    const { data: insertData, error: insertError } = await supabase
      .from("posts")
      .insert([{ title, content, author_id: user.id, media: uploaded }])
      .select()
      .single();

    console.log("Inserted post result:", insertData, insertError);

    if (insertError) {
      console.error("Insert post error:", insertError);
      setMessage("Failed to save post: " + insertError.message);
      setLoading(false);
      return;
    }

    setMessage("Post created successfully!");
    setLoading(false);
    router.push(`/post/${insertData.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm">
      {message && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-800">
          {message}
        </div>
      )}

      <label className="block mb-2 text-sm font-medium">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border rounded"
        placeholder="Post title"
        required
      />

      <label className="block mb-2 text-sm font-medium">
        Content (Markdown)
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mb-4 p-3 border rounded h-48"
        placeholder="Write your post in markdown..."
        required
      />

      <label className="block mb-2 text-sm font-medium">
        Media (images / videos) — optional
      </label>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFiles}
        className="mb-4"
      />

      {preview.length > 0 && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {preview.map((p, i) => (
            <div
              key={i}
              className="border rounded overflow-hidden p-1 bg-white"
            >
              {p.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <video src={p.url} className="w-full h-32" muted />
              )}
              <div className="text-xs mt-1 text-gray-600">{p.name}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
