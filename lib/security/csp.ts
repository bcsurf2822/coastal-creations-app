/**
 * Content Security Policy + hardening security headers.
 *
 * Single source of truth for the app's CSP. Sandbox vs production Square
 * domains are selected by SQUARE_ENVIRONMENT (the existing switch used across
 * lib/square/*). The CSP allowlists EVERY origin the browser legitimately loads
 * (Square Web Payments, Sanity images, Square-catalog S3 images, Google
 * Analytics) so the card iframe, store checkout, gift-card purchase, images and
 * analytics all keep working.
 *
 * Rollout note: ship this as `Content-Security-Policy-Report-Only` first (see
 * next.config.ts). Reconcile real browser violations, THEN flip the header key
 * to the enforcing `Content-Security-Policy`.
 *
 * Square CSP reference:
 *   https://developer.squareup.com/docs/web-payments/content-security-policy
 */

interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Build the Content-Security-Policy string.
 *
 * @param isSandbox - true when SQUARE_ENVIRONMENT === "sandbox" (swaps Square
 *   Web Payments host + pci-connect host to their sandbox equivalents).
 * @param isDev - true in non-production builds; adds 'unsafe-eval' which React
 *   Refresh / Turbopack require in development. Never shipped to production.
 */
export function buildContentSecurityPolicy(
  isSandbox: boolean,
  isDev: boolean
): string {
  const squareHost = isSandbox
    ? "https://sandbox.web.squarecdn.com"
    : "https://web.squarecdn.com";
  const pciConnectHost = isSandbox
    ? "https://pci-connect.squareupsandbox.com"
    : "https://pci-connect.squareup.com";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      squareHost,
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'", squareHost],
    "font-src": [
      "'self'",
      "https://square-fonts-production-f.squarecdn.com",
      "https://d1g145x70srn7h.cloudfront.net",
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://cdn.sanity.io",
      "https://square-catalog-production.s3.amazonaws.com",
      "https://square-catalog-sandbox.s3.amazonaws.com",
      "https://items-images-production.s3.us-west-2.amazonaws.com",
      "https://items-images-sandbox.s3.us-west-2.amazonaws.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
      squareHost,
    ],
    "connect-src": [
      "'self'",
      pciConnectHost,
      "https://o160250.ingest.sentry.io",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "frame-src": ["'self'", squareHost],
    // child-src is the legacy fallback for frame-src in older browsers.
    "child-src": ["'self'", squareHost],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const body = Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(" ")}`)
    .join("; ");

  return `${body}; upgrade-insecure-requests`;
}

/**
 * Standard hardening headers applied alongside the CSP. HSTS is only honored by
 * browsers over HTTPS (Vercel serves HTTPS in production).
 */
export function securityHeaders(): SecurityHeader[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    // Belt-and-suspenders with the CSP frame-ancestors 'none' directive.
    { key: "X-Frame-Options", value: "DENY" },
  ];
}
