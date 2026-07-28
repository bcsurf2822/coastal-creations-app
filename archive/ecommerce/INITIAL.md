# FEATURE: E-Commerce Order Flow (Square + Shippo)

Build a full physical-product e-commerce flow for Coastal Creations Studio, end to end:
customers browse a Shop, pay by card, get live shipping rates, and receive automated
order/shipping/delivery emails — while the merchant runs everything (sales + shipments)
from the existing admin console. Payments and products run on **Square**; live shipping
rates, label generation, and tracking run on **Shippo**.

This document is the source for generating phased PRPs. It is organized into two parts —
**Part A: Customer-Facing Shop** and **Part B: Admin Section** — preceded by a shared
**Phase 0 foundation**. Each phase maps directly to numbered steps in the flow diagram.

> Canonical reference diagram: `spec/ecommerce/coastal-creations-order-flow.drawio.png`
> (in which step 7 "Mark it shipped" is a merchant action that sends the customer's shipping
> email; near-identical earlier draft: `spec/ecommerce/ecommerce-order-flow.drawio.png`)
> Companion tickets: `spec/ecommerce/01-customer-storefront-shop.md`, `spec/ecommerce/02-admin-sales-page.md`

> **⚠️ Amendments since authoring — see `00-STATUS.md` for the live state.** This document is the
> original vision; two decisions have since changed in implementation:
> 1. **Shop visibility is driven by Square categories ("Online Sales …"), not the
>    `isOnlineSellable` flag.** The merchant controls the storefront entirely from the Square
>    dashboard (add an item to an "Online Sales …" category → it appears). The `StoreProductSettings`
>    model and its `isOnlineSellable` field still exist but the flag is unused. See `00-STATUS.md` B0.
> 2. **Carriers:** USPS is in play (cheapest for light goods) alongside UPS/FedEx. Rates must be
>    filtered to carriers whose labels can actually be purchased. See `07` + `08`.
> The shipping-notification flow (A4/A5) was reworked and **verified end-to-end** — see `03`.

## Flow → Phase Map (every part of the diagram is covered)

| Diagram element | Lane | Phase |
|---|---|---|
| Square (manage products, process cards) | Automatic | Phase 0 + B0 + A1 + A3 |
| Online-store visibility + shipping dims per product | Admin Console | B0 |
| Shippo (live rates at checkout, build label) | Automatic | Phase 0 + A3 + A4 |
| 1. Browse the shop | Customer | A1 |
| (cart) | Customer | A2 |
| 2. Checkout & pay (live rates + card) | Customer | A3 |
| 3. Order recorded (sale saved + label auto-created) | Automatic | A4 |
| 4. Order confirmed (Order Confirmation email) | Customer | A4 |
| 5. Label in inbox (PDF email to merchant) | Merchant | A4 |
| 6. Pack & ship (print label, tape, drop off) | Merchant | B2 |
| 7. Mark it shipped — tap in Admin → sends customer Shipping email w/ tracking link | Merchant / Admin | A5 + B2 |
| 8. Delivered (auto Delivery Confirmation email) | Customer | A5 |
| Admin "Sales page" (all sales, filter/search/refund) | Admin Console | B1 |
| Admin "Shipments tracker" (label PDF + tracking) | Admin Console | B2 |

## Implementation Map — Customer side vs Admin side

Both sides read the **same Square Catalog** and the **same `Order` collection**; they differ in
who acts and what they write.

| Concern | Customer-facing (`app/store/…`) | Admin (`app/admin/dashboard/…`) |
|---|---|---|
| Products | Reads catalog filtered by `isOnlineSellable`; renders any item + variations | Sets `isOnlineSellable` + shipping dims per item (`StoreProductSettings`) |
| Cart/Checkout | Cart, address form, live Shippo rates, Square card payment | — |
| Orders (`Order` model) | Creates one on successful payment (snapshot of items) | Lists/searches/filters all orders; views detail |
| Shipping | Picks a rate; receives tracking emails | Sees label-to-print/shipped/delivered; downloads label PDF; tracking link |
| Money | Pays total (subtotal + shipping + tax) | Issues full/partial **refunds** (Square) |
| Components | `components/store/`, `components/payment/`, `components/email-templates/` | `components/dashboard/{store-products,sales,shipments}/` |
| Data shared | ← Square Catalog, `Order`, `StoreProductSettings` (read) | Square Catalog, `Order`, `StoreProductSettings` (read + write settings/refunds) |

## Tooling / MCP note

- **Square MCP server: NOT currently connected** to this session (see confirmation in chat).
  All Square work uses the `square` Node SDK already in the project (see `lib/square/`),
  plus `react-square-web-payments-sdk` on the client. If a Square MCP is added later it can
  assist authoring, but the implementation must not depend on it.
- **Shippo**: integrate via REST API (or the `shippo` Node SDK). No MCP.
- Existing Square integration patterns to follow: `lib/square/gift-cards.ts`,
  `lib/square/payment-config.ts`, `lib/square/customers.ts`, `app/api/payments/`,
  `app/api/refunds/`, `app/api/payment-config/`.

## Non-destructive constraint

Do **not** modify or remove the existing MongoDB `Event`, `Customer`, `Reservations`, or
`PrivateEvent` models or their flows. This e-commerce flow is **additive** — it introduces
physical-product orders alongside the existing class/registration/reservation system. The
admin Sales page (B1) *reads across* all of these but must not alter their schemas.

## Catalog-driven design — support ANY product the merchant lists

**Square Catalog is the single source of truth for products.** The merchant's live catalog
already holds 53 items (workbooks, stickers, paint-by-number kits, mosaic boards with 36
variations, art kits, etc.) and the merchant must be able to add/sell **any new item** in the future
without a code change. Therefore:

- **Never hardcode products, categories, or prices.** The Shop renders whatever the Catalog
  API returns (filtered to online-sellable items — see below). New Square items appear
  automatically.
- **Handle variations generically.** Items range from 1 variation to 36 (`Thin Mosaic Board`).
  The product detail page must render any item's `ItemVariation` set as selectable options.
- **The catalog mixes sellable goods with non-goods.** It contains `APPOINTMENTS_SERVICE`
  (`Consultation`, `Kit`), `LEGACY_SQUARE_ONLINE_SERVICE` (`Grout`), shipping line-items
  (`Delivery`, `Express`), in-studio classes (`Bday Party`, `Paint party`, `Toddler time`),
  and test junk (`Tt`, no price). The Shop must show **only** items the merchant has flagged
  as online-sellable — driven by an **admin-controlled visibility flag**, not a hardcoded
  allowlist (so the filter survives new items). See `StoreProductSettings` model below.
- **Orders snapshot the product at purchase time.** Because Square items can change/disappear,
  each `Order` line item stores a copy of `catalogObjectId`, `variationId`, name, selected
  options, and unit price as they were when bought — so historical orders stay accurate for
  any product.

---

# Phase 0 — Foundations (shared)

**Goal:** stand up data models, clients, helpers, and config that every later phase depends on.

### Mongo models (`lib/models/`, new — follow `lib/models/Customer.ts` conventions exactly)

Use the existing patterns: `mongoose, { Document, Model, Schema }`, an exported `I…` interface,
sub-schemas for nested shapes (like `BillingInfoSchema`), `{ timestamps: true }`, the
`if (mongoose.models.X) delete mongoose.models.X` hot-reload guard, and a default export.

1. **`Order.ts`** — the online store order (the heart of the flow). See full schema sketch in
   the Data Model section below. Stores a **snapshot** of purchased line items so it works for
   any product, plus Square ids, Shippo ids/label/tracking, totals, addresses, and statuses.
2. **`StoreProductSettings.ts`** — per-Square-item app-side metadata that Square doesn't hold:
   - `squareItemId` (unique), `isOnlineSellable` (the visibility flag that drives the Shop
     filter), `shipping` (weight + L/W/H + unit, used to build Shippo parcels), optional
     `displayOrder`, optional `slug`. This is what lets the merchant sell **any** catalog item online by
     toggling a flag — no code change.

### Shippo (`lib/shippo/`, new — mirror `lib/square/` structure)

- `client.ts` (SDK/REST client), `rates.ts` (address+parcel+shipment → rates),
  `labels.ts` (buy rate → label transaction + PDF), `tracking.ts` (webhook + status mapping).

### `lib/utils/` helpers (new — match the existing helper style: small pure functions, JSDoc, explicit return types)

- **`catalogHelpers.ts`** — map raw Square `CatalogObject`s into a clean `StoreProduct` view
  model the UI renders; merge in `StoreProductSettings`; filter to `isOnlineSellable`; compute
  price range across variations; flatten/normalize the `ItemVariation` list so 1-variation and
  36-variation items render uniformly. (Parallels `eventTypeHelpers.ts`.)
- **`parcelHelpers.ts`** — build a Shippo parcel from a product's assigned **parcel preset**.
  Define a small set of presets (e.g. `SMALL` ~1lb, `MEDIUM` ~5lb, `LARGE` ~10lb, each with
  default L/W/H), plus optional carrier flat-rate-box presets. **Default = `MEDIUM` (5lb)** so a
  newly added product always rates correctly with zero merchant input; the merchant can override the
  preset per item in admin B0. Cart parcels combine line items (sum weights / largest box).
  Rationale: art kits are ~5lb but mosaic boards can be larger — presets handle both without
  per-item measuring and without a single flat number that would undercharge big items.
- **`moneyHelpers.ts`** — cents↔dollars conversion + display formatting. (Square is cents-native;
  the existing `Event.price`/`Customer.total` are dollars — centralize the boundary here.)
- **`slugify.ts`** (existing) — reuse `slugify` / add a `createProductSlug(name, id)` alongside
  the existing `createEventSlug` for `/store/[slug]` URLs.

### Other Phase 0 work

- **Merchant ship-from address** config (env; see Environment section) for rate calculation.
- **Env vars** (add to required set; see Environment section).
- **Webhook security**: signature verification helpers for both Square and Shippo webhooks.
- **Idempotency**: idempotency keys on payment + order creation so retried webhooks never
  double-charge or double-record.

---

# PART A — Customer-Facing Shop

## Phase A1 — Shop page (diagram step 1: "Browse the shop")

> Builds on ticket `01-customer-storefront-shop.md` (nav "Store" link + page shell already scoped there).

- **Route**: `app/store/page.tsx` — product grid of physical products from **Square Catalog**.
- **Product detail**: `app/store/[productId]/page.tsx` — images, description, price,
  variations (size/color), quantity selector, "Add to cart".
- **Data**: read products from Square Catalog API (Item → ItemVariation hierarchy). Reuse/extend
  the read-only catalog work planned in `spec/features/04-catalog-api-services-migration.md`,
  but for **physical goods** (not services). Filter catalog to shippable products.
- **Components**: `components/store/` (StoreGrid, ProductCard, ProductDetail) using the design
  system (`PageHeader`, `Card`, `PriceBadge`, `Button`). Server Components where possible.
- **Hooks**: `hooks/queries/use-products.ts` (TanStack Query), following existing query-hook pattern.

## Phase A2 — Cart

- **Cart state**: a cart provider/context (`components/store/CartProvider.tsx`) persisted to
  `localStorage`; supports add/remove/update-qty, line + subtotal totals.
- **Cart UI**: drawer or `app/store/cart/page.tsx` with line items, quantities, subtotal,
  "Proceed to checkout".
- Note physical-goods cart is distinct from existing class-registration booking flow — keep separate.

## Phase A3 — Checkout & pay (diagram step 2: live rates + card)

- **Route**: `app/store/checkout/page.tsx`.
- **Shipping address form** → on entry, call Shippo to get **live rates**:
  - Create Shippo Address (to) + Parcel (from cart item dimensions/weight — needs product
    weight/dimensions on Square catalog items or a fallback) + Shipment (from = merchant
    ship-from), then present returned **Rates** for the customer to choose.
  - API: `POST /api/shipping/rates` (server-side; never expose Shippo token to client).
- **Payment**: Square Web Payments SDK card form (reuse `components/payment/` +
  `/api/payment-config`). Order total = cart subtotal + chosen shipping rate (+ tax if applicable).
- **Submit**: `POST /api/store/checkout` → create Square Order + take payment
  (`/api/payments` pattern), capture chosen `rateId`. Idempotent.

## Phase A4 — Order recorded + confirmation + merchant label (diagram steps 3, 4, 5)

**Automatic, server-side, triggered on successful payment:**

- **3. Order recorded**: persist the `Order` (Phase 0 model) with Square payment/order ids.
- **Auto-create label**: purchase the selected Shippo rate via the **Transaction** endpoint →
  store `labelUrl` (PDF), `trackingNumber`, `trackingUrlProvider`, `carrier`; set
  `status = label_created`.
- **4. Order Confirmation email** to customer (Resend + React Email template in
  `components/email-templates/`): itemized order + shipping method.
- **5. Label-in-inbox email** to merchant: shipping label PDF attached / linked, order summary.
- Recommended: drive label creation from the **Square payment webhook** (not just the request
  path) for reliability, with idempotency so it runs exactly once.

## Phase A5 — Shipping & delivery notifications (diagram steps 7, 8)

Per `coastal-creations-order-flow.drawio.png`, the **shipping email is merchant-triggered**, the
**delivery email is automatic**:

- **7. Shipping confirmation email — triggered by the merchant tapping "Mark Shipped"** in the
  admin Shipments tracker (Phase B2), NOT by the first carrier scan. The action sets
  `Order.status = shipped`, stamps `shippedAt`, and sends the customer a Shipping email
  containing the **tracking link** (`shippo.trackingUrlProvider`). Endpoint:
  `PATCH /api/store/orders/[id]` (action: `mark_shipped`) → send email. Idempotent (only emails
  once per order).
- **8. Delivery confirmation email — automatic** via the **Shippo tracking webhook**:
  `POST /api/shipping/webhook` (verify signature). On `delivered`, set `Order.status = delivered`,
  stamp `deliveredAt`, send the Delivery Confirmation email. Idempotent per tracking event.
- Both via Resend templates (see Resend rework dependency).
- The tracking webhook may still update intermediate transit status for display, but it does
  **not** send the shipping email — that stays the merchant's deliberate "Mark Shipped" action.

---

# PART B — Admin Section (Admin Console)

> Lives under `app/admin/dashboard/` (NextAuth-protected, same whitelist as the rest of admin).
> Not added to the public nav.

### Admin Console — Required Functionalities (what the merchant needs to run the store)

Per the diagram the merchant runs **everything from one private console**. Required capabilities:

1. **Product management (Store catalog control)** — Phase B0 below
   - See every Square catalog item synced into the app.
   - Toggle **`isOnlineSellable`** per item to choose what appears in the Shop (filters out
     services/classes/test items; lets the merchant sell **any** item by flipping a switch).
   - Assign a **parcel preset** (default `MEDIUM`/5lb) per item; optional exact weight/dims
     override (required only if the merchant wants tighter Shippo rates).
   - Optional: set display order / slug; see Square inventory stock + low-stock awareness.
   - **"Adds the online-store layer" = ** the merchant still *creates/prices/photographs/stocks* products
     in the **Square dashboard** (products are added and managed there). Square does not store
     (a) whether an item shows on *the merchant's* website or (b) its shipping box/weight. This screen
     attaches exactly those two website-only fields on top of each Square item — no re-entry,
     no duplication of the catalog.
2. **Sales ledger** — Phase B1: every sale across all sources, filter/search, detail, **refund**.
3. **Shipments tracker** — Phase B2: label-to-print / shipped / delivered, one-click label PDF,
   tracking link, optional manual mark-shipped, void/reprint label. **Mostly automatic:** label
   PDF + tracking number + carrier come back from Shippo at label purchase; shipped/delivered
   statuses arrive via the Shippo tracking webhook from carrier scans. The only manual step is
   the physical print/pack/drop-off (diagram step 6) — the merchant never types tracking numbers.
4. **Order detail actions** — resend confirmation/shipping email, view payment + customer,
   issue **full refund** (Square) and optionally void the Shippo label on cancel.
   **v1: full refunds only** (no partial).
5. **Store settings** — ship-from / origin address (the merchant's studio or UPS Store drop-off origin),
   carriers limited to **UPS and FedEx**, parcel presets, **no free shipping**, **sales tax
   always on**. (Backed by env + a small settings doc.) Setup caveat: UPS/FedEx live rates
   typically require connecting the merchant's carrier accounts in the Shippo dashboard.
6. **Customers** — **reuse the existing Square Customers integration** (`lib/square/customers.ts`,
   `/api/square/customers`): online buyers sync to a Square customer and link into the existing
   customer-management screen. No new customer UI required; orders reference the customer.

## Phase B0 — Product management (Store catalog control)

- **Route**: `app/admin/dashboard/store-products/` + `components/dashboard/store-products/`.
- **List** all Square catalog items (via `mcp_square_api` for inspection during dev; via the
  `square` SDK at runtime), joined with `StoreProductSettings`.
- **Per-item controls**: `isOnlineSellable` toggle, shipping weight/dimensions form, optional
  slug/displayOrder. Persists to `StoreProductSettings` (`PUT /api/store/product-settings/[squareItemId]`).
- **Why first in Part B**: the customer Shop (A1) reads `isOnlineSellable`; without this screen
  nothing is sellable online. Build the model in Phase 0, this management UI here.

## Phase B1 — Sales page (diagram: "Every sale in one organized list")

- **Route**: `app/admin/dashboard/sales/` + `components/dashboard/sales/`.
- **Unified ledger** across all revenue sources — read across existing data:
  online store `Order`s, class registrations (`Customer`), gift card purchases,
  `Reservations`, and `PrivateEvent` bookings — normalized into one list view.
- **Filter, search, sort** (by type, date, customer, status, amount).
- **Refund from one place**: reuse `useProcessRefund` + `/api/refunds` (Square). Reflect
  `refundStatus` back onto the source record/order.
- API: `GET /api/store/orders` (+ a combined sales endpoint, or aggregate client-side via
  existing hooks). Detail view per sale.

## Phase B2 — Shipments tracker (diagram: label-to-print / shipped / delivered)

- **Route**: `app/admin/dashboard/shipments/` + `components/dashboard/shipments/`.
- **Columns/states**: needs-printing → shipped → delivered — sourced from `Order.status`/Shippo.
- **One-click label PDF** download (`labelUrl`) and **tracking link** per order.
- **"Mark Shipped" button (first-class action, not optional)** — this is diagram **step 7**. After
  the merchant packs & ships (step 6), tapping it sets the order to `shipped` and sends the customer the
  Shipping email with tracking link (see A5). This is the deliberate control point the diagram
  specifies.
- Delivered status flips automatically from the Shippo tracking webhook (step 8).
- Optional: re-print / regenerate label, void label (Shippo refund) for cancelled orders.

---

## Data Models (`lib/models/`)

> Amounts are stored in **cents** (Square-native). Convert at the UI boundary via
> `lib/utils/moneyHelpers.ts`. Follow `lib/models/Customer.ts` for sub-schema + export style.

### `lib/models/Order.ts`

```ts
export interface IOrderItem {
  squareCatalogItemId: string;       // snapshot — Square ITEM id
  squareVariationId: string;         // snapshot — chosen ItemVariation id
  name: string;                      // snapshot — item name at purchase
  variationName?: string;            // e.g. "Large", "Blue"
  selectedOptions?: { categoryName: string; choiceName: string }[]; // any custom options
  quantity: number;                  // min 1
  unitPriceCents: number;            // snapshot — price at purchase
}

export interface IShippingAddress {
  name: string; addressLine1: string; addressLine2?: string;
  city: string; stateProvince: string; postalCode: string; country: string;
  phone?: string; email?: string;
}

export interface IOrder extends Document {
  orderNumber: string;                              // human-friendly, generated
  items: IOrderItem[];                              // snapshot of what was bought (any product)
  subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number;
  customer: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  square: { paymentId?: string; orderId?: string; customerId?: string };
  shippo: {
    shipmentId?: string; rateId?: string; transactionId?: string;
    labelUrl?: string; trackingNumber?: string; trackingUrlProvider?: string;
    carrier?: string; serviceLevel?: string;
  };
  status: "pending" | "paid" | "label_created" | "shipped" | "delivered"
        | "cancelled" | "refunded";
  refundStatus: "none" | "partial" | "full";        // mirror Customer.ts
  refundAmountCents?: number; refundedAt?: Date;
  shippedAt?: Date; deliveredAt?: Date;
  createdAt: Date; updatedAt: Date;
}
// Sub-schemas: OrderItemSchema, ShippingAddressSchema (reuse the BillingInfo shape).
// `{ timestamps: true }`; hot-reload guard; default export `Order`.
```

### `lib/models/StoreProductSettings.ts`

```ts
export interface IStoreProductSettings extends Document {
  squareItemId: string;              // unique — links to a Square Catalog ITEM
  isOnlineSellable: boolean;         // THE Shop visibility flag (default false)
  parcelPreset?: "SMALL" | "MEDIUM" | "LARGE" | string; // default "MEDIUM" (5lb) — see parcelHelpers
  shipping?: {                       // optional per-item override of the preset defaults
    weight: number; weightUnit: "oz" | "lb";
    length: number; width: number; height: number; distanceUnit: "in" | "cm";
  };
  slug?: string;                     // optional pretty URL
  displayOrder?: number;             // optional manual sort in the Shop
  createdAt: Date; updatedAt: Date;
}
```
This is the layer that makes the storefront **catalog-driven for any product**: the merchant
flips `isOnlineSellable` (and fills shipping dims) on any Square item to put it in the Shop.

## API Routes (new)

| Route | Methods | Purpose |
|---|---|---|
| `/api/store/products` | GET | List online-sellable products (Catalog ∩ `isOnlineSellable`) |
| `/api/store/products/[id]` | GET | Single product + variations |
| `/api/store/product-settings` | GET | Admin: all items + their `StoreProductSettings` |
| `/api/store/product-settings/[squareItemId]` | PUT | Admin: set `isOnlineSellable` + shipping dims |
| `/api/shipping/rates` | POST | Live Shippo rates for cart + address |
| `/api/store/checkout` | POST | Create Square order, take payment, persist Order (idempotent) |
| `/api/store/orders` | GET | Admin: list store orders |
| `/api/store/orders/[id]` | GET, PATCH | Order detail / status updates |
| `/api/shipping/webhook` | POST | Shippo tracking webhook (signature-verified) |
| `/api/payments/webhook` (or extend existing) | POST | Square payment webhook → auto label + emails |

## Documentation

- Shippo overview: https://goshippo.com/products/api
- Shippo docs: https://docs.goshippo.com/ (Addresses, Parcels, Shipments, Rates, Transactions/Labels, Tracking, Webhooks, Test Mode)
- Square Web Payments SDK + Payments/Orders/Catalog/Refunds APIs (already used in `lib/square/`, `app/api/payments`, `app/api/refunds`)
- Resend + React Email (existing `components/email-templates/`, `/api/send-confirmation`)

## Environment Variables

Already present: `SQUARE_ACCESS_TOKEN`, `SQUARE_APPLICATION_ID`, `SQUARE_LOCATION_ID`, `RESEND_API_KEY`, `MONGODB_URI`.

Add:
```
SHIPPO_API_TOKEN=shippo_test_...        # Shippo API token (test then live)
SHIPPO_WEBHOOK_SECRET=...               # verify tracking webhook signatures
SQUARE_WEBHOOK_SIGNATURE_KEY=...        # verify Square payment webhooks
MERCHANT_SHIP_FROM_NAME=...             # ship-from for rate calc
MERCHANT_SHIP_FROM_STREET=...
MERCHANT_SHIP_FROM_CITY=...
MERCHANT_SHIP_FROM_STATE=...
MERCHANT_SHIP_FROM_ZIP=...
MERCHANT_NOTIFICATIONS_EMAIL=...        # where the label-in-inbox email goes
```
Update `.env.example` accordingly.

## Other Considerations

- **Test mode first**: use Shippo test token + Square sandbox throughout; gate live keys behind env.
- **Idempotency everywhere**: payment, order creation, label purchase, and each email must be
  exactly-once under webhook retries (store processed event ids / idempotency keys).
- **Never expose `SHIPPO_API_TOKEN` or `SQUARE_ACCESS_TOKEN` to the client** — all rate/label/payment
  calls are server-side route handlers.
- **Product shipping data**: Shippo rates need parcel weight/dimensions. Decide where these live
  (Square catalog custom attributes vs. a per-product config) — flag as an open question for PRP.
- **Tax**: **always on** — apply sales tax to every order (prefer Square Orders tax computation).
- **Refunds + label voids**: **v1 is full refunds only**; a refunded/cancelled order should
  optionally void/refund its Shippo label.
- **Carriers**: UPS and FedEx only; both typically require the merchant's own carrier accounts connected in
  the Shippo dashboard before live rates return.
- **Design system**: all new UI uses `components/ui/` + tokens per `AGENTS.md`.
- **TypeScript strict**: explicit return types, no `any`, `ReactElement` over `JSX.Element`.

## Open Questions (resolve during PRP creation)

1. ~~Source of product weight/dimensions for Shippo parcels?~~ **Resolved**: stored per item in
   `StoreProductSettings.shipping`, edited from admin Phase B0, with a default fallback parcel.
2. ~~Is sales tax in scope for v1?~~ **Resolved**: yes — **sales tax is always on**. Decide
   whether Square Orders computes it (preferred) vs. a fixed NJ rate.
3. ~~Single ship-from address only, or multiple?~~ **Resolved**: single origin (studio / UPS
   Store drop-off). Carriers limited to **UPS and FedEx** (requires carrier accounts in Shippo).
4. ~~Should B1 Sales page truly unify all 5 revenue sources in v1?~~ **Resolved**: yes, unify all
   sources. **Refunds are full-only in v1.**
5. Label creation on the request path, the Square webhook, or both (with idempotency)?

## Known dependency / rework

- **Resend email setup needs rework before the e-commerce emails are reliable.** The flow's
  customer + merchant emails (order confirmation, label-in-inbox, shipping confirmation,
  delivery confirmation — Phases A4/A5) all sit on Resend. **The merchant/owner will handle the
  Resend rework separately**; these e-commerce email phases depend on that landing first.
  Build the React Email templates and trigger points regardless, but treat reliable delivery as
  blocked on the Resend cleanup.
