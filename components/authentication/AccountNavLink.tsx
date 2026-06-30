"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FiUser } from "react-icons/fi";

interface SessionResponse {
  user?: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
}

/** First+last initial (or email first char) — mirrors components/account/AccountNav. */
function initialsFrom(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    const combined = `${first}${last}`.toUpperCase();
    if (combined) return combined;
  }
  return (email?.[0] ?? "?").toUpperCase();
}

/**
 * Nav affordance for customer auth. Self-contained (the public layout has no
 * SessionProvider): resolves the session via /api/auth/session. Signed out, it
 * shows a muted "Sign in"; signed in, it collapses to the user's avatar (Google
 * photo, or an initials circle) — the same identity treatment as /account.
 *
 * The session read goes through React Query under a shared key so the two NavBar
 * instances (desktop + mobile) — and every page navigation — dedupe to a single
 * cached request instead of one uncached fetch per mount.
 */
export default function AccountNavLink(): ReactElement {
  const { data } = useQuery<SessionResponse>({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const user = data?.user;

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="flex items-center gap-1.5 text-[#64748b] hover:text-[#0369a1] transition-colors"
      >
        <FiUser className="h-5 w-5" />
        <span className="hidden whitespace-nowrap text-sm font-medium xl:inline">
          Sign in
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="My Account"
      title={user.name ?? user.email ?? "My Account"}
      className="group flex items-center"
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? user.email ?? "My Account"}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform group-hover:scale-105"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0369a1] text-xs font-semibold text-white ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
          {initialsFrom(user.name, user.email)}
        </span>
      )}
    </Link>
  );
}
