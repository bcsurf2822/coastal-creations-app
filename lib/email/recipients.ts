/**
 * Centralized transactional-email recipient routing.
 *
 * In production, customer emails go to the customer and admin emails go to
 * STUDIO_EMAIL (with a hard fallback). In dev/stage, EVERYTHING redirects to
 * DEV_EMAIL so we never email real customers from a non-prod environment.
 *
 * This is the single source of truth — every send site should call it instead
 * of re-deriving the prod/dev branch inline (which had drifted across routes).
 */

/** Hard fallback admin recipient if STUDIO_EMAIL is somehow unset in prod. */
export const FALLBACK_STUDIO_EMAIL = "ashley@coastalcreationsstudio.com";

/** Standard FROM header for all transactional email. */
export const EMAIL_FROM =
  "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>";

export interface EmailRecipients {
  customer: string;
  admin: string;
}

/**
 * Resolve the customer + admin recipients for a transactional email.
 * @param customerEmail the real customer address (used in prod / as a last resort)
 */
export function resolveEmailRecipients(
  customerEmail: string | null | undefined
): EmailRecipients {
  const isProduction = process.env.VERCEL_ENV === "production";
  const customer = customerEmail ?? "";

  // Use `||` so an empty-string env var (a misconfiguration) is treated as unset.
  if (isProduction) {
    return {
      customer,
      admin: process.env.STUDIO_EMAIL || FALLBACK_STUDIO_EMAIL,
    };
  }

  // dev / stage: redirect both to DEV_EMAIL (falling back to the customer email
  // only if DEV_EMAIL is not configured).
  const devEmail = process.env.DEV_EMAIL || customer;
  return { customer: devEmail, admin: devEmail };
}
