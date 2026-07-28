/**
 * Pure role-resolution logic, extracted so it is unit-testable without importing the
 * full NextAuth config (which pulls in Resend/Mongo side effects).
 *
 * ADMIN_EMAILS is a BOOTSTRAP SEED ONLY — it promotes a known email to admin on sign-in.
 * Live authorization always reads the persisted `users.role` (see lib/auth/guards.ts).
 */

export type Role = "customer" | "admin";

/** Parse the comma-separated ADMIN_EMAILS env into a lowercased, trimmed list. */
export function parseAdminSeed(raw: string | undefined): string[] {
  return (raw || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Decide a user's role.
 * - An existing admin stays admin (never silently demoted by the seed).
 * - A seeded email becomes admin.
 * - Everyone else defaults to (their existing role or) customer.
 */
export function resolveRole(
  email: string | null | undefined,
  seed: string[],
  existingRole?: Role
): Role {
  if (existingRole === "admin") return "admin";
  if (email && seed.includes(email.toLowerCase())) return "admin";
  return existingRole ?? "customer";
}
