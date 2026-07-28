# Blueprint: Authentication Overhaul — Customer Profiles + Admin Hardening

> **Status:** Blueprint — decisions locked; decomposed into executable PRPs (see below).
> **Owner:** Ben
> **Created:** 2026-06-18 · **Audited & decomposed:** 2026-06-19
> **Related:** memory `customer-profiles-direction`; builds on the booking + online-store systems.

This is the **blueprint** for the authentication work. It captures the goal, current state, critical risk, target design, and a phased plan. The phases are decomposed into executable PRPs:
- **`01-auth-foundation-admin-hardening.md`** — Phase 1 (security-critical): centralized authz, fix the guard holes, DB-backed roles, magic-link provider.
- **`02-customer-console.md`** — Phase 2: shadcn customer console (`/account`), bookings + orders, Square/Mongo linkage.

A full route-by-route security audit was completed 2026-06-19; results live in the Phase 1 PRP.

---

## Goal

Introduce **customer-facing user accounts** so customers can sign in and track their **bookings** (events/camps/workshops) and **store orders** (with live shipping status) — while keeping the existing admin experience intact and **hardening admin authorization** as a hard prerequisite.

## Why

- **Customer value:** self-service "where's my order / what did I book?" — reduces support load, especially now that orders carry live Shippo tracking.
- **Retention:** accounts enable re-order, saved addresses, and future loyalty.
- **Necessary cleanup:** the current auth model assumes "any logged-in user is an admin." The moment customers can log in, that assumption is a security hole. This work forces us to fix it properly.

## What (v1 intent)

- Customers can create an account and sign in via **magic link (email) OR Google** (both).
- A **profile area** (`/account`) showing **My Bookings** and **My Orders** (read-only in v1).
- **Guest checkout stays** — accounts are optional, never required to purchase or book.
- **Admin authorization hardened** so customer accounts cannot reach admin routes/APIs.

### Locked decisions (2026-06-18)
- **Auth library:** **stay on NextAuth** (do not migrate to Better Auth for v1). NOTE: "NextAuth is now part of Better Auth" = an acquisition (Better Auth Inc. owns/maintains NextAuth); they remain separate products. Better Auth (with its built-in roles/orgs) is a possible *future* migration if we outgrow this, but not now.
- **Customer auth method:** **Google + magic link (passwordless, via Resend)**. **No passwords** — this is the most secure option (zero password storage; eliminates credential stuffing/reuse; tokens single-use + short TTL + rate-limited). No NextAuth Credentials provider.
- **Admin model:** **replace `ADMIN_EMAILS` reliance with DB-backed roles.** `users.isAdmin` already exists and the session callback already reads it from the DB. Add a `role` field (`'customer' | 'admin'`, room for `'staff'`); grant/revoke admin **in the database** (small dashboard toggle or script) — no redeploy, auditable. `ADMIN_EMAILS` shrinks to an optional one-time bootstrap seed (or is dropped, first admin seeded manually).
- **v1 scope:** plan first; lean toward **read-only** profile views. Self-service mutations (cancel/edit) deferred to a later phase.

### Google Cloud / OAuth project (ACTION NEEDED)
- The current Google OAuth client belongs to **GCP project number `597083981238`** (numeric prefix of `GOOGLE_CLIENT_ID`). Likely the dev/agency Google account (admin whitelist includes `crystaledgedev22@gmail.com`).
- **Plan (chosen): create a NEW project + OAuth client in the Crystal Edge Digital business GCP account**, then roll out per environment (stage → prod). Clean permanent ownership; the old agency project is decommissioned after cutover.
  - New Client ID/Secret (NOT same-credential), but **no user-facing downtime**: sessions are DB-stored so existing logins survive; each env cutover is just an env-var change + redeploy.
  - **Rollout order:** (1) local `.env` → new client, test; (2) Vercel **stg** env vars → new client, redeploy, test on stg; (3) Vercel **prod** env vars → new client, redeploy. Prod can stay on the OLD client while stg uses the new one (independent env vars).
  - New project's consent screen starts in **Testing** — add admin Google emails as **test users** for stg validation; **Publish (External/Production)** before customer launch.
  - **Do NOT delete the old project/client until prod cutover is verified** (early deletion is the only thing that breaks login).
  - Set business support email + authorized domain `coastalcreationsstudio.com` on the new consent screen.
- **One OAuth client serves BOTH admins and customers** — roles are decided in the DB after login, not by separate clients.
- **Consent screen:** must be **External + Published (Production)** so any customer can sign in (Testing mode blocks non-test users). Basic scopes (`openid`, `email`, `profile`) are non-sensitive → no Google verification review required.
- **Authorized redirect URIs** (the box NextAuth actually needs — exact match, no trailing slash): `http://localhost:3000/api/auth/callback/google`, `https://coastalcreationsstudio.com/api/auth/callback/google`, `https://stg.coastalcreationsstudio.com/api/auth/callback/google`. **JavaScript origins** (already set ✅): the same three without the path. Ensure `NEXTAUTH_URL` matches the origin per environment.

---

## Current State (verified)

### Auth stack
- **NextAuth** with **MongoDB adapter**, **`database` session strategy** (`auth.ts`).
  - NOTE: `AGENTS.md` says "JWT strategy" — that is **stale**; fix when we touch this.
- **Single provider:** Google OAuth.
- **Hard admin whitelist** in the `signIn` callback (`auth.ts`):
  ```js
  // returns true ONLY if user.email is in ADMIN_EMAILS, else false
  if (allowedEmails.includes(user.email.toLowerCase())) { ...; return true; }
  return false;   // <-- everyone who is not an admin is blocked from logging in
  ```
- **`session` callback** already sets `session.user.isAdmin` and `session.user.id`.
- **Types already extended** (`types/next-auth.d.ts`): `User.isAdmin`, `Session.user.isAdmin`, `JWT.isAdmin` all exist. No type work needed to start checking `isAdmin`.
- **Env present:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID/SECRET`, `RESEND_API_KEY` (magic link is feasible with infra we already have).

### How admin is protected today (THE RISK)
Admin guards check only **"is there a session?"** — not whether the user is an admin. Example (`app/api/admin/store/orders/route.ts:9`):
```ts
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```
This is safe **only because today the sole way to have a session is to be a whitelisted admin.** Once customers can sign in, `if (!session)` no longer means "is admin" — a logged-in customer would pass it.

Known guard locations found so far (NON-exhaustive — a full audit is Phase 1 work):
- `app/admin/page.tsx`
- `app/admin/dashboard/layout.tsx`
- `app/api/admin/store/products/route.ts` + `[id]/route.ts`
- `app/api/admin/store/orders/route.ts` + `[id]/route.ts`
- **PLUS** mutating booking/store APIs that are admin-operated but **not** under an `/admin` path (e.g. `/api/events`, `/api/reservations`, `/api/private-events`, `/api/refunds`, `/api/gift-cards`, gallery/upload routes). These must be inventoried — they are the easiest ones to miss.
- There is **no `middleware.ts`** today; admin protection is per-route. We should consider centralizing.

### Data linkage (good news: no migration needed for reads)
- Bookings are keyed by **`Customer.billingInfo.emailAddress`**.
- Store orders are keyed by **`Order.customer.email`**.
- A signed-in user's profile can therefore show their history by **email match** — past guest bookings/orders appear automatically, zero migration. (We can stamp a `userId`/`squareCustomerId` link going forward as a Phase 3 enhancement.)

---

## Critical Risk & Guardrail

> **The headline risk is authorization, not authentication.** Adding a login box is easy; the danger is that opening sign-up silently widens access to every "logged-in == admin" guard.

**Guardrail / definition of done for Phase 1:** every admin route and admin API must reject a non-admin **authenticated** user, verified by an automated test that logs in as a plain customer and asserts `403` on a representative set of admin endpoints. We do not ship customer login until this passes.

---

## Target Architecture

### Auth providers (`auth.ts`)
- Add NextAuth **Email provider (magic link)** alongside Google.
  - **GOTCHA:** NextAuth's EmailProvider defaults to SMTP. We will supply a custom `sendVerificationRequest` that sends the link through **Resend** (we already use Resend; avoid adding SMTP env/config). Verification tokens persist via the existing MongoDB adapter.
  - Harden: short token TTL (~10 min), single-use, **rate-limit** requests per email/IP.
- Flip the `signIn` callback: **allow any successful sign-in** (drop the `return false` for non-admins).
- **Roles are DB-backed** (not env): authorization reads `user.role`/`user.isAdmin` from the MongoDB user record (the session callback already does this). New users default to `role: 'customer'`. Admin is granted in the DB (dashboard toggle/script), not via `ADMIN_EMAILS`. Optionally keep `ADMIN_EMAILS` as a one-time bootstrap seed only.

### Authorization helpers (new)
- `lib/auth/guards.ts` (or similar): `requireAdmin()` and `requireUser()` helpers that wrap `getServerSession` and return `403`/`401` consistently. Replace ad-hoc `if (!session)` checks with `requireAdmin()`.
- Consider a root `middleware.ts` matching `/admin/:path*` and `/api/admin/:path*` for defense-in-depth (belt-and-suspenders with per-route checks).

### Customer-facing surface (new)
- `app/account/` — profile shell (protected by `requireUser`).
  - `app/account/bookings/` — "My Bookings" (Customer records where email matches session email).
  - `app/account/orders/` — "My Orders" (Order records by email; reuse the order/tracking display already built for admin where sensible).
- `app/login/` (or a modal) — magic-link + Google sign-in entry.
- Nav: account/login affordance for customers; keep admin entry separate.

### Data
- v1: **email-match reads only.** No schema changes required.
- Phase 3 (optional): add `userId` to `Customer`/`Order` on creation for robust linkage independent of email changes.

---

## Phased Plan (to become individual PRPs)

### Phase 1 — Auth foundation + admin hardening (SECURITY-CRITICAL)  → PRP `01`
1. Inventory **all** admin/privileged routes + APIs (including non-`/admin` mutating routes).
2. Add `requireAdmin()` / `requireUser()` helpers; (optionally) add `middleware.ts`.
3. Replace every `if (!session)` admin guard with `requireAdmin()` (`session.user.isAdmin`).
4. Flip `signIn` callback to allow non-admins; set `role`/`isAdmin` from the **DB user record** (`ADMIN_EMAILS` used only as a one-time bootstrap seed).
5. Add Email (magic-link via Resend) provider; keep Google.
6. **Tests:** customer-session vs admin-session access matrix; magic-link issuance.

### Phase 2 — Customer profile (read-only)  → PRP `02`
1. `/login` + `/account` shell, protected by `requireUser`.
2. "My Bookings" — query `Customer` by session email.
3. "My Orders" — query `Order` by session email; surface live Shippo status.
4. Nav integration; guest-checkout flow untouched.

### Phase 3 — Enhancements (later)  → PRP `03+`
- Stamp `userId`/link to bookings & orders on creation.
- Saved addresses, re-order, profile editing.
- Self-service actions (cancellation requests, etc.) — touches refund/booking logic, plan carefully.

---

## Resolved Decisions (2026-06-19)
- **Account ↔ admin overlap:** `/account` is universal — admins have both the dashboard and a customer `/account` view.
- **Email identity:** v1 matches history by **lowercased email**. If a future account email differs from a past guest-checkout email, that history won't auto-appear; we'll add a "claim by email" flow later. Phase 3 adds a `userId` stamp for robust linkage.
- **Login UX:** dedicated **`/login` page** first (modal later if desired).
- **Authorization enforcement:** **per-route/server-component guards are the source of truth** (`requireAdmin()`/`requireUser()`), because the app uses NextAuth's **`database` session strategy** — Edge `middleware.ts` cannot read the session from the DB, so it can only do a coarse cookie-presence redirect for UX, not real authorization. `middleware.ts` is therefore optional UX sugar, NOT a security layer. (This avoids a false sense of security — a known NextAuth gotcha.)
- **Rate limiting:** magic-link requests are rate-limited per email + IP (short token TTL, single-use).
- **Dev auth:** the `NODE_ENV !== "development"` bypass is **removed** — log in normally in dev (Google or magic link). No backdoors.

## Success Criteria (v1)
- [ ] A customer can sign in via magic link AND via Google.
- [ ] A signed-in customer sees their bookings and orders (matched by email), with live order/shipping status.
- [ ] Guest checkout/booking still works without an account.
- [ ] **A signed-in non-admin customer receives 403 on every admin route/API** (verified by test).
- [ ] Admins retain full dashboard access; `isAdmin`/`role` derived from the **DB user record** (`ADMIN_EMAILS` only a bootstrap seed).
- [ ] The `NODE_ENV !== "development"` auth-bypass is removed everywhere (no dev backdoor).
- [ ] No regression in existing booking/store/payment flows.

## Anti-Patterns to Avoid
- DO NOT ship customer login before the admin-guard audit + access-matrix test passes.
- DO NOT rely on `if (!session)` to mean "is admin" anywhere after the flip.
- DO NOT require an account to book or buy (keep guest flow).
- DO NOT add SMTP config — send magic links through Resend.
- DO NOT trust client-side `isAdmin`; always check server-side via session.
- DO NOT store passwords in v1 (magic link + OAuth only; no credential provider).

---

## Next Steps
1. Review the two PRPs: `01-auth-foundation-admin-hardening.md` and `02-customer-console.md`.
2. Execute **Phase 1** first on a dedicated branch off `develop` — it is a hard prerequisite (the access-matrix test must pass before any customer can log in).
3. Then execute **Phase 2** (customer console).
