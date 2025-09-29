"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type FollowButtonProps = {
  authorId: string;
};

export default function FollowButton({ authorId }: FollowButtonProps) {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Effect 1: Check login/session
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setCurrentUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setCurrentUserId(session?.user?.id ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Effect 2: Check if already following
  useEffect(() => {
    if (!currentUserId || !authorId || currentUserId === authorId) {
      setIsFollowing(false);
      return;
    }

    let mounted = true;
    const checkFollow = async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", authorId)
        .maybeSingle();

      if (mounted) {
        if (error) {
          console.error("Error checking follow:", error.message);
        }
        setIsFollowing(!!data);
      }
    };

    checkFollow();
    return () => {
      mounted = false;
    };
  }, [currentUserId, authorId]);

  // ✅ Toggle follow/unfollow
  const toggleFollow = async () => {
    if (!currentUserId) {
      router.push("/auth");
      return;
    }
    if (currentUserId === authorId) return;

    setLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", authorId);

      if (error) {
        console.error("Error unfollowing:", error.message);
      } else {
        setIsFollowing(false);
      }
    } else {
      const { error } = await supabase.from("follows").insert([
        {
          follower_id: currentUserId,
          following_id: authorId,
        },
      ]);

      if (error) {
        console.error("Error following:", error.message);
      } else {
        setIsFollowing(true);
      }
    }

    setLoading(false);
  };

  // ❌ Hide button if self
  if (currentUserId && currentUserId === authorId) return null;

  if (loading) {
    return (
      <button
        disabled
        className="ml-2 px-3 py-1 text-sm rounded bg-gray-200 text-gray-500"
      >
        ...
      </button>
    );
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`ml-2 px-3 py-1 text-sm rounded transition-colors ${
        isFollowing
          ? "bg-blue-300 text-black-700 hover:bg-blue-400"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
