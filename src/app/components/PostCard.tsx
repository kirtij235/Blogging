"use client";

import Link from "next/link";
import React from "react";

export default function PostCard({ post }: any) {
  const thumbnail = post.media?.[0]?.url;

  return (
    <Link
      href={`/post/${post.id}`}
      className="block p-4 bg-white rounded shadow hover:shadow-md transition"
    >
      <div className="flex gap-4">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt="thumb"
            className="w-28 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-28 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            No media
          </div>
        )}

        <div>
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm mt-2 text-gray-700 line-clamp-2">
            {String(post.content).slice(0, 140)}...
          </p>
        </div>
      </div>
    </Link>
  );
}
