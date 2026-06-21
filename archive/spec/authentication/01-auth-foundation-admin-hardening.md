# PRP 01: Auth Foundation & Admin Hardening

> **Phase 1 of the Authentication Overhaul** (see `INITIAL.md`). SECURITY-CRITICAL — this is a hard prerequisite for customer accounts. Do NOT enable customer login until the access-matrix test in this PRP passes.

## Goal

Make it safe for non-admin customers to authenticate by (1) centralizing authorization, (2) closing every "logged-in == admin" hole, (3) removing the dev auth-bypass, (4) moving admin status to DB-backed roles, and (5) adding passwordless magic-link login alongside Google. No customer-facing UI ships in this PRP — it is the foundation Phase 2 builds on.

## Why

The app's entire admin protection currently rests on an unspoken assumption: **"if you have a session, you're an admin"** — true only because today the `signIn` callback rejects everyone not in `ADMIN_EMAILS`. The moment we allow customer sign-ups, every `if (!session)` guard becomes a hole, and the `NODE_ENV !== "development"` checks become a no-auth backdoor. We must fix authorization *before* opening authentication.

## What

- A single source of truth for authz: `lib/auth/guards.ts` (`requireAdmin`, `requireUser`, `getSessionUser`).
- Every admin route/page enforces `isAdmin` (not mere session existence).
- All currently-unprotected mutating admin routes are protected.
- The `NODE_ENV !== "development"` bypass is deleted everywhere.
- `signIn` allows any user; `role`/`isAdmin` comes from the **DB user record** (`ADMIN_EMAILS` is a one-time bootstrap seed only).
- NextAuth **Email (magic-link) provider via Resend** added alongside Google; emails normalized to lowercase.
- An automated **access-matrix test**: a customer session gets `403` on every admin endpoint; an admin session passes.

### Success Criteria
- [ ] `lib/auth/guards.ts` exists; all admin routes/pages use it.
- [ ] Every route in the "Routes to harden" table below enforces `isAdmin`.
- [ ] No `NODE_ENV !== "development"` auth check remains in the codebase (`grep` is clean).
- [ ] `signIn` allows non-admins; new users default to `role: "customer"`; admins resolve from the DB.
- [ ] Magic-link sign-in works locally end-to-end (Resend), single-use, ~10-min TTL, rate-limited.
- [ ] Access-matrix test passes: customer→403, admin→200 across all admin endpoints.
- [ ] `pnpm test`, `pnpm lint`, `pnpm build` all green. No regression to booking/store/payment flows.

---

## All Needed Context

### Current auth (verified 2026-06-19)
```yaml
- file: auth.ts
  facts:
    - NextAuth v4, MongoDBAdapter (@auth/mongodb-adapter), session strategy "database".
    - Provider: Google only.
    - signIn callback: returns false unless email is in ADMIN_EMAILS; sets users.isAdmin=true for admins.
    - session callback: sets session.user.id and session.user.isAdmin from the DB user.
- file: types/next-auth.d.ts
  facts: User.isAdmin, Session.user.isAdmin, JWT.isAdmin already declared — no type work needed.
- file: lib/mongodb.ts
  facts: clientPromise; client.db() resolves the DB named in MONGODB_URI (coastal_stage / coastal_prod).
- collections (NextAuth-managed): users, accounts, sessions, verification_tokens (verification_tokens currently unused — magic link will use it).
- env present: NEXTAUTH_URL, NEXTAUTH_SECRET, ADMIN_EMAILS, GOOGLE_CLIENT_ID/SECRET, RESEND_API_KEY.
```

### The GOOD pattern already in the codebase (reuse it)
Many routes already do this correctly — copy it into the helper:
```ts
const session = await getServerSession(authOptions);
if (!session?.user?.isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```
Routes already correct (no change needed): `/api/events` (POST/DELETE), `/api/events/[id]` (PUT), `/api/refunds`, `/api/gallery` (writes), `/api/upload-image`, `/api/upload-private-image`, `/api/delete-image`, `/api/page-content` (PUT) + `/page-content/upload-image`, `/api/hours` (PUT), `/api/payment-errors`, `/api/private-events` (writes), `/api/reservations` (POST/DELETE).

### THE HOLES — Routes to harden (audit 2026-06-19)

**A. Session-existence-only checks (any logged-in user passes) → switch to `requireAdmin`:**
```yaml
- app/admin/dashboard/layout.tsx:33-37   # only `if (!session)` + NODE_ENV bypass → must check isAdmin
- app/api/admin/store/orders/route.ts:8
- app/api/admin/store/orders/[id]/route.ts:24,53
- app/api/admin/store/products/route.ts:9
- app/api/admin/store/products/[id]/route.ts:12
- app/api/store/shipping-label/route.ts:18      # admin fallback — must be admin-only
- app/api/gift-cards/list/route.ts:13           # lists ALL gift cards
- app/api/gift-cards/[id]/activities/route.ts:16 # any card's history
```

**B. Unprotected mutating/privileged routes (NO auth today) → add `requireAdmin` (unless noted):**
```yaml
- app/api/event/[id]/route.ts (PATCH)                 # add requireAdmin
- app/api/reservations/[id]/route.ts (PUT)            # add requireAdmin
- app/api/square/customers/route.ts (POST/GET)        # admin-only management → requireAdmin
- app/api/square/customers/[id]/route.ts (GET/PUT/DELETE)  # requireAdmin
- app/api/square/customers/migrate/route.ts (POST/GET) # requireAdmin
- app/api/send/route.ts (POST/GET)                    # internal admin email test → requireAdmin
```

**C. Intentionally public — DO NOT lock to admin, but harden (validate input + rate-limit):**
```yaml
- app/api/customer/route.ts (POST)         # public booking signup — keep public; calls Square findOrCreate internally
- app/api/payments/route.ts (POST)         # checkout payment — keep public
- app/api/store/checkout/route.ts (POST)   # checkout — keep public
- app/api/store/shipping-rates/route.ts    # checkout — keep public
- app/api/gift-cards/route.ts (POST), /redeem # gift-card purchase/redeem — keep public
- app/api/send-confirmation/route.ts       # triggered by customer booking — keep public but rate-limit / validate
- app/api/contact, /subscribe              # public forms
- app/api/store/products(+[id]), /payment-config, /eventPictures, /privateEventPictures, GET reads # public reads
```
> Public ≠ unguarded: add basic input validation and (where cheap) rate-limiting, but these must remain reachable without a session. Ownership checks (e.g. "is this my order?") are Phase 2/3 once we have `userId`.

### Known Gotchas
```ts
// GOTCHA 1 — database sessions + Edge middleware.
// NextAuth "database" strategy stores no JWT; Edge middleware.ts CANNOT read the DB to
// verify isAdmin. So middleware can only check session-cookie PRESENCE (a UX redirect),
// NOT authorization. Real authz MUST live in route handlers / server components via the
// guards. Do not pretend middleware secures /admin.

// GOTCHA 2 — magic link does NOT use SMTP here.
// NextAuth EmailProvider defaults to nodemailer/SMTP. We pass a custom sendVerificationRequest
// that sends via Resend. Tokens persist in the existing `verification_tokens` collection.

// GOTCHA 3 — email case sensitivity.
// Bookings/orders match by email. Normalize to lowercase on read AND when comparing the
// session email, or "my bookings"/"my orders" silently miss records.

// GOTCHA 4 — getServerSession in route handlers must be passed authOptions (already the pattern).

// GOTCHA 5 — removing the NODE_ENV bypass means you must actually log in locally.
// That's intended. Magic link + Google both work on localhost once configured.
```

---

## Implementation Blueprint

### Data model: roles on the user document
```ts
// The NextAuth `users` collection gains a `role`. isAdmin stays as a derived convenience.
type UserRole = "customer" | "admin"; // room for "staff" later
// users doc: { _id, email, name, image, emailVerified, role: "customer"|"admin", isAdmin: boolean }
// Default for any new sign-in: role "customer", isAdmin false.
// Bootstrap: on sign-in, if email ∈ ADMIN_EMAILS and the user has no admin role yet, set role:"admin".
//   ADMIN_EMAILS is a SEED ONLY — ongoing grants/revokes happen in the DB (Phase 1 ships a script;
//   a dashboard toggle can come later). Never gate live authz on the env list at request time.
```

### Task list
```yaml
Task 1 — CREATE lib/auth/guards.ts:
  - getSessionUser(): Promise<SessionUser | null>  (wraps getServerSession(authOptions))
  - requireAdmin(): returns the user or throws/returns a 403 Response when !user.isAdmin; 401 when no session
  - requireUser(): returns the user or 401 when no session (any authenticated role)
  - A consistent helper to emit { error } with 401/403 for API routes, and a redirect helper for server components.
  - PATTERN: mirror the existing `if (!session?.user?.isAdmin)` semantics so behavior is unchanged for admins.

Task 2 — MODIFY auth.ts:
  - signIn callback: REMOVE the `return false`. Allow every successful Google/email sign-in.
      * Lowercase email. If email ∈ ADMIN_EMAILS seed and the DB user isn't already admin, set role:"admin", isAdmin:true.
      * Otherwise ensure role:"customer" (do not downgrade an existing admin).
  - Add EmailProvider (magic link) with a custom sendVerificationRequest that renders a branded email and sends via Resend (reuse components/email-templates patterns). maxAge ~10 min.
  - session callback: also expose session.user.role (extend types in next-auth.d.ts).
  - Keep Google provider unchanged.

Task 3 — REPLACE all "Section A + B" guards with requireAdmin():
  - For each file in the harden list, swap the ad-hoc/absent check for `const guard = await requireAdmin(); if (guard instanceof Response) return guard;` (API) or `await requireAdmin()` redirect (server component layout).
  - DELETE every `if (process.env.NODE_ENV !== "development")` wrapper around auth — guards run unconditionally.

Task 4 — Harden admin dashboard shell:
  - app/admin/dashboard/layout.tsx (server component): call requireAdmin(); redirect non-admins to /login (or /) — checks isAdmin, not just session.

Task 5 — (Optional, UX) ADD middleware.ts:
  - Matcher /admin/:path* — if no session cookie, redirect to /login. Coarse UX only; NOT the security boundary (see Gotcha 1). Real checks stay in handlers/layout.

Task 6 — ADD admin-grant script:
  - scripts/ (or a guarded one-off route): set users.role/isAdmin for a given email. Documents the DB-backed model; replaces editing ADMIN_EMAILS.

Task 7 — TESTS (the gate):
  - __tests__/auth/access-matrix.test.ts: mock a customer session and an admin session; assert every admin endpoint returns 403 for customer and 200/expected for admin. Drive the list from the harden table so new admin routes are easy to add.
  - __tests__/auth/signin-callback.test.ts: non-admin allowed + role customer; ADMIN_EMAILS seed → admin; email lowercased.
  - __tests__/auth/magic-link.test.ts: sendVerificationRequest invoked via Resend; token single-use.

Task 8 — Email normalization sweep:
  - Ensure Customer/Order writes and the session-email comparison both lowercase. (Reads in Phase 2 rely on this.)
```

### Pseudocode — `lib/auth/guards.ts`
```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export interface SessionUser { id: string; email: string; isAdmin: boolean; role: "customer" | "admin"; }

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as SessionUser) : null;
}

// API-route guard: returns the user, or a Response to early-return.
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return user;
}
export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return user;
}

// Server-component variants that redirect instead of returning a Response:
export async function requireAdminPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) redirect("/login");
  return user;
}
```

### Usage in an API route (the new standard)
```ts
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard; // 401/403
  // ...admin logic, guard is the SessionUser
}
```

### Integration points
```yaml
AUTH:
  - auth.ts gains EmailProvider; signIn flip; role in session/types.
  - types/next-auth.d.ts: add role to User/Session.
EMAIL:
  - magic link sent via Resend (RESEND_API_KEY) — reuse the from-address + email-template shell.
  - In dev/stage, consider routing magic links to DEV_EMAIL is NOT appropriate (the user needs their own link) — send to the real address; only STORE emails redirect to DEV_EMAIL.
GOOGLE CLOUD:
  - New business-GCP OAuth client already created; consent screen must be Published before customer launch (see INITIAL.md).
DB:
  - users.role added at sign-in; no migration needed for existing admins (seed re-applies on next login).
```

---

## Validation Loop

### Level 1 — Static
```bash
pnpm lint
npx tsc --noEmit
# Backdoor check — must return NOTHING:
grep -rn "NODE_ENV !== \"development\"" app/ | grep -i "session\|auth"
# Hole check — no admin route should early-return on bare !session:
grep -rn "if (!session)" app/api/admin app/api/gift-cards app/api/store/shipping-label
```

### Level 2 — Unit/integration
```bash
pnpm test __tests__/auth
# access-matrix: customer→403 on every admin endpoint; admin→ok
# signin-callback: non-admin allowed, role customer; seed→admin; email lowercased
# magic-link: Resend send invoked; token single-use
```

### Level 3 — Manual (local)
```bash
pnpm dev
# 1. Sign in with a NON-admin Google account (after consent screen allows it / test user) → lands as customer, NOT in /admin.
# 2. Hit /api/admin/store/orders as that customer → 403.
# 3. Request a magic link to a personal email → receive via Resend → sign in → customer session.
# 4. Sign in with an ADMIN_EMAILS address → /admin/dashboard loads.
```

## Final Validation Checklist
- [ ] `grep` backdoor/hole checks return nothing.
- [ ] Access-matrix test green (customer 403 everywhere admin).
- [ ] Magic link works locally (single-use, ~10 min, rate-limited).
- [ ] Admin login + dashboard unaffected.
- [ ] `pnpm test && pnpm lint && pnpm build` all pass.
- [ ] No regression: booking signup, store checkout, refunds, gift cards still work.

## Anti-Patterns to Avoid
- DO NOT enable customer login before the access-matrix test passes.
- DO NOT rely on `middleware.ts` for authorization with database sessions (cookie presence ≠ admin).
- DO NOT keep any `NODE_ENV !== "development"` auth bypass — log in for real in dev.
- DO NOT gate live authz on `ADMIN_EMAILS` at request time — it is a seed; authz reads the DB user.
- DO NOT add a password/Credentials provider (magic link + Google only).
- DO NOT lock the genuinely-public checkout/booking routes to admin (Section C stays public).
