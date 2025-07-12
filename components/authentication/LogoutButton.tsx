"use client";
import { signOut } from "next-auth/react";
import { RiLogoutBoxRLine } from "react-icons/ri";

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
      className="flex items-center justify-center gap-2 py-2 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
    >
      <RiLogoutBoxRLine className="w-4 h-4" />
      <span>Sign Out</span>
    </button>
  );
}
