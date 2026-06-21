name: "Authentication Overhaul — Customer Profiles + Admin Hardening (TypeScript/Next.js)"
description: |
  Add customer-facing accounts (Google + passwordless magic link) and a shadcn `/account`
  console (bookings + orders with live shipping status), while hardening admin authorization
  so only admins can reach admin routes/APIs. NextAuth v4 + MongoDB adapter (database sessions).

## Purpose
One-pass implementation guide. The executing agent has only this PRP + codebase access. Context is curated below; follow the dependency-ordered tasks and run the validation loop after each.

## Core Principles
1. **Security before sign-ups**: do not enable customer login until the access-matrix test passes.
2. **Guards are the source of truth** (database sessions ⇒ middleware cannot do authz).
3. **No hacks**: remove the `NODE_ENV !== "development"` auth bypass; roles live in the DB, not env.
4. **Reuse**: existing `session?.user?.isAdmin` pattern, `squareCustomerService`, Resend, shadcn (already init).
5. Follow `CLAUDE.md`/`AGENTS.md`: strict TS (no `any`), `ReactElement` not `JSX.Element`, explicit return types, Server Components by default, logging `console.log("[FILE-FUNC] ...")`.

---

## Goal
Ship customer accounts + a clean shadcn customer console, on a hardened authorization base.

**Deliverable:**
- NextAuth allows any user to sign in via **Google** or **magic link (Resend)**; admins are DB-flagged.
- `lib/auth/guards.ts` (`requireAdmin`/`requireUser`/page variants) enforced on every admin route + the admin dashboard shell; all current guard holes closed; dev auth-bypass removed.
- `/login` page and a protected `/account` console (Overview, My Bookings, My Orders w/ live Shippo status, Profile) built with shadcn, scoped strictly to the session user.
- Store checkout links `Order.square.customerId` (closes the Square gap).
- Tests: admin access-matrix (customer → 403 everywhere), sign-in callback, magic link, account data-scoping.

**Success Definition:** a non-admin customer can sign in, see only their own bookings/orders, and is rejected (403) from every admin endpoint — verified by automated test — with `pnpm run test:run && pnpm lint && pnpm build` green and no regression to booking/store/payment flows.

## Why
- Self-service "what did I book / where's my order" (orders now carry live Shippo tracking) → less support load.
- The current model assumes "logged-in == admin"; opening sign-ups without hardening is a security hole. This forces the fix.
- Foundation for re-order, saved addresses, loyalty.

## What
- Customer-visible: `/login` (Google + magic link), `/account/*` console, a nav "Sign in / My Account" affordance. Guest checkout/booking stay optional (never required).
- Technical: DB-backed roles, centralized authz guards, magic-link provider via Resend, email-match data linkage, Square customer linkage on store checkout.

### Success Criteria
- [ ] Sign in works via Google AND magic link (single-use, ~10-min TTL, rate-limited).
- [ ] New users default to `role: "customer"`; admins resolve from the DB (`ADMIN_EMAILS` = seed only).
- [ ] Every admin route/API + the admin dashboard shell enforce `isAdmin`; access-matrix test: customer → 403, admin → ok.
- [ ] No `NODE_ENV !== "development"` auth bypass remains (`grep` clean).
- [ ] `/account` shows the signed-in user's bookings + orders (by lowercased email) with live order status; a user cannot see another user's data (test-verified).
- [ ] Console uses shadcn (`components/ui/shadcn`); storefront `components/ui/*` design system untouched.
- [ ] `Order.square.customerId` is set on new store orders; historical orders still match by email.
- [ ] `pnpm run test:run && pnpm lint && pnpm build` pass; booking/checkout/refunds/gift-cards unaffected.

## All Needed Context

### Documentation & References
```yaml
# MUST READ
- docfile: PRPs/ai_docs/nextauth-v4-resend-magic-link.md
  why: Exact v4 EmailProvider+Resend pattern, database-session role callback, and the middleware-can't-authz rule. THE most important doc here.

- file: spec/features/authentication/INITIAL.md
  why: Blueprint — locked decisions, resolved questions, Google Cloud plan.
- file: spec/features/authentication/01-auth-foundation-admin-hardening.md
  why: Full route-by-route audit + the exact "routes to harden" table with file:line. Phase 1 detail.
- file: spec/features/authentication/02-customer-console.md
  why: shadcn console layout, query scoping, Square linkage detail. Phase 2 detail.

- url: https://next-auth.js.org/providers/email
  why: NextAuth v4 EmailProvider config + sendVerificationRequest signature.
  critical: maxAge is in SECONDS (default 24h → set ~600). Do not rebuild the magic-link URL by hand.
- url: https://authjs.dev/guides/role-based-access-control
  section: Database/session callback
  critical: With database strategy the `jwt` callback does NOT run; role flows via session({session,user}).
- url: https://github.com/nextauthjs/next-auth/discussions/9609
  why: Confirms middleware RBAC requires JWT — we stay on database sessions and enforce in handlers.
- url: https://ui.shadcn.com/docs/installation/next
  why: shadcn CLI add flow for Next App Router.
- url: https://ui.shadcn.com/docs/tailwind-v4
  critical: shadcn theme CSS vars for Tailwind v4; coexist with existing --color-* tokens (do not overwrite).

# CODEBASE PATTERNS TO MIRROR
- file: auth.ts
  why: Current NextAuth config (Google, MongoDBAdapter, database strategy, signIn whitelist, session sets isAdmin). MODIFY here.
- file: types/next-auth.d.ts
  why: User/Session/JWT already extended with isAdmin — add `role` the same way.
- file: app/api/refunds/route.ts
  why: CANONICAL correct guard — `if (!session?.user?.isAdmin) return 401`. Copy this semantic into guards.
- file: app/api/admin/store/orders/route.ts
  why: Example of the BROKEN pattern (`if (!session)` + NODE_ENV bypass) to replace.
- file: app/admin/dashboard/layout.tsx
  why: Admin shell — currently only checks session existence; must use requireAdminPage().
- file: lib/square/customers.ts
  why: squareCustomerService.findOrCreateCustomer — reuse to link Order.square.customerId at checkout.
- file: app/api/customer/route.ts
  why: Reference for how booking flow already calls findOrCreateCustomer (non-blocking).
- file: app/api/store/checkout/route.ts
  why: MODIFY — add Square customer linkage (set order.square.customerId).
- file: lib/models/Order.ts
  why: Order.customer.email (indexed), Order.square.customerId (exists, unused). Money in cents.
- file: lib/models/Customer.ts
  why: billingInfo.emailAddress (OPTIONAL), squareCustomerId. "My bookings" matches here.
- file: components.json
  why: shadcn config — ui alias @/components/ui/shadcn, utils @/lib/shadcn/utils, style new-york, baseColor slate.
- file: app/admin/dashboard/store/orders/[id]/page.tsx
  why: Existing order status/tracking display to mirror (read-only) for the customer order view.
- file: __tests__/hooks/mutations/use-create-customer.test.ts
  why: Existing vitest patterns (mocking, describe/it) to mirror for new tests.
```

### Current Codebase tree (relevant)
```bash
auth.ts                                  # NextAuth v4 config (MODIFY)
types/next-auth.d.ts                     # session/user types (MODIFY: add role)
lib/
  mongodb.ts                             # clientPromise → DB from MONGODB_URI
  square/customers.ts                    # squareCustomerService.findOrCreateCustomer
  models/{Customer,Order,...}.ts
components/ui/                            # storefront design system (DO NOT shadcn-ify)
  shadcn/                                # shadcn components land here (alias)
app/
  admin/dashboard/layout.tsx             # admin shell guard (MODIFY)
  api/admin/store/**                     # session-only checks + NODE_ENV bypass (HARDEN)
  api/{event/[id],reservations/[id],square/customers/**,send,gift-cards/list,gift-cards/[id]/activities,store/shipping-label}/route.ts  # HARDEN
  api/store/checkout/route.ts            # MODIFY (Square link)
__tests__/                               # vitest
```

### Desired Codebase tree (new files + responsibility)
```bash
lib/auth/guards.ts                       # requireAdmin/requireUser + page-redirect variants (authz source of truth)
lib/account/queries.ts                   # getMyOrders/getMyBookings — scoped by SESSION email only
lib/email/magic-link.tsx                 # MagicLinkEmail template (Resend) or reuse components/email-templates
scripts/grant-admin.ts                   # set users.role/isAdmin by email (DB-backed roles; replaces editing env)
middleware.ts                            # OPTIONAL coarse cookie redirect for /admin (UX only, NOT authz)
app/login/page.tsx                       # Google + magic-link sign-in (shadcn)
app/account/layout.tsx                   # requireUserPage() shell (shadcn nav/tabs)
app/account/page.tsx                     # overview
app/account/orders/page.tsx             # My Orders (Order by session email)
app/account/orders/[orderNumber]/page.tsx# read-only order detail (re-verify ownership)
app/account/bookings/page.tsx           # My Bookings (Customer by session email)
app/account/profile/page.tsx            # name/email (+ optional UserProfile)
__tests__/auth/access-matrix.test.ts    # customer→403 on every admin endpoint
__tests__/auth/signin-callback.test.ts  # non-admin allowed; seed→admin; email lowercased
__tests__/account/scoping.test.ts        # user A cannot read user B's data
# OPTIONAL: lib/models/UserProfile.ts (saved address/phone) — only if profile editing ships in v1
```

### Known Gotchas & Library Quirks
```ts
// CRITICAL: NextAuth here is v4 (next-auth, getServerSession), NOT Auth.js v5. Import EmailProvider from
//   "next-auth/providers/email". authjs.dev examples use different import paths — translate.
// CRITICAL: session.strategy = "database" ⇒ the `jwt` callback NEVER runs. Role flows via session({session,user}).
// CRITICAL: Edge middleware CANNOT read the DB session/role ⇒ middleware is UX-only; real authz in handlers/server components.
// CRITICAL: EmailProvider defaults to SMTP. Override sendVerificationRequest to use Resend. maxAge is SECONDS.
// CRITICAL: Email casing — Customer/Order store emails; ALWAYS .toLowerCase() on write and when comparing session email,
//   or "my bookings"/"my orders" silently miss rows.
// CRITICAL: Removing the `if (process.env.NODE_ENV !== "development")` wrappers means you must log in for real in dev.
// GOTCHA: getServerSession MUST be passed authOptions (existing pattern). Server Components by default; mark "use client" only for the login form interactivity.
// GOTCHA: auth.ts already has a v5-SHAPED export at the bottom — `export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)` —
//   even though the package is genuinely next-auth v4. Keep using getServerSession(authOptions) for guards. Do not delete that line
//   unless you confirm nothing imports auth/handlers from it; just add EmailProvider into authOptions.providers.
// GOTCHA: NextAuth user.email is `string | null | undefined`. getSessionUser() MUST narrow it (return null if no email) so the
//   `.toLowerCase()` calls in the query/ownership pseudocode are strict-mode safe. SessionUser.email should be `string` only after that guard.
// GOTCHA: Mongoose `.lean()` returns loosely-typed objects (no-any rule). Type the result in the /account pages (e.g. `as IOrder[]`/a view type),
//   do not leave them implicitly any.
// GOTCHA: shadcn needs its own CSS vars (--background/--foreground/--primary/--border/--ring). Add a shadcn :root/.dark block
//   in app/globals.css WITHOUT overwriting the existing --color-* storefront tokens. Install lucide-react if missing.
// GOTCHA: TanStack Query is used for client data; prefer Server Components for /account reads (no API surface, no client leak).
```

## Implementation Blueprint

### Data models & types
```ts
// types/next-auth.d.ts — add role alongside existing isAdmin:
//   User { role?: "customer" | "admin"; isAdmin?: boolean }
//   Session.user { ...; role?: "customer" | "admin"; isAdmin?: boolean }
// users collection (NextAuth-managed) gains: role: "customer"|"admin" (default "customer"), isAdmin: boolean.
// Order.square.customerId already exists — start populating it.
// OPTIONAL lib/models/UserProfile.ts: { userId, email (lowercased), phone?, savedAddress?, squareCustomerId? }
```

### Tasks (dependency-ordered)
```yaml
# ---------- PHASE 1: FOUNDATION + HARDENING (do first; gate = access-matrix test) ----------
Task 1 — MODIFY types/next-auth.d.ts:
  - ADD role to User and Session.user (mirror existing isAdmin declarations).

Task 2 — CREATE lib/auth/guards.ts:
  - getSessionUser(), requireAdmin()→401/403 Response, requireUser()→401 Response,
    requireAdminPage()/requireUserPage()→redirect("/login"). MIRROR app/api/refunds semantics.

Task 3 — MODIFY auth.ts (see ai_docs for exact code):
  - signIn: lowercase email; REMOVE `return false`; seed admin from ADMIN_EMAILS or keep existing role; default "customer".
  - ADD EmailProvider with Resend sendVerificationRequest, maxAge 600.
  - session: expose session.user.role; derive isAdmin from role.

Task 4 — HARDEN routes (full file:line list in 01-*.md). Replace each with `const g = await requireAdmin(); if (g instanceof NextResponse) return g;`:
  - app/api/admin/store/orders/route.ts + [id]/route.ts
  - app/api/admin/store/products/route.ts + [id]/route.ts
  - app/api/store/shipping-label/route.ts
  - app/api/gift-cards/list/route.ts ; app/api/gift-cards/[id]/activities/route.ts
  - app/api/event/[id]/route.ts (PATCH) ; app/api/reservations/[id]/route.ts (PUT)
  - app/api/square/customers/route.ts + [id]/route.ts + migrate/route.ts
  - app/api/send/route.ts
  - DELETE every `if (process.env.NODE_ENV !== "development")` auth wrapper.

Task 5 — MODIFY app/admin/dashboard/layout.tsx:
  - await requireAdminPage() (checks isAdmin, redirects non-admins). Remove NODE_ENV bypass.

Task 6 — CREATE scripts/grant-admin.ts:
  - set users.role="admin", isAdmin=true by email (DB-backed roles; documents the model).

Task 7 — (Optional) CREATE middleware.ts:
  - matcher ["/admin/:path*"]; redirect to /login when no session cookie. UX ONLY (comment that it is not authz).

Task 8 — TESTS (the gate):
  - __tests__/auth/access-matrix.test.ts (customer→403 on every admin endpoint; admin→ok; drive from a list).
  - __tests__/auth/signin-callback.test.ts (non-admin allowed+role customer; seed→admin; email lowercased).

# ---------- PHASE 2: CUSTOMER CONSOLE (after gate passes) ----------
Task 9 — shadcn sanity + components:
  - Verify/append shadcn theme vars in app/globals.css (don't touch --color-*). Install lucide-react if missing.
  - `pnpm dlx shadcn@latest add card table badge tabs button input avatar skeleton separator dropdown-menu`.

Task 10 — CREATE lib/account/queries.ts:
  - getMyOrders(sessionEmail), getMyBookings(sessionEmail) — lowercase email; NEVER accept client-supplied identity.

Task 11 — CREATE app/login/page.tsx (client component for the form):
  - email → signIn("email",{email}); "Continue with Google" → signIn("google"). shadcn Card/Input/Button. "Check your email" state. If already authed, redirect (admin→/admin/dashboard, else /account).

Task 12 — CREATE app/account/** (server components):
  - layout.tsx requireUserPage() + shadcn nav; page.tsx overview; orders/page.tsx (Table+Badge, live status);
    orders/[orderNumber]/page.tsx (re-verify order.customer.email === session email else notFound());
    bookings/page.tsx; profile/page.tsx.

Task 13 — MODIFY app/api/store/checkout/route.ts:
  - After payment, squareCustomerService.findOrCreateCustomer({email,...}); set order.square.customerId. NON-BLOCKING (mirror booking flow; never fail checkout on Square error). Lowercase email.

Task 14 — MODIFY nav (components/layout/nav):
  - "Sign in" when logged out; "My Account" for customers; admins keep admin entry. Guest checkout untouched.

Task 15 — TESTS:
  - __tests__/account/scoping.test.ts (A cannot read B's orders/bookings; order detail notFound when not owner).
```

### Per-task pseudocode (critical bits)
```ts
// Task 2 — lib/auth/guards.ts
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const u = await getSessionUser();                    // getServerSession(authOptions)
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!u.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); // <-- the fix
  return u;
}
export async function requireUserPage(): Promise<SessionUser> {
  const u = await getSessionUser(); if (!u) redirect("/login"); return u;
}

// Task 4 — every hardened API route:
const guard = await requireAdmin();
if (guard instanceof NextResponse) return guard;     // 401/403 early-return

// Task 10 — lib/account/queries.ts (scope by SESSION email ONLY)
export async function getMyOrders(sessionEmail: string) {
  await connectMongo();
  return Order.find({ "customer.email": sessionEmail.toLowerCase() }).sort({ createdAt: -1 }).lean();
}

// Task 12 — app/account/orders/[orderNumber]/page.tsx ownership re-check
const user = await requireUserPage();
const order = await Order.findOne({ orderNumber }).lean();
if (!order || order.customer.email.toLowerCase() !== user.email.toLowerCase()) notFound();

// Task 13 — checkout Square link (non-blocking)
try {
  const { customerId } = await squareCustomerService.findOrCreateCustomer({ email: customer.email.toLowerCase(), firstName, lastName, phone });
  await Order.findByIdAndUpdate(order._id, { "square.customerId": customerId });
} catch (e) { console.error("[CHECKOUT-squareLink] non-fatal:", e); }
```

### Integration Points
```yaml
AUTH:
  - auth.ts: EmailProvider (Resend), signIn flip, session role. types/next-auth.d.ts: role.
EMAIL:
  - RESEND_API_KEY (exists). Magic links go to the REAL address even in dev/stage (only STORE emails redirect to DEV_EMAIL).
GOOGLE CLOUD:
  - Business-GCP OAuth client already created; consent screen must be Published (External) before customer launch (see INITIAL.md).
  - FIX: NEXTAUTH_URL must be the base origin (http://localhost:3000), NOT ".../api/auth".
DB:
  - users.role added at sign-in (no migration). Indexes already exist: Order {"customer.email":1, createdAt:-1}.
SHADCN:
  - components/ui/shadcn (alias). Add theme vars without overwriting --color-* storefront tokens.
```

## Validation Loop

### Level 1: Syntax, types, and security-grep
```bash
pnpm lint
npx tsc --noEmit
# Backdoor MUST be gone (no output):
grep -rn 'NODE_ENV !== "development"' app/ | grep -i 'session\|auth'
# No admin route may early-return on bare !session (no output expected):
grep -rn 'if (!session)' app/api/admin app/api/gift-cards/list app/api/store/shipping-label
```

### Level 2: Unit/integration (vitest — mirror __tests__ patterns)
```bash
pnpm run test:run __tests__/auth __tests__/account
# access-matrix: mock customer session → 403 on each admin endpoint; admin session → ok.
# signin-callback: non-admin allowed (role customer); ADMIN_EMAILS seed → admin; email lowercased.
# scoping: getMyOrders/getMyBookings return ONLY the session email's rows; order detail notFound for non-owner.
```

### Level 3: Manual (local)
```bash
pnpm dev
# 1. Magic link to a personal email (Resend) → sign in → customer session, NOT in /admin.
# 2. GET /api/admin/store/orders as that customer → 403.
# 3. /account/orders shows that email's past (guest) orders with live status; another order# → notFound.
# 4. Sign in with an ADMIN_EMAILS address → /admin/dashboard loads.
# 5. New store order while logged in → order.square.customerId set.
# 6. Storefront visuals unchanged; console looks shadcn-clean.
```

## Final Validation Checklist
- [ ] `pnpm run test:run` green (auth + account suites).
- [ ] `pnpm lint` and `npx tsc --noEmit` clean.
- [ ] `pnpm build` succeeds.
- [ ] Backdoor/hole greps return nothing.
- [ ] Access-matrix: customer 403 on every admin endpoint; admin unaffected.
- [ ] Magic link single-use, ~10-min, rate-limited; Google login works.
- [ ] /account scoped to the user; cross-account access blocked by test.
- [ ] Order.square.customerId set on new orders; historical email match still works.
- [ ] Storefront design system untouched; console uses shadcn.
- [ ] No regression: booking signup, checkout, refunds, gift cards.

---

## Anti-Patterns to Avoid
- ❌ Enabling customer login before the access-matrix test passes.
- ❌ Trusting `middleware.ts` for authorization with database sessions (cookie presence ≠ admin).
- ❌ Keeping any `NODE_ENV !== "development"` auth bypass.
- ❌ Gating live authz on `ADMIN_EMAILS` at request time (seed only; read the DB user).
- ❌ Querying bookings/orders by a client-supplied email/id (use `session.user.email` only).
- ❌ Overwriting storefront `--color-*` tokens when adding shadcn theme vars.
- ❌ Adding a password/Credentials provider (magic link + Google only).
- ❌ Failing checkout when the Square link errors (keep it non-blocking).
- ❌ Using `any`, `JSX.Element`, or client components where a Server Component suffices.

---
**Confidence (one-pass success): 8.5/10.** High because the codebase was fully audited (exact files/lines), shadcn is already initialized, the data layer is understood, and the NextAuth-v4-Resend pattern is captured in ai_docs. Residual risk: shadcn theme-var coexistence with Tailwind v4 + the existing custom design system, and the breadth of the route-hardening sweep (mitigated by the explicit table + grep gates).
