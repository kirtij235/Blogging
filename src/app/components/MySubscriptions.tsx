"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function MySubscriptionsButton() {
  const [open, setOpen] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Followers (who follows me)
      const { data: followersData } = await supabase
        .from("follows")
        .select("follower_id, profiles:follower_id(username, avatar_url, id)")
        .eq("following_id", user.id);

      setFollowers(followersData?.map((f) => f.profiles).filter(Boolean) ?? []);

      // Following (who I follow)
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id, profiles:following_id(username, avatar_url, id)")
        .eq("follower_id", user.id);

      setFollowing(followingData?.map((f) => f.profiles).filter(Boolean) ?? []);

      setLoading(false);
    };

    fetchData();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        My Subscriptions
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <h2 className="text-lg font-bold mb-4 text-gray-800">
              My Subscriptions
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-6">
                {/* Following */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">Following</h3>
                  {following.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      You are not following anyone.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {following.map((user) => (
                        <li
                          key={user.id}
                          className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                          )}
                          <Link
                            href={`/author/${user.username}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.username}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Followers */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">Followers</h3>
                  {followers.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No one is following you yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {followers.map((user) => (
                        <li
                          key={user.id}
                          className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                          )}
                          <Link
                            href={`/author/${user.username}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.username}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
