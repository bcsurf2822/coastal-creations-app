/**
 * Shared input validation helpers.
 *
 * The project has no validation library (no zod / react-hook-form / yup) — keep
 * validation custom but CENTRALIZED here so every email entry across the app
 * (forms + API routes) uses the exact same rule instead of duplicated regexes.
 */

/** Pragmatic email shape check: non-empty local part @ domain . tld, no spaces. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when `value` is a syntactically valid email address (trimmed). */
export function isValidEmail(value: string | null | undefined): boolean {
  if (!value) return false;
  return EMAIL_REGEX.test(value.trim());
}
