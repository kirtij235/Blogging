// // app/auth/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// export default function AuthPage() {
//   const router = useRouter();
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     let mounted = true;
//     // If already logged in on client, redirect to home
//     supabase.auth.getSession().then(({ data }) => {
//       if (!mounted) return;
//       if (data.session) router.replace("/");
//     });

//     const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//       // If a session appears (login succeeded), redirect
//       if (session) {
//         router.replace("/");
//       }
//     });

//     return () => {
//       mounted = false;
//       sub.subscription.unsubscribe();
//     };
//   }, [router]);

//   async function handleSignUp(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     setLoading(false);
//     if (error) {
//       setMessage(error.message);
//       return;
//     }

//     // If signUp produced a session (depends on Supabase settings), redirect
//     if (data?.session) {
//       router.replace("/");
//     } else {
//       // e.g., when email confirmation is required (no immediate session)
//       setMessage("Check your email to confirm your account (if confirmation is enabled).");
//     }
//   }

//   async function handleSignIn(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     setLoading(false);
//     if (error) {
//       setMessage(error.message);
//       return;
//     }
//     // If login created a session, redirect
//     if (data?.session) {
//       router.replace("/");
//     } else {
//       // edge-case: no session (should not happen for password login normally)
//       setMessage("Logged in (no session returned). Refreshing...");
//       router.replace("/");
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white border rounded shadow">
//         <h2 className="text-xl font-semibold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>

//         <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
//           <div>
//             <label className="block text-sm">Email</label>
//             <input
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full border p-2 rounded"
//               type="email"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </div>

//           <button
//             disabled={loading}
//             className="w-full py-2 rounded bg-blue-600 text-white"
//             type="submit"
//           >
//             {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm">
//           {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
//           <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 underline">
//             {isSignUp ? "Sign in" : "Sign up"}
//           </button>
//         </p>

//         {message && <div className="mt-3 text-sm text-red-600">{message}</div>}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // ✅ new state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) router.replace("/");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    // ✅ Insert into profiles table
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id, // match Supabase auth.uid
        email,
        name, // ✅ save name
      });
    }

    setLoading(false);

    if (data?.session) {
      router.replace("/");
    } else {
      setMessage("Check your email to confirm your account (if confirmation is enabled).");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data?.session) {
      router.replace("/");
    } else {
      setMessage("Logged in (no session returned). Refreshing...");
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white border rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                type="text"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 text-white"
            type="submit"
          >
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 underline">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        {message && <div className="mt-3 text-sm text-red-600">{message}</div>}
      </div>
    </div>
  );
}
