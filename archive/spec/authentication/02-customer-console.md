# PRP 02: Customer Console (shadcn) — Bookings, Orders & Account

> **Phase 2 of the Authentication Overhaul** (see `INITIAL.md`). DEPENDS ON PRP 01 — do not start until the Phase 1 access-matrix test passes (customers must be safely sandboxed away from admin first).

## Goal

Give signed-in customers a clean, self-service **`/account` console** built with **shadcn/ui** where they can sign in (magic link or Google), see **My Bookings** and **My Orders** (with live Shippo shipping status), and view their profile — all matched to their account by email, with no migration. Also close the **Square linkage gap** so store orders attach to a Square customer for unified history.

## Why

- Customers self-serve "what did I book?" / "where's my order?" — fewer support pings, especially now that orders carry live tracking.
- A real account surface is the platform for re-order, saved addresses, and loyalty later.
- The existing custom design system (`components/ui/*`) drives the public marketing site; **shadcn (already initialized) gives the logged-in console its own clean, app-like UI** without disturbing the storefront's look.

## What (v1)
- `/login` — magic-link + Google sign-in (page, not modal).
- `/account` — console shell (protected by `requireUser`), with:
  - **My Bookings** — `Customer` records matched by email.
  - **My Orders** — `Order` records matched by email, showing status + tracking (reuse the order status/tracking display concepts from admin).
  - **Profile** — name/email (+ optional saved address/phone in a new `UserProfile`).
- Nav: account/login affordance for customers; admin entry stays separate.
- **Square linkage:** store checkout calls `findOrCreateCustomer` and saves `order.square.customerId` (closes the gap); profile can resolve the customer's `squareCustomerId` for unified history.
- Guest checkout/booking remain fully functional without an account.

### Success Criteria
- [ ] A signed-in customer sees their bookings and orders (by lowercased email), with live order/shipping status.
- [ ] `/account` and its APIs are protected by `requireUser`; a customer can only see **their own** data (scoped by session email), never another user's or any admin view.
- [ ] The console uses shadcn components under `components/ui/shadcn` and does not alter the storefront design system.
- [ ] New store orders attach `square.customerId`; existing email match still works for historical orders.
- [ ] Guest checkout/booking unaffected. `pnpm test/lint/build` green.

---

## All Needed Context

### shadcn is already initialized (verified 2026-06-19)
```yaml
- file: components.json
  facts:
    - style "new-york", baseColor "slate", cssVariables true, rsc true, iconLibrary lucide.
    - aliases: ui -> @/components/ui/shadcn, utils -> @/lib/shadcn/utils, lib -> @/lib/shadcn, components -> @/components.
    - An existing components/ui/shadcn folder is present.
- deps present: tailwindcss ^4, class-variance-authority, clsx, tailwind-merge. (lucide-react may need installing on first component add.)
- Tailwind v4 (CSS @theme in app/globals.css). The EXISTING custom design system (components/ui/Button, Card, Badge, ...) uses --color-* tokens for the marketing site.
- GOTCHA: shadcn expects its own CSS variables (--background, --foreground, --primary, --border, --ring, etc.). Verify these exist in app/globals.css; if missing, add a shadcn :root/.dark theme block WITHOUT overwriting the existing --color-* tokens. The two systems coexist: --color-* = storefront, shadcn vars = console.
```

### Data linkage (verified 2026-06-19)
```yaml
- Bookings:  Customer.billingInfo.emailAddress  (OPTIONAL field — some bookings have only phone)
- Orders:    Order.customer.email               (REQUIRED; index exists: {"customer.email":1, createdAt:-1})
- Neither Customer nor Order has a userId today → v1 uses EMAIL MATCH (lowercased).
- Square: Customer.squareCustomerId is set at booking (/api/customer via squareCustomerService.findOrCreateCustomer).
          Order.square.customerId EXISTS but is NOT populated at checkout today (the gap).
- Live order status/tracking already exist on Order (status, shippo.trackingNumber, shippedAt, deliveredAt) from the Shippo webhook work.
```

### Reuse, don't reinvent
```yaml
- Order display: the admin order detail (app/admin/dashboard/store/orders/[id]/page.tsx) already renders status + tracking;
  extract a shared presentational piece or mirror it for the customer (read-only, no admin actions).
- Square link: lib/square/customers.ts -> squareCustomerService.findOrCreateCustomer / searchByEmail (already built).
- Email send: Resend + components/email-templates shell (already used for store + magic link in PRP 01).
```

---

## Implementation Blueprint

### New data (optional but recommended)
```ts
// lib/models/UserProfile.ts  — customer-editable profile, keyed by the NextAuth user id.
// Keeps the NextAuth `users` doc clean (OAuth fields only) while storing app profile data.
interface IUserProfile {
  userId: string;          // ref users._id
  email: string;           // lowercased, denormalized for matching
  phone?: string;
  savedAddress?: IOrderAddress;
  squareCustomerId?: string; // resolved/cached link to Square
}
// v1 can ship WITHOUT this (profile = session name/email only). Add when saved addresses are needed.
```

### Customer data access — ALWAYS scope by the session user
```ts
// lib/account/queries.ts  — every query is derived from the SESSION email, never a client-supplied one.
export async function getMyOrders(sessionEmail: string) {
  const email = sessionEmail.toLowerCase();
  return Order.find({ "customer.email": email }).sort({ createdAt: -1 }).lean();
}
export async function getMyBookings(sessionEmail: string) {
  const email = sessionEmail.toLowerCase();
  return Customer.find({ "billingInfo.emailAddress": email }).sort({ createdAt: -1 }).lean();
}
// SECURITY: never accept an email/id from the request body for these — only session.user.email.
```

### Task list
```yaml
Task 1 — shadcn theme sanity:
  - Verify shadcn CSS vars exist in app/globals.css; if not, add a :root (+ .dark) block for shadcn tokens
    WITHOUT touching the existing --color-* storefront tokens. Install lucide-react if missing.
  - Add the base shadcn components the console needs: `pnpm dlx shadcn@latest add card table badge tabs button avatar skeleton separator dropdown-menu` (land in components/ui/shadcn).

Task 2 — /login page:
  - app/login/page.tsx: email input -> NextAuth signIn("email", { email }) for magic link, plus a "Continue with Google" button (signIn("google")).
  - Use shadcn Card/Button/Input. Friendly empty/sent states ("check your email").
  - If already authenticated: redirect (admin -> /admin/dashboard, customer -> /account).

Task 3 — /account shell:
  - app/account/layout.tsx (server): `requireUser()` (redirect to /login if not signed in). Render shadcn sidebar/tabs nav: Overview, Bookings, Orders, Profile.
  - app/account/page.tsx: overview (greeting + counts + recent activity).

Task 4 — My Orders:
  - app/account/orders/page.tsx (server): getMyOrders(session.email). shadcn Table + Badge for status; link to a detail view.
  - app/account/orders/[orderNumber]/page.tsx: fetch the order BUT re-verify it belongs to the session email (defense in depth); render read-only status + tracking (reuse admin order display, minus admin controls).

Task 5 — My Bookings:
  - app/account/bookings/page.tsx (server): getMyBookings(session.email). shadcn Card/Table; show event name, dates, participants, payment/refund status.

Task 6 — Profile:
  - app/account/profile/page.tsx: show name/email; (optional) edit phone/saved address via UserProfile.

Task 7 — API (only if client-side fetching is needed):
  - Prefer server components (no API surface). If APIs are required, app/api/account/** must use requireUser and scope strictly to session.user.email. Never trust a body-provided identity.

Task 8 — Square linkage gap (close it):
  - MODIFY app/api/store/checkout/route.ts: before/after payment, call squareCustomerService.findOrCreateCustomer({email,...}) and persist order.square.customerId. Non-blocking (don't fail checkout if Square errors), mirroring the booking flow.
  - Profile/orders can then resolve squareCustomerId (via Order.square.customerId or Customer.squareCustomerId or searchByEmail) for a unified identity. (Exposing Square-side payment ledger is OPTIONAL/Phase 3 — would need a new lib/square/history.ts wrapping listPayments/listOrders.)

Task 9 — Nav integration:
  - Add an account/login affordance to the public nav (components/layout/nav): "Sign in" when logged out; "My Account" when a customer; admins still see their admin entry. Keep guest checkout untouched.

Task 10 — Tests:
  - getMyOrders/getMyBookings scope strictly by session email (no cross-account leakage).
  - /account redirects unauthenticated to /login.
  - order detail rejects an order not owned by the session email.
```

### Pseudocode — protected account layout
```tsx
// app/account/layout.tsx (server component)
import { requireUserPage } from "@/lib/auth/guards"; // redirect variant from PRP 01
export default async function AccountLayout({ children }) {
  const user = await requireUserPage();        // redirects to /login if no session
  return <AccountShell user={user}>{children}</AccountShell>; // shadcn sidebar/tabs
}
```

### Connections summary (how the pieces wire together)
```yaml
Identity:        NextAuth session.user.email (lowercased) is the join key for v1.
Bookings:        Customer.billingInfo.emailAddress == session email.
Orders:          Order.customer.email == session email (indexed).
Square (booking): Customer.squareCustomerId (already linked at booking time).
Square (store):   Order.square.customerId — NEWLY populated in Task 8 (closes the gap).
Tracking:         Order.status / shippo.* (already kept current by the Shippo webhook).
Robust linkage:   Phase 3 stamps userId on Customer/Order at create-time for users who are logged in.
UI:               shadcn (components/ui/shadcn) for the console; storefront keeps components/ui/* design system.
```

---

## Validation Loop

### Level 1 — Static
```bash
pnpm lint && npx tsc --noEmit
```

### Level 2 — Tests
```bash
pnpm test __tests__/account
# scoping: customer A cannot see customer B's orders/bookings
# order detail: 404/redirect when order email != session email
# /account: unauthenticated -> /login
```

### Level 3 — Manual
```bash
pnpm dev
# 1. Sign in as a customer who has a past guest order (same email) -> /account/orders shows it with live status.
# 2. A booking under the same email shows under /account/bookings.
# 3. Try to open another order number not yours -> blocked.
# 4. Place a new store order while logged in -> order.square.customerId is set.
# 5. Storefront visual unchanged; console looks shadcn-clean.
```

## Final Validation Checklist
- [ ] Customer sees only their own bookings + orders (by session email); cross-account access blocked by test.
- [ ] Console renders with shadcn; storefront design system untouched.
- [ ] New store orders set `square.customerId`; historical orders still match by email.
- [ ] Guest checkout/booking still work without an account.
- [ ] `pnpm test && pnpm lint && pnpm build` pass.

## Anti-Patterns to Avoid
- DO NOT query bookings/orders by any client-supplied email or id — only `session.user.email`.
- DO NOT reuse admin order/booking components that expose admin actions in the customer view.
- DO NOT overwrite the storefront `--color-*` tokens when adding shadcn theme vars — both systems coexist.
- DO NOT make accounts required for checkout/booking.
- DO NOT block checkout if the Square customer link fails — keep it non-blocking like the booking flow.
- DO NOT start this PRP before PRP 01's access-matrix test passes.
