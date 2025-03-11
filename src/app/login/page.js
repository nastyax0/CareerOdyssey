"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

 
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {/* Email Input */}
      <input
        type="email"
        placeholder="Email"
        className="p-2 border rounded w-80 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password Input */}
      <input
        type="password"
        placeholder="Password"
        className="p-2 border rounded w-80 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Email Login Button */}
      <button className="bg-blue-500 text-white p-2 rounded w-80 mb-4" onClick={handleLogin}>
        Sign In
      </button>

      {/* Divider */}
      <div className="text-gray-500 mb-4">OR</div>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center w-80 border rounded p-2 bg-white shadow hover:bg-gray-100 transition"
      >
        <FcGoogle className="text-2xl mr-2" />
        Sign in with Google
      </button>
    </div>
  );
}
