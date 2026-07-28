name: "Square Web Payments — Content Security Policy + Security Headers (Next.js)"
description: |
  Add a Content-Security-Policy (and supporting security headers) to the app so it
  satisfies Square Web Payments SDK's stated CSP/Secure-Context requirement and adds
  a real defense-in-depth layer. Roll out CSP in Report-Only first (so nothing breaks),
  reconcile violations from the app's real third parties (Square, Sanity, Google
  Analytics, Square-catalog S3), then enforce. Server-only Next.js config change; no
  payment logic changes.

## Purpose
One-pass implementation guide. The executing agent has only this PRP + codebase access.
Follow the dependency-ordered tasks and run the validation loop after each.

## Core Principles
1. **Do no harm**: ship `Content-Security-Policy-Report-Only` FIRST. A wrong enforced CSP
   silently breaks the card iframe, images, fonts, or analytics. Observe, then enforce.
2. **Allowlist the WHOLE app, not just Square**: the page that renders the card form also
   loads Sanity images, Google Analytics, MUI inline styles, Square-catalog S3 images.
3. Follow `AGENTS.md`/`CLAUDE.md`: strict TS, explicit return types, no emojis, log as
   `console.log("[FILE-FUNC] ...")`.

---

## Goal
The app serves a Content-Security-Policy that allowlists exactly the origins it uses
(including all Square Web Payments domains), plus standard hardening headers, applied to
every route via `next.config.ts` `headers()`. The Square card form, store checkout, gift
card purchase, Sanity images, and Google Analytics all keep working.

**Deliverable:**
- `next.config.ts` gains an `async headers()` returning a CSP + `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security`.
- CSP value lives in one place (a `lib/security/csp.ts` builder) so sandbox/prod domains
  are switched by `SQUARE_ENVIRONMENT`.
- Rollout: Report-Only commit → observe → flip to enforced in a follow-up.

**Success Definition:** With CSP enforced, a real card payment completes in Square sandbox
AND production-domain smoke test; browser console shows ZERO CSP violations on the
checkout, reservation-payment, event-payment, gift-card, store, and homepage routes;
`pnpm build` is green.

## Why
- Square **requires** Secure Contexts + a proper CSP for Web Payments SDK integrations
  (their CSP doc lists exact domains). We currently ship **no CSP at all**
  (`grep -ri content-security-policy` → none; `next.config.ts` has no `headers()`).
- CSP is defense-in-depth against XSS/data-exfil on pages that handle payment entry.

## What
Server-side response headers only. No user-visible change when done right. The only
"behavior" is the browser enforcing the policy.

### Success Criteria
- [ ] `next.config.ts` `headers()` returns a CSP covering all Square Web Payments domains
      (prod + sandbox, selected by env) and the app's other origins.
- [ ] Report-Only rollout first; violations reconciled before enforcing.
- [ ] Card payment completes in sandbox with CSP enforced; zero CSP console violations on
      `/checkout`, `/reservations/[reservationId]/payment`, `/payments`, `/gift-cards`, `/store`, `/`.
- [ ] Hardening headers present: `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
      `Strict-Transport-Security`, frame protection.
- [ ] `pnpm build` passes; no regression to image loading (Sanity/Square S3) or analytics.

## All Needed Context

### Documentation & References
```yaml
# MUST READ
- url: https://developer.squareup.com/docs/web-payments/content-security-policy
  why: THE source of required Square domains per directive (prod + sandbox).
  critical: |
    PRODUCTION:  script/style/frame-src https://web.squarecdn.com ;
                 font-src https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net ;
                 connect-src https://pci-connect.squareup.com https://o160250.ingest.sentry.io
    SANDBOX:     script/style/frame-src https://sandbox.web.squarecdn.com ;
                 font-src (same as prod) ;
                 connect-src https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io
    style-src needs 'unsafe-inline' (Square + MUI inject inline styles).
- url: https://developer.squareup.com/docs/web-payments/overview
  section: "Secure Contexts and CSP"
  critical: Web Payments SDK requires Secure Contexts (HTTPS — Vercel provides) + proper CSP.
- url: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
  why: Official Next.js CSP guidance (nonce vs static header trade-offs).
  critical: |
    Static allowlist via next.config headers() is simplest. A strict nonce CSP needs
    middleware AND breaks with 'unsafe-inline'; this app uses MUI inline styles + GA inline
    snippet, so go ALLOWLIST + 'unsafe-inline' for style-src, not nonce-strict, for v1.
- url: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
  why: Exact shape of async headers() { return [{ source, headers:[{key,value}] }] }.

# CODEBASE PATTERNS / FACTS TO RESPECT
- file: next.config.ts
  why: MODIFY — currently only sets images.remotePatterns. Add headers(). Note the image
       hosts already trusted (cdn.sanity.io, square-catalog-{production,sandbox}.s3.amazonaws.com,
       items-images-{production,sandbox}.s3.us-west-2.amazonaws.com) — these MUST be in img-src.
- file: components/store/PaymentStep.tsx
  why: Loads react-square-web-payments-sdk (the card iframe). One of the pages CSP must not break.
- file: components/payment/PaymentProcessor.tsx
  why: Event/private-event card iframe.
- file: components/reservations/PaymentForm.tsx
  why: Reservation card iframe (also uses WalletPayButtons import).
- file: components/gift-cards/GiftCardPurchase.tsx
  why: Gift-card card iframe.
- file: lib/gtag.js
  why: Google Analytics — confirms GA is loaded; CSP script-src/connect-src/img-src must allow
       https://www.googletagmanager.com https://www.google-analytics.com.
- file: app/layout.tsx
  why: Root layout — confirm how GA/fonts/scripts are injected (next/script, next/font) so the
       CSP allows them (next/font self-hosts → 'self'; GA via next/script → needs GTM domain).
- file: sanity/client.ts
  why: Sanity image/CDN host (cdn.sanity.io) used across pages → img-src.
```

### Current Codebase tree (relevant)
```bash
next.config.ts                 # MODIFY — add async headers()
lib/
  gtag.js                      # Google Analytics (GTM/GA domains needed in CSP)
  security/                    # CREATE — csp.ts builder lives here
app/layout.tsx                 # GA + fonts injection (verify CSP compatibility)
components/
  store/PaymentStep.tsx        # Square card iframe (must not break)
  payment/PaymentProcessor.tsx # Square card iframe
  reservations/PaymentForm.tsx # Square card iframe
  gift-cards/GiftCardPurchase.tsx
sanity/client.ts               # cdn.sanity.io
```

### Desired Codebase tree (new files + responsibility)
```bash
lib/security/csp.ts            # buildContentSecurityPolicy(env): string + securityHeaders(): {key,value}[]
                               # single source of truth; sandbox vs prod chosen by SQUARE_ENVIRONMENT
```

### Known Gotchas
```ts
// CRITICAL: Square card entry is an IFRAME from web.squarecdn.com (or sandbox.*). It needs
//   script-src + style-src + frame-src + (child-src as fallback) for that host. Missing
//   frame-src => blank card form. Missing connect-src pci-connect.* => tokenize() fails silently.
// CRITICAL: style-src MUST include 'unsafe-inline' — MUI (@mui/material) and the Square SDK
//   inject inline <style>. A nonce-strict style-src will break the entire UI.
// CRITICAL: img-src must include the EXACT hosts already in next.config images.remotePatterns
//   (Sanity + Square S3 buckets) or product/gallery images 404 under CSP.
// CRITICAL: script-src needs Google Tag Manager (https://www.googletagmanager.com) and likely
//   'unsafe-inline' for the GA bootstrap snippet + Next inline runtime; connect-src needs
//   https://www.google-analytics.com + region endpoints.
// CRITICAL: DEV needs 'unsafe-eval' (React refresh / turbopack). Gate eval to non-production,
//   or keep CSP only in production builds to avoid breaking `pnpm dev`.
// GOTCHA: Vercel may also set headers — confirm no conflict. HSTS only via this header on HTTPS.
// GOTCHA: SQUARE_ENVIRONMENT is the existing switch ("sandbox" vs prod) used throughout
//   lib/square/*; reuse it so the CSP swaps web.squarecdn.com <-> sandbox.web.squarecdn.com.
```

## Implementation Blueprint

### Tasks (in order)
```yaml
Task 1 — AUDIT third-party origins (no code):
  RUN greps to enumerate every external origin the browser loads:
    - grep -rn "squarecdn\|squareup\|next/script\|next/font\|googletagmanager\|google-analytics\|cdn.sanity\|s3.amazonaws" app components lib
    - read app/layout.tsx for GA + font setup
    - list next.config.ts images.remotePatterns hosts
  OUTPUT: a definitive origin list per directive (script/style/font/img/connect/frame).

Task 2 — CREATE lib/security/csp.ts:
  EXPORT buildContentSecurityPolicy(isSandbox: boolean, isDev: boolean): string
    - default-src 'self'
    - script-src 'self' 'unsafe-inline' [https://www.googletagmanager.com] (+ 'unsafe-eval' when isDev)
    - style-src 'self' 'unsafe-inline' [square host]
    - font-src 'self' https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net
    - img-src 'self' data: blob: [sanity + square S3 hosts + google-analytics]
    - connect-src 'self' [pci-connect host] https://o160250.ingest.sentry.io https://www.google-analytics.com [GTM]
    - frame-src 'self' [square host]
    - child-src [square host]   # older-browser fallback for frame-src
    - object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
    - upgrade-insecure-requests
  WHERE [square host] = isSandbox ? https://sandbox.web.squarecdn.com : https://web.squarecdn.com
        [pci-connect host] = isSandbox ? https://pci-connect.squareupsandbox.com : https://pci-connect.squareup.com
  EXPORT securityHeaders(): Array<{ key: string; value: string }>
    - X-Content-Type-Options: nosniff
    - Referrer-Policy: strict-origin-when-cross-origin
    - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    - X-Frame-Options: DENY   (belt-and-suspenders with frame-ancestors)

Task 3 — MODIFY next.config.ts (REPORT-ONLY first):
  ADD `async headers()` returning a single entry { source: "/(.*)", headers: [...] } where the
  CSP is sent as key "Content-Security-Policy-Report-Only" (NOT enforced yet) plus the
  securityHeaders(). Build CSP from buildContentSecurityPolicy(isSandbox, isDev) using
  process.env.SQUARE_ENVIRONMENT and process.env.NODE_ENV.

Task 4 — OBSERVE & RECONCILE:
  Run the app, exercise EVERY payment + image-heavy route, collect console "Report-Only would
  block" warnings, and add any missing legit origin to lib/security/csp.ts. Iterate to zero.

Task 5 — ENFORCE (separate commit/PR step):
  Change the header key from "Content-Security-Policy-Report-Only" to "Content-Security-Policy".
  Keep Report-Only available behind an env flag if desired for staging.
```

### Per-task pseudocode (csp.ts + next.config.ts)
```ts
// lib/security/csp.ts
export function buildContentSecurityPolicy(isSandbox: boolean, isDev: boolean): string {
  const sq = isSandbox ? "https://sandbox.web.squarecdn.com" : "https://web.squarecdn.com";
  const pci = isSandbox ? "https://pci-connect.squareupsandbox.com" : "https://pci-connect.squareup.com";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", sq, ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'", sq],
    "font-src": ["'self'", "https://square-fonts-production-f.squarecdn.com", "https://d1g145x70srn7h.cloudfront.net"],
    "img-src": ["'self'", "data:", "blob:", "https://cdn.sanity.io",
                "https://square-catalog-production.s3.amazonaws.com", "https://square-catalog-sandbox.s3.amazonaws.com",
                "https://items-images-production.s3.us-west-2.amazonaws.com", "https://items-images-sandbox.s3.us-west-2.amazonaws.com",
                "https://www.google-analytics.com", sq],
    "connect-src": ["'self'", pci, "https://o160250.ingest.sentry.io", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
    "frame-src": ["'self'", sq],
    "child-src": ["'self'", sq],
    "object-src": ["'none'"], "base-uri": ["'self'"], "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const body = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
  return `${body}; upgrade-insecure-requests`;
}

// next.config.ts (Report-Only first)
async headers() {
  const isSandbox = process.env.SQUARE_ENVIRONMENT === "sandbox";
  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildContentSecurityPolicy(isSandbox, isDev);
  return [{ source: "/(.*)", headers: [
    { key: "Content-Security-Policy-Report-Only", value: csp },  // → "Content-Security-Policy" in Task 5
    ...securityHeaders(),
  ]}];
}
```

### Integration Points
```yaml
CONFIG:
  - env reused: SQUARE_ENVIRONMENT ("sandbox" → sandbox.web.squarecdn.com + squareupsandbox)
  - NODE_ENV: gate 'unsafe-eval' to dev only
NEXT:
  - next.config.ts is the ONLY wiring point; no middleware needed for the allowlist approach.
```

## Validation Loop

### Level 1: Build & header presence
```bash
pnpm build                       # must compile with the new headers()
pnpm dev &                       # then:
curl -sI http://localhost:3000/checkout | grep -i "content-security-policy"   # header present
curl -sI http://localhost:3000/  | grep -iE "x-content-type-options|referrer-policy"
```

### Level 2: Runtime — zero violations (Report-Only)
```bash
# In the browser (or Claude-in-Chrome): open each route, watch DevTools console:
#   /  /store  /checkout  /gift-cards  /reservations/<reservationId>/payment  /payments?eventId=<id>&price=...
# Expect: card iframe renders; product/gallery images load; NO "Content-Security-Policy" /
#   "Report-Only would have blocked" messages. Add any missing legit origin to csp.ts and rebuild.
```

### Level 3: Integration — real tokenization under CSP
```bash
# With SQUARE_ENVIRONMENT=sandbox, complete a sandbox card payment on /checkout and /gift-cards.
# Expect: tokenization succeeds, payment completes, console clean. THEN flip to enforced (Task 5)
# and repeat once more.
```

## Final validation checklist
- [ ] `pnpm build` green; CSP header present on all routes (curl).
- [ ] Report-Only run shows zero violations across all payment + image routes.
- [ ] Enforced CSP: sandbox card payment completes on /checkout AND /gift-cards.
- [ ] Square card iframe renders on all 4 payment surfaces.
- [ ] Sanity + Square-catalog images still load; Google Analytics still fires.
- [ ] Hardening headers present (nosniff, Referrer-Policy, HSTS, frame protection).

## Anti-Patterns to Avoid
- ❌ Don't enforce CSP on the first commit — Report-Only first, always.
- ❌ Don't use a nonce-strict CSP here — MUI/GA inline styles+scripts make it break-prone; allowlist.
- ❌ Don't hardcode prod Square domains — switch by SQUARE_ENVIRONMENT (sandbox uses different hosts).
- ❌ Don't forget img-src — omitting Sanity/Square-S3 hosts silently breaks product/gallery images.
- ❌ Don't ship 'unsafe-eval' to production — dev-only.

## Confidence: 8.5/10 for one-pass success
Mechanically simple (one config file + one helper), but the score isn't a 10 because the
exact allowlist depends on the app's real third-party loads (Task 1 audit) — the Report-Only
rollout is the safety net that converts that uncertainty into an observable, fixable list.
