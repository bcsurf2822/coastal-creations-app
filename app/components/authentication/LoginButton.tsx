"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  return (
    <button
      onClick={() => (session ? signOut() : signIn())}
      style={{
        padding: "0.75rem 2rem",
        borderRadius: "2rem",
        background: session ? "#f87171" : "#6366f1",
        color: "white",
        fontWeight: 600,
        fontSize: "1.1rem",
        border: "none",
        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background = session ? "#ef4444" : "#4f46e5")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.background = session ? "#f87171" : "#6366f1")
      }
    >
      {session ? "Sign out" : "Sign in"}
    </button>
  );
}
