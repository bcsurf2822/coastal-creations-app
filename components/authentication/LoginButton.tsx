"use client";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function LoginButton() {
  const dashURL = "/admin/dashboard";

  return (
    <button
      onClick={() => {
        signIn("google", { callbackUrl: dashURL });
      }}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow"
    >
      <FaGoogle className="text-red-500" size={18} />
      <span>Sign In With Google</span>
    </button>
  );
}
