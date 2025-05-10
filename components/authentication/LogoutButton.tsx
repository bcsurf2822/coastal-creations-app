"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow"
    >
      <span>Sign Out</span>
    </button>
  );
}
