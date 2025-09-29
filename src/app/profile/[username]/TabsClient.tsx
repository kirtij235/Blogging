

"use client";

import React, { useState } from "react";
import Link from "next/link";
import CommentsPanel from "./comments/page";
import MySubscriptions from "../../components/MySubscriptions";
import EditPostButton from "./EditPostButton";
import DeletePostButton from "./DeletePostButton";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  username: string;
  avatar_url?: string | null;
  created_at?: string | null;
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
};

export default function TabsClient({
  profile,
  posts,
  sessionUserId,
}: {
  profile: Profile;
  posts: any[];
  sessionUserId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "subscriptions">("posts");

  return (
    <>
      {/* Action bar */}
      <div className="max-w-5xl mx-auto px-6 py-4 border-b">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === "posts" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            My Posts
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === "comments" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            My Comments
          </button>

          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === "subscriptions" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            My Subscriptions
          </button>
        </div>
      </div>
        
      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* POSTS */}
        {activeTab === "posts" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Posts by {profile.username}</h2>

            {posts.length === 0 ? (
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
                      {/* Thumbnail */}
                      {post.media?.[0]?.url && (
                        <img
                          src={post.media[0].url}
                          alt="thumbnail"
                          className="w-20 h-20 object-cover rounded"
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

                          {/* Edit & Delete buttons (owner only) */}
                          {/* {sessionUserId && sessionUserId === profile.id && ( */}
                            <div className="flex items-center gap-2">
                              <EditPostButton post={post} />
                              <DeletePostButton postId={post.id} />
                            </div>
                          {/* )} */}
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
        )}
        
        {/* COMMENTS */}
        {activeTab === "comments" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Comments by {profile.username}</h2>
            <CommentsPanel ownerId={profile.id} />
          </section>
        )}
        
        {/* SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
            <MySubscriptions ownerId={profile.id} />
          </section>
        )}
      </main>
    </>
  );
}


