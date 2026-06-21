"use client";

import { useState, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { FiUser } from "react-icons/fi";

/**
 * Nav affordance for customer auth. Self-contained (the public layout has no
 * SessionProvider): resolves the session via /api/auth/session. Defaults to /login,
 * which is safe even before resolution because /login redirects already-authed users
 * to /account.
 */
export default function AccountNavLink(): ReactElement {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (active) setAuthed(Boolean(d?.user));
      })
      .catch(() => {
        if (active) setAuthed(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
