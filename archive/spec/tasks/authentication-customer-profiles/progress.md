# Execution Tracker — Authentication: Customer Profiles + Admin Hardening

PRP: `PRPs/authentication-customer-profiles.md` · Branch: `feat/auth-customer-profiles` · Started: 2026-06-19

Order note: guards + route-hardening land BEFORE the `signIn` gate flip (no window where customers can hit unhardened routes). Phase 2 is gated behind the Phase 1 access-matrix test passing.

## Phase 1 — Foundation + Admin Hardening (security-critical)
- [x] T1  types/next-auth.d.ts — add `role` to User + Session.user
- [x] T2  lib/auth/guards.ts — getSessionUser / requireAdmin / requireUser / *Page variants
- [x] T4  Harden routes → requireAdmin; DELETE NODE_ENV bypass:
  - [ ] app/api/admin/store/orders/route.ts (+ [id])
  - [ ] app/api/admin/store/products/route.ts (+ [id])
  - [ ] app/api/store/shipping-label/route.ts
  - [ ] app/api/gift-cards/list/route.ts
  - [ ] app/api/gift-cards/[id]/activities/route.ts
  - [ ] app/api/event/[id]/route.ts (PATCH)
  - [ ] app/api/reservations/[id]/route.ts (PUT)
  - [ ] app/api/square/customers/route.ts (+ [id], + migrate)
  - [ ] app/api/send/route.ts
- [x] T5  app/admin/dashboard/layout.tsx — requireAdminPage(); remove NODE_ENV bypass
- [x] T3  auth.ts — signIn flip (DB roles via lib/auth/roles.ts, ADMIN_EMAILS seed via events.createUser + session fallback), EmailProvider+Resend (maxAge 600, DB-backed rate limit), session role
- [x] T6  scripts/grant-admin.ts — DB-backed admin grant
- [~] T7  middleware.ts — DEFERRED (optional UX-only; server-component guard is the real boundary)
- [x] T8  Tests: __tests__/auth/{roles,guards,access-matrix}.test.ts (40 tests)  ← GATE PASSED
- [+] Extra: lib/auth/roles.ts (pure, testable role logic); MagicLinkEmail.tsx; nodemailer added (dormant v4 EmailProvider peer dep)

### Phase 1 validation gate — ALL PASSED 2026-06-19
- [x] `pnpm lint` clean · `npx tsc --noEmit` no new errors (pre-existing test-mock errors only)
- [x] backdoor grep clean; `if (!session)` hole grep clean
- [x] `pnpm run test:run` green — 218/218 (auth gate 40/40; customer→403 on every admin route)
- [x] `pnpm build` succeeds

## Phase 2 — Customer Console — COMPLETE + VALIDATED 2026-06-19
- [x] T9  shadcn: added table/tabs/input/avatar/dropdown-menu; lucide-react installed; theme untouched
- [x] T10 lib/account/queries.ts (case-insensitive email match, session-scoped)
- [x] T11 app/login/page.tsx (server redirect-if-authed) + components/authentication/LoginForm.tsx (Google + magic link)
- [x] T12 app/account/** (layout, overview, orders, orders/[orderNumber] w/ ownership re-check, bookings, profile) + OrderStatusBadge + AccountNav
- [x] T13 app/api/store/checkout/route.ts — sets Order.square.customerId (non-blocking)
- [x] T14 nav: components/authentication/AccountNavLink.tsx wired into NavBar (Sign in / My Account)
- [x] T15 __tests__/account/scoping.test.ts (4 tests — no cross-account leakage)

### Phase 2 validation — ALL PASSED
- [x] `pnpm lint` clean · `npx tsc --noEmit` no new errors
- [x] `pnpm run test:run` 222/222 (account scoping 4)
- [x] `pnpm build` succeeds · /login → 200 · /account → 307 /login (protected)

## STATUS: Both phases complete + validated. Uncommitted on `feat/auth-customer-profiles`.
