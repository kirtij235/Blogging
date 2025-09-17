"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NavbarClient() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
      return;
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MyBlog
        </Link>

        <div className="space-x-6 text-gray-700 font-medium flex items-center">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
        <Link
  href={user ? "/editor" : "/auth"}
  className="hover:text-blue-600"
>
  Post
</Link>


          {user ? (
            <>
              {/* ✅ Fix: use username if available, fallback to id */}
              <Link
                href={`/profile/${user.user_metadata?.username || user.id}`}
                className="hover:text-blue-600"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Signup / Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
