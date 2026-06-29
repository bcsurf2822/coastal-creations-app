"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FiUser } from "react-icons/fi";

interface SessionResponse {
  user?: { email?: string | null } | null;
}

/**
 * Nav affordance for customer auth. Self-contained (the public layout has no
 * SessionProvider): resolves the session via /api/auth/session. Defaults to /login,
 * which is safe even before resolution because /login redirects already-authed users
 * to /account.
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
  const authed = Boolean(data?.user);

  const href = authed ? "/account" : "/login";
  const label = authed ? "My Account" : "Sign in";

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center gap-1.5 text-[#0f172a] hover:text-[#0369a1] transition-colors"
    >
      <FiUser className="h-5 w-5" />
      <span className="hidden xl:inline lg:text-sm xl:text-base font-bold uppercase">
        {label}
      </span>
    </Link>
  );
}
