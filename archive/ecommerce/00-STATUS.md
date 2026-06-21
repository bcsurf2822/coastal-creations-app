# E-Commerce Order Flow — Build Status

> Single source of truth for what is **built**, **partial**, and **not started** across the
> e-commerce flow defined in `INITIAL.md`. Update this file as phases land.
> Last reviewed: 2026-06-13.

## 🎉 Milestone — full happy path verified end-to-end (sandbox)

Browse → cart → checkout → **live Shippo rates** → Square sandbox payment → order saved (`paid`)
→ **auto-purchase shipping label** → status `label_created` → merchant email **with the label
PDF** → (manual `mark_shipped` → customer tracking email). A real USPS test label + tracking number
were generated successfully. Remaining work below is feature breadth + UI wiring + production
hardening, not core-flow correctness.

## Legend

- ✅ **Done** — implemented and working
- 🟡 **Partial** — core works, known gaps listed
- 🔴 **Not started / misaligned** — needs a TODO doc (see bottom)

---

## Phase 0 — Foundations ✅ Done

| Item | File(s) | Notes |
|---|---|---|
| `Order` model | `lib/models/Order.ts` | Snapshots line items, Square + Shippo ids, status lifecycle, refund fields, `orderNumber` auto-gen, indexes. |
| `StoreProductSettings` model | `lib/models/StoreProductSettings.ts` | Now **optional** — parcel preset + slug + display order overrides only. `isOnlineSellable` field retained but **unused** (visibility moved to Square categories — see B0). |
| Shippo rates | `lib/shippo/rates.ts` | `getShippingRates()` builds shipment from **env-driven** ship-from + parcel preset → sorted rates. |
| Shippo labels | `lib/shippo/labels.ts` | `purchaseLabelForOrder()` — **idempotent** label purchase (no-op if `transactionId` exists). |
| Parcel / money / catalog helpers | `lib/utils/parcelHelpers.ts`, `moneyHelpers.ts`, `catalogHelpers.ts` | Presets SMALL/MEDIUM/LARGE; cents↔dollars; Square catalog → view model + `isInOnlineSalesCategory`. |
| Cart types | `lib/types/cartTypes.ts` | — |

**Resolved since first review:**
- ✅ Ship-from is now **env-driven** (`MERCHANT_SHIP_FROM_*`), not hardcoded (was `06` #1).
- ✅ Label purchase is **idempotent** (`purchaseLabelForOrder`).
- ✅ Required shadcn deps installed (`pnpm install` — `class-variance-authority`, `radix-ui`,
  `tailwind-merge`; was the cause of a `/store` build error).

**Still carried forward:** order creation + each email are **not yet idempotent** under webhook
retries (see `06-hardening.md`).

## Phase A1 — Shop page 🟡 Done, pending variant cutover

- `app/store/page.tsx`, `app/store/[slug]/page.tsx`, `components/store/StoreGrid.tsx`,
  `ProductCard.tsx`, `ProductDetail.tsx`, `hooks/queries/use-products.ts`.
- Live data pipeline proven: `useProducts()` → `/api/store/products` → Square catalog → images.
- ✅ **Catalog category resolution fixed** (`lib/square/catalog.ts`): names now resolve from the
  full category list, not just `includeRelatedObjects` — which omits **secondary** category
  assignments. Without this, items added to "Online Sales …" as a non-primary category were hidden.
- **Remaining:** `/store` still renders the mock design-variant selector (`Store.tsx` +
  `variants/VariantA–L`). Final step: pick one variant, wire it to `useProducts()` (see
  `VariantBReal.tsx`), delete the selector. Tracked in `REVIEW.md` #4. Real wired path today:
  `/store/preview-real`.

## Phase A2 — Cart ✅ Done

- `components/store/CartProvider.tsx`, `CartDrawer.tsx`, `CartPage.tsx`, `CartItemRow.tsx`,
  `CartIcon.tsx`, `AddToCartButton.tsx`, `StoreCartButton.tsx`. localStorage-persisted.

## Phase A3 — Checkout & pay 🟡 Working; tax + carrier-filter gaps

- `components/store/CheckoutForm.tsx` → `ShippingAddressStep` → `ShippingRateStep` (live Shippo
  rates) → `PaymentStep` (Square Web Payments). **Verified working in sandbox.**
- `app/api/store/shipping-rates/route.ts` — live rates by parcel preset.
- `app/api/store/checkout/route.ts` — charges Square, saves `Order` (`paid`), auto-buys label,
  sends customer + merchant emails.
- **Gap (tax):** `taxCents` hardcoded to `0`. `INITIAL.md` requires **sales tax always on**
  (`05-tax-and-refunds.md`).
- **Gap (carriers):** Shippo can **return** UPS/FedEx rates even when their labels can't be bought
  (carrier accounts not yet activated → label purchase fails, order stuck `paid`). The rates
  endpoint should offer **only purchasable carriers** (USPS in test). See `07` + open item below.

## Phase A4 — Order recorded + confirmation ✅ Done & verified

- ✅ Order persisted with `square.paymentId`, status `paid` → `label_created`.
- ✅ Customer `OrderConfirmationEmail`.
- ✅ Merchant `StoreOrderAdminEmail` — **includes the auto-created label PDF button** (or an
  "Action Needed" note if auto-label failed).
- ✅ **Auto-create-label-on-payment** (`lib/shippo/labels.ts` from checkout, non-fatal). Manual
  "Create Label" kept as a fallback. **End-to-end verified** — real USPS test label generated.

## Phase A5 — Shipping & delivery notifications 🟡 Backend done, UI pending

Reworked per `03-shipping-notification-flow.md` (backend complete; admin button UI remaining).

- ✅ Customer "shipped" email decoupled from label creation — sent **only** by
  `{ action: "mark_shipped" }` in `app/api/admin/store/orders/[id]/route.ts` (idempotent).
- ✅ `app/api/webhooks/shippo/route.ts` — auto-"shipped"-on-TRANSIT removed; sends
  `DeliveryConfirmationEmail` once on `DELIVERED`.
- 🔜 **UI remaining:** "Mark Shipped & Notify Customer" button + "Awaiting Shipment" relabel on the
  admin order detail page (see `03` → "Remaining work"). Until built, trigger the action via
  `PATCH … {"action":"mark_shipped"}`.

## Phase B0 — Product management ✅ Done (visibility = Square categories)

- `app/admin/dashboard/store/products/page.tsx`, `app/api/admin/store/products/route.ts` (+`[id]`).
- **Shop visibility is driven by Square categories, NOT an app-side toggle.** An item appears
  online when added to an **"Online Sales …"** Square category (e.g. `Online Sales - Art Kits`).
  Filter: `lib/utils/catalogHelpers.ts` (`isInOnlineSalesCategory` + `ONLINE_SALES_CATEGORY_PREFIX`).
  The `isOnlineSellable` toggle was removed from the admin UI + write path.
- `StoreProductSettings` is **optional** (parcel/slug/display overrides). No settings row required.
- Admin Store Products screen now only sets **parcel size** per item.
- ⏳ **Parcel sizing decision pending** — see `08-parcel-sizing.md` (recommend size-based
  `Online Sales - Small/Medium/Large` categories). Default today = MEDIUM for everything.

## Phase B1 — Unified Sales ledger 🔴 Not started

- Only a store-orders list exists. No unification across `Customer`, `Reservations`,
  `PrivateEvent`, gift cards. No refund action on orders. See `02-admin-sales-page.md`.

## Phase B2 — Shipments tracker 🟡 Partial

- Order detail page surfaces label PDF download, tracking link, and a "Create Shipping Label"
  fallback button. No dedicated needs-printing → shipped → delivered tracker view. No first-class
  "Mark Shipped" control. No void/reprint label. See `04-shipments-tracker.md`.

---

## Environment / setup notes (important)

- **Shippo test token** is set (`SHIPPO_API_KEY` in `.env`). Test labels are watermarked samples,
  no real postage.
- **Ship-from** comes from `MERCHANT_SHIP_FROM_*` in `.env*`. **USPS requires both a sender email
  AND phone** or label purchase fails (`sender_info_missing`) — keep both populated.
- **Dev email routing:** all non-prod notifications go to `DEV_EMAIL` (`crystaledgedev22@gmail.com`).
- ⚠️ **The Square MCP is pointed at the LIVE/production account** — not used for any writes; sandbox
  seeding was done with the app's sandbox token via script. A production `SQUARE_ACCESS_TOKEN` is
  exported in some session environments (not in shell profiles) — verify `pnpm dev` uses the sandbox
  token (`printenv SQUARE_ACCESS_TOKEN` empty or `EAAAlxmoaj…`).
- **Sandbox seeded:** category `Online Sales - Art Kits` + 4 items (Tiny Easel Painter Box, Garden
  Art Kit, Monstera Leaves MINI, Voluta Shell MINI) so the store renders for testing.

## What's been added beyond the original tickets

- Admin store order list + detail UI; `app/api/admin/store/orders` (GET list, GET/PATCH by id).
- Shippo tracking webhook; `lib/shippo/labels.ts`.
- Customer CSV export (commit `48c71ba`).
- Email templates: `OrderConfirmationEmail`, `StoreOrderAdminEmail` (+label), `ShippingConfirmationEmail`,
  `DeliveryConfirmationEmail`.

## Open items / TODO documents

| # | Doc | Status |
|---|---|---|
| 02 | `02-admin-sales-page.md` — unified B1 ledger + refunds | 🔴 not started |
| 03 | `03-shipping-notification-flow.md` — backend ✅ done & verified; **admin "Mark Shipped" button UI** remaining | 🟡 |
| 04 | `04-shipments-tracker.md` — dedicated B2 tracker view + void/reprint | 🔴 not started |
| 05 | `05-tax-and-refunds.md` — sales-tax-always-on + full refund + label void | 🔴 not started |
| 06 | `06-hardening.md` — ✅ env ship-from done; idempotency (order/emails) + webhook signatures remain | 🟡 |
| 07 | `07-shippo-account-setup.md` — dev test token ✅ done; prod carrier accounts + live token at cutover | 🟡 |
| 08 | `08-parcel-sizing.md` — design locked, build deferred until after flow proven | ⏳ deferred |
| — | **Carrier rate filter** — offer only purchasable carriers (USPS in test) so customers can't pick an unbuyable rate | 🔴 decision + small fix; tracked in `03` + `07` |
| — | **Store variant cutover** — wire chosen variant to real data, delete mock selector | 🟡 `REVIEW.md` #4 |
