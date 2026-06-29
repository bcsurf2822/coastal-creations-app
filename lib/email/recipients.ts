/**
 * Centralized transactional-email recipient routing.
 *
 * The CUSTOMER copy always goes to the real customer address (the sending domain
 * is verified, so Resend can deliver anywhere) — this lets us test the checkout
 * flow as a genuine customer in dev. Only the ADMIN copy is redirected in
 * non-production: in prod it goes to STUDIO_EMAIL (with a hard fallback), in
 * dev/stage it goes to DEV_EMAIL so Ashley never gets test-order notifications.
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
  // The customer copy always goes to the real address — in every environment.
  const customer = customerEmail ?? "";

  // Use `||` so an empty-string env var (a misconfiguration) is treated as unset.
  if (isProduction) {
    return {
      customer,
      admin: process.env.STUDIO_EMAIL || FALLBACK_STUDIO_EMAIL,
    };
  }

  // dev / stage: only the ADMIN copy is redirected, so test orders never reach
  // Ashley. Fall back to the customer address if DEV_EMAIL is not configured.
  const adminInDev = process.env.DEV_EMAIL || customer;
  return { customer, admin: adminInDev };
}
