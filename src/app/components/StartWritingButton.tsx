// FILE: app/components/StartWritingButton.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function StartWritingButton() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    }
    loadUser();
  }, []);

  function handleClick() {
    if (user) {
      router.push("/editor");
    } else {
      router.push("/auth");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
    >
      ✍️ Start Writing
    </button>
  );
}
