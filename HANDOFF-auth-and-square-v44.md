# Handoff — Authentication go-live + Square v44 SDK migration

**As of:** 2026-06-21 · **Branch:** `ben-working` (pushed)

This document covers the two pieces of outstanding work: (1) the **authentication /
customer-profiles** feature (built + merged — what remains is go-live config + later
enhancements), and (2) the **Square v44 SDK migration** (planned, PRP written, not yet
executed).

---

## 0. Where `ben-working` is right now (context)

`ben-working` currently carries, on top of the David store review (#152) + the auth feature:

| Work | State |
|------|-------|
| **Auth / customer profiles** (Phase 1 + 2) | built + merged (commit `835dbe5`) |
| **Checkout price integrity** (store + bookings recompute server-side) | merged (`262808b`) |
| **CSP + security headers** | merged, **Report-Only** (`2d73978`) |
| **Retry-stable idempotency keys** | merged (`9934edd`) |
| **Checkout UX polish** (SDK on load, real card logos, dividers) | merged (`a343344`, `a109553`) |
| **Square v44 migration** | PRP + ai_doc only (`PRPs/square-v44-sdk-migration.md`) — NOT executed |

### Other outstanding (carried from the prior `HANDOFF.md`, now archived)
- [ ] **Open the PR `ben-working → develop`** (needs `gh auth login`).
- [ ] **Flip CSP from Report-Only to enforced** after a production smoke test (1-line change
      in `next.config.ts`: `Content-Security-Policy-Report-Only` → `Content-Security-Policy`).
- [ ] **Legal pages** — `/privacy` + `/terms` are live with a "draft pending review" banner.
      Owner must supply the `NEEDS FROM ASHLEY` items (cancellation/refund, returns, shipping,
      media consent, waiver, legal entity). A published privacy policy is a **prerequisite for
      the Google consent screen** (§1). Attorney review recommended before launch.
- [ ] **Sales tax** — removed for now. Decide with a tax advisor — likely **NJ-only** to start
      (Square's Sales Tax engine), revisiting other states only at nexus thresholds. Do **not**
      reinstate the hardcoded national rate table. Background: `ecommerce/ecommerce-sales-tax-guide.md`.
- [ ] **Shippo tracking webhook deployment** — per env: set `SHIPPO_WEBHOOK_SECRET` + register
      the dashboard webhook (Event: Track Updated; Test for stage, Live for prod) at
      `<origin>/api/webhooks/shippo?token=<secret>`.
- [ ] **Rotate the MongoDB `coastal_app` password** (was exposed in a since-deleted plaintext
      file + a chat transcript). Rotate in Atlas, then update `MONGODB_URI` in `.env` + Vercel.
- [ ] **Apple/Google Pay express checkout** (optional) — spec at
      `spec/features/02-enhanced-payments-apple-google-pay.md`. Google Pay / Cash App Pay are
      doable with the embedded Web Payments SDK; Apple Pay needs Square/Apple domain registration.

---

## 1. Authentication / customer profiles

**Status: BUILT AND MERGED.** Phase 1 (admin hardening + DB-backed roles + passwordless
magic link) and Phase 2 (the `/account` customer console) are implemented, tested, and on
`ben-working`. What remains is **go-live configuration (per environment)** + **later
enhancements** — not core code.

### How it works (so you don't re-derive it)
- **NextAuth v4 + MongoDB adapter, `database` session strategy** (NOT JWT). Config in `auth.ts`.
- **Sign-in:** Google OAuth + passwordless magic link (NextAuth `EmailProvider` whose
  `sendVerificationRequest` sends via **Resend** — no SMTP; `nodemailer` is a dormant peer dep).
- **Roles are DB-backed** (`lib/auth/roles.ts`): the `users` collection carries
  `role: "customer" | "admin"`. `ADMIN_EMAILS` is a **bootstrap seed only — never the
  request-time gate**.
- **Authz is enforced in code, NOT middleware** (`lib/auth/guards.ts`): because sessions are
  DB-backed, Edge middleware can't read the role. API routes use
  `const g = await requireAdmin(); if (g instanceof NextResponse) return g;`; server
  components use `requireAdminPage()` / `requireUserPage()`.
- **Customer console:** `/login` + `/account` (Overview, My Orders w/ live Shippo tracking,
  My Bookings, Profile). Reads are scoped strictly to the session email via
  `lib/account/queries.ts` (case-insensitive; never client-supplied). Uses **shadcn/ui**
  (`components/ui/shadcn/`), kept separate from the storefront design system.

### What remains BEFORE customers can use it (config / ops, per environment)
- [ ] **Publish the Google consent screen** (External → Production) in the **business GCP**
      OAuth project. Basic scopes (`openid`/`email`/`profile`) are non-sensitive → no Google
      verification review. Until published, only listed test users can sign in with Google.
      **Prerequisite:** a published privacy policy (the `/privacy` page exists with a draft
      banner — see original HANDOFF §3 "Legal pages").
- [ ] **Fix `NEXTAUTH_URL` in Vercel** for stage + prod — must be the **base origin**
      (`https://stg.coastalcreationsstudio.com` / `https://coastalcreationsstudio.com`),
      NOT `.../api/auth`. (Local already fixed.)
- [ ] **Roll the business OAuth client per environment** (local → stage → prod): add the
      three redirect URIs (`<origin>/api/auth/callback/google`) + JS origins to the client;
      keep the old agency client until prod is verified, then decommission.
- [ ] **Grant admins in the DB**: `pnpm tsx scripts/grant-admin.ts <email>` (roles are
      DB-backed; `ADMIN_EMAILS` is only a bootstrap seed). Existing admins resolve via the
      seed and get `role` stamped on next login. Use `--revoke` to remove.
- [ ] **Resend** sends the magic links (wired via `RESEND_API_KEY`) — confirm the from-domain
      is verified in each env.

### Hard rule (already enforced — keep it green)
- A signed-in **non-admin** must get **403 on every admin route**. The
  `__tests__/auth/` access-matrix test guards this. When adding admin routes, use
  `requireAdmin` / `requireUser` from `lib/auth/guards.ts` — **never a bare `if (!session)`**.

### Phase 3 (future, optional — not started)
- [ ] **Stamp `userId` on `Customer` / `Order` at creation** for robust linkage. Today the
      `/account` views match by lowercased email; a `userId` stamp is the planned hardening.
      (Store checkout already sets `Order.square.customerId`; bookings link by email.)
- [ ] Saved addresses, re-order, profile editing, self-service cancellations.
- [ ] (Nice-to-have) Tie store/booking history to the Square customer profile end-to-end.

### Source-of-truth docs
- PRP: `PRPs/authentication-customer-profiles.md`
- Blueprint: `spec/features/authentication/` (INITIAL.md, 01-auth-foundation, 02-customer-console)
- Notes: `PRPs/ai_docs/nextauth-v4-resend-magic-link.md`
- Tests: `__tests__/auth/` (access matrix), `__tests__/account/` (data scoping)

---

## 2. Square v44 SDK migration (off `square/legacy`)

**Status: PLANNED — PRP + verified mapping written, NOT executed.** No server file has been
migrated; all Square server code still imports `square/legacy`. This is **optional
modernization, not a deadline** — `square/legacy` is the compatibility surface Square
deliberately bundles inside v44 and supports indefinitely.

### What's been done
- **PRP:** `PRPs/square-v44-sdk-migration.md` (quality-checked, ~9/10) — dependency-ordered,
  per-file plan, validation loop incl. a mandatory sandbox pass.
- **Verified method-mapping doc:** `PRPs/ai_docs/square-v44-migration.md` — the legacy→v44
  table was **checked against the installed `square@44.1.0` typings**, including the
  non-obvious reshapes. READ THIS FIRST when executing.

### Where we are / the shape of the work
Server-only refactor (the client Web Payments SDK `react-square-web-payments-sdk` is
**unaffected**). 8 files construct a legacy client today:

| File | Legacy → v44 |
|------|--------------|
| `app/actions/actions.ts` | `paymentsApi.createPayment` → `client.payments.create` |
| `app/api/store/checkout/route.ts` | `paymentsApi.createPayment` → `client.payments.create` |
| `app/api/payments/route.ts` | DEAD route (no caller) → migrate or **delete** |
| `app/api/refunds/route.ts` | `refundsApi.refundPayment` → `client.refunds.refundPayment` |
| `lib/square/customers.ts` | `customersApi.*` → `client.customers.{search,create,get,update,delete}` |
| `lib/square/catalog.ts` | `catalogApi.*` + `inventoryApi.*` + `ApiError` |
| `lib/square/products.ts` | duplicate/unused catalog reader → confirm dead, **delete** |
| `lib/square/gift-cards.ts` | `giftCardsApi.*` + `giftCardActivitiesApi.*` + `ordersApi.*` + `paymentsApi.*` |

Four mechanical change-classes: (1) client construction `new Client({accessToken,
environment: Environment.X})` → `new SquareClient({token, environment: SquareEnvironment.X})`;
(2) **drop every `response.result.X` → `response.X`** (highest-churn, easiest to miss);
(3) method renames; (4) `ApiError` → `SquareError`.

### ⚠️ Non-obvious traps (a naive find/replace WILL break these)
- **Gift card activities are NESTED:** `client.giftCards.activities.{create,list}` — there is
  no top-level `client.giftCardActivities`.
- **Catalog single-object retrieve moved:** `client.catalog.object.get({objectId, includeRelatedObjects})`,
  not `client.catalog.get`. Batch is `client.catalog.batchGet`.
- **Inventory:** `batchRetrieveInventoryCounts` → `client.inventory.batchGetCounts` (NOT the `deprecated*` variants).
- **`retrieveGiftCardFromGAN` → `getFromGan`** (casing: `Gan`).
- **ID-by-path methods take an OBJECT now:** `{customerId}`, `{giftCardId}`, `{objectId}`.

### ⚠️ NEW context since the PRP was written (IMPORTANT)
This session landed **price-integrity** and **idempotency-key** changes into the same charge
files. The migration MUST preserve them when swapping to `client.payments.create`:
- `app/actions/actions.ts` `submitPayment` — keep `resolveBookingCharge(...)` (server-side
  recompute) and `idempotencyKey: normalizeIdempotencyKey(idempotencyKey)`. Also: this action
  RETURNS to client components that read `.result.payment`, so **wrap the v44 `{ payment }`
  back into `{ result: { payment } }`** (the PRP's "adapter") rather than changing the
  components.
- `app/api/store/checkout/route.ts` — keep `priceCartFromCatalog(...)` /
  `resolveShippingRate(...)` and `normalizeIdempotencyKey(body.idempotencyKey)`.
- `lib/square/gift-cards.ts` — keep the `paymentIdempotencyKey` param on the payment step.
- `lib/square/catalog.ts` — used by `priceCartFromCatalog` (price integrity); the BigInt-free
  DTO contract (`Number(amount)` conversions) must stay (BigInt still throws in JSON).

### Validation (required before merge)
- Per-file: `npx tsc --noEmit` + `pnpm run lint`; keep exported function signatures identical
  so callers + the test mocks (`__tests__/checkout/storePricing.test.ts` mocks
  `@/lib/square/catalog`) stay green.
- `pnpm run test:run` (252 tests today) + `pnpm run build`.
- **Mandatory SANDBOX end-to-end pass** (`SQUARE_ENVIRONMENT=sandbox`): event booking charge,
  reservation charge, store checkout, refund, gift-card purchase + balance + redeem, catalog
  list + product detail + inventory. This is money code — do not merge without it.

### Recommended execution
Run via `/prp-ts-execute PRPs/square-v44-sdk-migration.md` as its **own branch + PR**, lowest-
risk files first (customers → catalog → gift cards → refunds → charges), DEAD route
(`app/api/payments/route.ts`) and duplicate (`lib/square/products.ts`) deleted last. Do NOT
bundle with other work.

### Doc URLs
- Migration guide: https://developer.squareup.com/docs/sdks/nodejs/migration
- New SDK README: https://github.com/square/square-nodejs-sdk/blob/master/README.md
