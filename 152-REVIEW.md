# PR #152 — Online Store / Checkout: Code Review

**Branch:** `david-working` → `develop` · **Date:** 2026-06-20 · **Status:** Reviewed; changes applied below.

This document records the review of PR #152: the issues identified, the change made for each, and the rationale. It is intended to stand on its own — a developer unfamiliar with the work should be able to read it and understand what changed and why.

---

## Scope of the PR

Online store / checkout only (no auth or booking changes):

1. **State-based sales tax** — `lib/utils/taxHelpers.ts` (per-US-state base rates), applied at checkout, in the order summary, and in the confirmation/admin emails.
2. **Square payment webhook** — `app/api/webhooks/square/route.ts` (+ `lib/utils/webhookHelpers.ts` for HMAC verification, + tests). On `payment.completed`, auto-creates the Shippo label. *(Removed during review — see Finding 8.)*
3. **Checkout UX refactor** — collapsed multi-step flow; payment reveals on rate selection; autofill validation checkmarks; State-dropdown styling; new `CartSummary.tsx`.
4. **Cart** — new `StockCounter.tsx`; cart-clear moved into the drawer close button.
5. **Layout / misc** — the navbar becomes non-sticky on `/checkout` (so the fixed header doesn't overlap the form); Footer hydration fixes for the dynamic copyright year; `.gitignore` ignores `/DOCUMENTATION/` and `/docs/`.

## Baseline (already on `develop` before this PR)

Relevant context for the findings below:

- **Checkout (`/api/store/checkout`)** — captures the Square payment → creates the `Order` (status `paid`) → **synchronously creates the Shippo label** via `purchaseLabelForOrder()` (status → `label_created`) → sends the customer confirmation + admin emails. Label creation is wrapped in `try/catch`; on a Shippo failure the order remains `paid` and a label can be created manually via `/api/store/shipping-label`.
- **Shippo tracking webhook (`/api/webhooks/shippo`, `track_updated`)** — the single source of truth for shipment status:
  - `TRANSIT` (first carrier scan) → status `shipped` + "Your order has shipped!" email (customer + admin).
  - `DELIVERED` → status `delivered` + customer email.
  - `FAILURE` / `RETURNED` → admin-only exception alert.

Consequence: **"shipped" already has a single, precise meaning** — the carrier physically has the package — and the customer "shipped" email is already sent exactly once, by the Shippo webhook.

---

## Findings

### Finding 1 — Square webhook sent a premature "shipped" email
**File:** `app/api/webhooks/square/route.ts` · **Status:** Superseded by Finding 8 (the webhook was later removed entirely)

**Issue.** On the fallback path (order still `paid`), the webhook creates the Shippo label and then emails the customer "Your order has shipped!" at status `label_created`. A created label is not a shipment. The authoritative "shipped" notification already fires from the Shippo `track_updated` webhook at the first carrier scan, so this produces a **premature and duplicate** customer email that contradicts the status model.

**Rationale for keeping the webhook.** The webhook is a legitimate **async safety-net**: if the synchronous label purchase at checkout fails (e.g. a Shippo timeout), the order is left at `paid` with no label. Square retries webhooks, so `payment.completed` provides an automatic retry of label creation. An idempotency guard (`status !== "paid"` → skip) means it is a **no-op on the normal path**, where checkout has already advanced the order to `label_created`.

**Change.**
- Removed the customer "shipped" email from the webhook.
- Kept the merchant "label ready" email and the label-creation fallback.
- Removed now-unused imports (`render`, `React`, `ShippingConfirmationEmail`).
- Updated `__tests__/webhooks/square.test.ts`: the happy path asserts exactly one email is sent ("Label ready") and explicitly **not** a "has shipped" email.

**Net effect.** The Square webhook is purely a label-creation fallback; the Shippo webhook remains the only source of the customer "shipped" notification.

**Follow-up (non-blocking).** The webhook re-implements label purchase inline (`shippoClient.transactions.create`) rather than reusing `purchaseLabelForOrder()` from `lib/shippo/labels.ts`. Reusing the helper would consolidate idempotency and field mapping in one place.

### Finding 2 — Shipping Method and Payment were hidden until prerequisites were met
**File:** `components/store/CheckoutForm.tsx` · **Status:** Resolved

**Issue.** The Shipping Method section was hidden until the address was complete, and Payment until a rate was selected. The checkout appeared empty/incomplete and gave no preview of the remaining steps.

**Change.** All three sections render at all times:
- **Shipping Method** shows a muted placeholder ("Enter your address above to see shipping options.") until the address is complete, then auto-fills with rates (the existing 600ms debounced auto-fetch is unchanged). Rate-fetch errors surface in this placeholder.
- **Payment** shows a muted placeholder until a rate is selected; the Square card form still mounts only once a rate is selected (so the SDK is not initialized before the total is known).
- The rate-fetch error is no longer also passed to `ShippingAddressStep`, removing a duplicate error display.

### Finding 3 — Lint failure: ref read during render
**File:** `components/store/CheckoutForm.tsx` · **Status:** Resolved

**Issue.** `orderCompleted` was a `useRef` whose `.current` was read **during render** (the empty-cart `return null` guard) and in an effect. ESLint's `react-hooks/refs` rule errors on this ("Cannot access refs during render") — render must be a pure function of props + state, and refs do not trigger re-renders — causing `pnpm lint` to fail.

**Change.** Converted `orderCompleted` from `useRef` to `useState`:
- `setOrderCompleted(true)` in `handlePayment`,
- read the state value in the render guard and the redirect effect (added to that effect's dependencies),
- removed the now-unused `useRef` import and a separate unused `Button` import.

Behavior is unchanged (a completed order still suppresses the empty-cart redirect). The file passes ESLint with exit 0.

### Finding 4 — Duplicate trust messaging in the order summary
**File:** `components/store/CartSummary.tsx` · **Status:** Resolved

**Issue.** "256-bit SSL secured checkout" appeared in the order summary **and** as a fuller security block (SSL / Square PCI / never-store-card / returns) beside the payment form — duplicated trust copy.

**Change.** Trust/security messaging belongs next to card entry, so the order-summary one-liner (and its `FaLock` import) was removed; the block beside the payment form is the single source. The Order Summary now shows items and totals only.

> Note: this finding originally also added a state label to the tax line ("Tax (NJ 6.625%)"). That change was superseded by **Finding 6**, which removes sales tax entirely for now.

### Finding 5 — Shipping method presented too many options
**File:** `components/store/CheckoutForm.tsx` · **Status:** Resolved

**Issue.** The Shipping Method section rendered up to three rate cards plus a "See N more options" link — more choice than necessary and likely to confuse.

**Change.** Replaced the cards with a **single `<select>` dropdown** that defaults to the cheapest (recommended) rate and lists all rates as `Name — $price (N days)`. A "Need it sooner? Choose a different option:" helper appears above it when more than one rate is available. The default selection is unchanged (cheapest pre-selected). Removed the now-unused `showAllRates` / `visibleRates` / `hiddenCount`.

### Finding 6 — Sales tax: removed pending a correct implementation
**Files:** `lib/utils/taxHelpers.ts` (deleted), `app/api/store/checkout/route.ts`, `components/store/{CheckoutForm,CartSummary,PaymentStep}.tsx`, `__tests__/webhooks/square.test.ts` · **Status:** Removed (interim)

**Context.** This is a requirements oversight, not an implementation defect. Tax was requested and built before the sales-tax/nexus implications had been researched; the feature did what was asked. The root cause is that the work was scoped prematurely (owned by the request, not the developer), and the removal is a course-correction once the obligations became clear.

**Issue.** The implementation applied a **hardcoded base state rate for every US state**, which is incorrect on two counts:
- **Nexus.** A New-Jersey-based store must collect NJ sales tax from day one, but generally has no obligation in other states until it crosses that state's economic-nexus threshold (commonly ~$100k in sales). Charging a national rate table collects tax in states where there may be no obligation to remit. (See `ecommerce/ecommerce-sales-tax-guide.md`.)
- **Accuracy.** A single base state rate ignores county/city/district surcharges, under-collecting in many jurisdictions.

**Change.** Sales tax was removed from the live flow as an interim measure:
- Checkout total is now `subtotal + shipping`; `Order.taxCents` is persisted as `0` (schema field retained).
- Removed the tax line from the order summary and the tax inputs from the payment step and checkout form.
- Deleted `lib/utils/taxHelpers.ts`.
- Removed the tax-helper unit tests that had been placed in the Square webhook test file.

**Follow-up.** Determine the correct approach with a tax advisor — likely NJ-only to start (Square's built-in Sales Tax can compute this), revisiting other states only when nexus thresholds are crossed.

### Finding 7 — Cart drawer: confusing close / clear / remove controls
**Files:** `components/store/CartDrawer.tsx`, `components/store/CartItemRow.tsx` · **Status:** Resolved

**Issue.** The drawer's header **✕ button** was repurposed: with items in the cart, clicking ✕ opened a native `confirm("Remove all items from your cart?")` and, on confirmation, cleared the cart and closed the drawer. ✕ universally means "close," so overloading it to "delete everything" is surprising and risks accidental cart loss; it also left no plain close affordance and relied on a blocking native dialog. Separately, the **per-item remove** control was an ambiguous **✕** rather than a clear delete affordance.

**Change.**
- **Removed the header ✕ button entirely.** The drawer already closes via the backdrop (click-away) and the ESC key, so a dedicated close control is redundant.
- **Moved "Clear cart" to the top-right of the header** — the cart-level destructive action, shown only when the cart has items (with a confirm).
- **Changed the per-item remove control from ✕ to a trash icon** (`react-icons` `FiTrash2`) — a clear "remove this item" affordance, distinct from closing.

### Finding 8 — Square payment webhook: removed as redundant
**Files (deleted):** `app/api/webhooks/square/route.ts`, `lib/utils/webhookHelpers.ts`, `__tests__/webhooks/square.test.ts` · **Status:** Resolved (removed)

**Issue.** The `payment.completed` webhook auto-created the Shippo label as a fallback, but it is redundant: checkout already creates the label synchronously, so the webhook is a no-op on the normal path (its idempotency guard skips it). The one case it acts on — a failed synchronous label creation — is already handled: the order remains `paid`, and checkout sends the admin a "Shipping Label — Action Needed" email (`StoreOrderAdminEmail`, `labelFailed`) with a one-click manual label route (`/api/store/shipping-label`).

**Change.** Removed the webhook, its HMAC-verification helper (used only here), and its test. This eliminates a second webhook to secure (`SQUARE_WEBHOOK_SIGNATURE_KEY`), configure (`SQUARE_WEBHOOK_URL`), and register in the Square dashboard per environment, plus a duplicated inline copy of the label-purchase logic. No env or dashboard setup is required for it any longer.

**Trade-off.** Automatic retry of label creation on a transient Shippo failure is no longer performed; the failure is still surfaced to the admin (notification + one-click manual label), which provides equivalent coverage with more visibility.

> Supersedes Finding 1: that finding removed this webhook's premature "shipped" email; with the webhook fully removed, that code path no longer exists.

---

## Verification

- `app` / `components` / `lib` pass ESLint with exit 0. (`pnpm lint` reports errors only in the gitignored `spec/Examples/` reference folder, which is not part of the build or CI; remaining warnings are non-blocking.)
- `npx tsc --noEmit` — no errors introduced.
- `pnpm run test:run` — 178 passing.
- `/checkout` renders.

## Reference note — hardcoding volatile data

A static lookup table is appropriate for **stable, internally-owned** values (e.g. parcel-size presets). It is the wrong tool for **volatile, externally-owned** data such as tax rates: those change by legislation, vary by county/city, go stale silently, and require a code deploy to correct. Such values should be sourced from an authoritative, updatable provider (a tax engine), or at minimum from configuration that can change without a redeploy.
