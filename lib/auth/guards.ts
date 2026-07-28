import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * Centralized authorization for the app — the SINGLE source of truth.
 *
 * Why this exists: the app uses NextAuth's `database` session strategy, so Edge
 * `middleware.ts` cannot read the session/role from MongoDB. Authorization therefore
 * lives here, called from route handlers (Response variants) and server components
 * (redirect variants). Do NOT rely on middleware for authz.
 *
 * Mirrors the canonical guard already used across the codebase:
 *   if (!session?.user?.isAdmin) return 401  (see app/api/refunds/route.ts)
 * but distinguishes 401 (not signed in) from 403 (signed in, not admin) so customer
 * sessions are correctly rejected once customer login is enabled.
 */

export interface SessionUser {
  id: string;
  email: string; // always lowercased + guaranteed present
  isAdmin: boolean;
  role: "customer" | "admin";
  name?: string | null;
  image?: string | null;
}

/**
 * Resolve the current session user, or null when unauthenticated.
 * Narrows `email` (NextAuth emails are string | null | undefined) so callers can
 * safely `.toLowerCase()`/compare without strict-null errors.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.email) return null;
  return {
    id: user.id,
    email: user.email.toLowerCase(),
    isAdmin: user.isAdmin ?? false,
    role: user.role ?? "customer",
    name: user.name ?? null,
    image: user.image ?? null,
  };
}

// ---- API-route guards: return the user, or a Response to early-return ----

/** Admin-only API guard. Returns SessionUser, or 401 (no session) / 403 (not admin). */
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return user;
}

/** Any-authenticated-user API guard. Returns SessionUser, or 401. */
export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return user;
}

// ---- Server-component guards: return the user, or redirect ----

/**
 * Admin-only page guard.
 * - Unauthenticated → the admin sign-in at /admin (Phase 2 can switch this to /login).
 * - Authenticated non-admin → home ("/"), which is loop-safe (NOT back to a login page).
 */
export async function requireAdminPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin");
  if (!user.isAdmin) redirect("/");
  return user;
}

/** Any-authenticated-user page guard. Redirects unauthenticated users to /login. */
export async function requireUserPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
