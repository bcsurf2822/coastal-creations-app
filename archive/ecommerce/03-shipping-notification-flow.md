# Ticket 03 — Shipping & Notification Flow (rework A4 / A5 / B2)

> Reworks how labels are created and how customer/merchant emails are triggered so the flow matches
> the intended behavior. Mostly rewiring triggers, not new infrastructure.
> Reference: `INITIAL.md` Phases A4, A5, B2 and `coastal-creations-order-flow.drawio.png`.

## Status

- **State**: 🟡 **Backend implemented AND verified end-to-end in sandbox.** Checkout → auto-label →
  merchant label-PDF email confirmed working (real USPS test label + tracking generated). Two
  admin-UI touchpoints remain — see "Remaining work".
- **Decision locked**: label is auto-created at checkout (spec A4 model). See "Target flow."

### ✅ Done (server-side, typecheck + lint clean, verified)
- `lib/shippo/labels.ts` — `purchaseLabelForOrder()` (idempotent; never emails the customer).
- `app/api/store/checkout/route.ts` — auto-buys label after payment (non-fatal), feeds the label
  into the merchant email.
- `app/api/store/shipping-label/route.ts` — now a thin admin-only fallback; customer email removed.
- `app/api/admin/store/orders/[id]/route.ts` — idempotent `{ action: "mark_shipped" }` → stamps
  `shippedAt`, sends the customer `ShippingConfirmationEmail`.
- `app/api/webhooks/shippo/route.ts` — dropped auto-"shipped"; sends `DeliveryConfirmationEmail`
  once on `DELIVERED`.
- `components/email-templates/StoreOrderAdminEmail.tsx` — renders the label PDF button (or an
  "Action Needed" note when auto-label failed).
- `components/email-templates/DeliveryConfirmationEmail.tsx` — new template.

### 🧪 Learnings from end-to-end testing
- **USPS requires sender email AND phone** on the ship-from address, or label purchase fails with
  `sender_info_missing`. Both supplied via `MERCHANT_SHIP_FROM_*` env (see `06` #1, done).
- **Carrier activation:** Shippo returns UPS/FedEx rates in test mode, but their labels can't be
  purchased until those carrier accounts are activated. If an unbuyable rate is selected, auto-label
  fails and the order is stuck `paid`. → Offer only purchasable carriers (USPS in test). Small
  rates-endpoint filter, tracked as an open item (`00-STATUS.md`, `07`).
- A label is tied to the **rate's shipment**, so a rate created before the ship-from was fixed can't
  be relabelled — a new checkout is required to pick up ship-from changes.

### 🔜 Remaining work (UI only)
1. **Admin order detail page** (`app/admin/dashboard/store/orders/[id]/page.tsx`):
   - Add a **"Mark Shipped & Notify Customer"** button, shown only when `status === "label_created"`.
     It calls `PATCH /api/admin/store/orders/[id]` with body `{ action: "mark_shipped" }` (NOT the
     generic status select). On success, refresh the order.
   - Render `label_created` with the label text **"Awaiting Shipment"**.
   - The existing "Create Shipping Label" button stays as the fallback (only when `status === "paid"`).
2. **Shipments tracker** view — see `04-shipments-tracker.md`.

> The backend is working and idempotent; these are pure wiring tasks against endpoints that already
> exist.

## Target flow (auto-label at checkout)

| # | Trigger | System action | Status after | Email sent |
|---|---|---|---|---|
| 1 | Customer pays | Charge Square, save `Order` | `paid` | Customer: Order Confirmation |
| 2 | Immediately after save (same request) | **Auto-buy** the selected Shippo rate → store `labelUrl`, `trackingNumber`, `trackingUrlProvider`, `carrier`, `serviceLevel` | `label_created` | — |
| 3 | After label bought | Email the **merchant** the order **with the label PDF** | `label_created` | Merchant: Label-in-inbox |
| 4 | Admin UI | `label_created` is displayed as **"Awaiting Shipment"** | `label_created` | — |
| 5 | Merchant packs & ships, taps **"Mark Shipped & Notify Customer"** | `PATCH /api/admin/store/orders/[id]` action `mark_shipped` → stamp `shippedAt`, send tracking email | `shipped` | Customer: Shipping/Tracking |
| 6 | Shippo tracking webhook `delivered` | stamp `deliveredAt`, send delivery email | `delivered` | Customer: Delivery Confirmation |

> No schema change needed: reuse the existing `OrderStatus` enum. `label_created` is **rendered** as
> "Awaiting Shipment" in admin — it is the same state.

## How it was reworked (reference)

1. **Label purchase moved into checkout** — extracted to `lib/shippo/labels.ts`
   (`purchaseLabelForOrder`), called from checkout after the order is saved, inside its own
   try/catch. A label failure does NOT fail the order — it stays `paid` and can be retried via the
   fallback button. Idempotent (no-op if `order.shippo.transactionId` is set).
2. **Merchant gets the label** — `StoreOrderAdminEmail` renders the label PDF; sent after the label
   step so the PDF is present.
3. **Premature customer email removed** from the label route — the "shipped" email now belongs only
   to `mark_shipped`. The label route is a manual fallback for re-buying a label when auto-creation
   failed (admin-only).
4. **"Mark Shipped & Notify Customer" action** — `PATCH /api/admin/store/orders/[id]` with
   `{ action: "mark_shipped" }`: valid only from `label_created`; idempotent on `shippedAt`; sends
   the customer `ShippingConfirmationEmail`.
5. **Manual "Create Label" kept** as the fallback (only when `status === "paid"`); never sends the
   customer shipped email.
6. **Delivery email via webhook** — on `DELIVERED`, set `delivered` + `deliveredAt`, send
   `DeliveryConfirmationEmail` once. Auto-`shipped`-on-`TRANSIT` removed (shipped is
   merchant-controlled).

## Acceptance criteria

- [x] A test checkout results in: customer confirmation email, an order in `label_created`
      ("Awaiting Shipment"), and a merchant email containing the label PDF. *(verified)*
- [x] No customer "shipped" email is sent at checkout or at label creation. *(verified)*
- [ ] Clicking "Mark Shipped & Notify Customer" (UI) sends exactly one tracking email and moves the
      order to `shipped`; clicking again sends nothing. *(endpoint verified via API; button pending)*
- [ ] A Shippo `delivered` webhook sends exactly one delivery email and sets `delivered`.
- [x] If Shippo label purchase fails at checkout, the order is still saved as `paid` and the manual
      "Create Label" fallback works. *(verified)*
- [ ] `pnpm lint` + `pnpm build` pass; TS strict respected.

## Open questions

- Label PDF in the merchant email: Resend **attachment** vs **link** (current: link).
- Reliability: spec A4 suggests driving auto-label from a **Square payment webhook** rather than the
  request path. v1 does it inline in checkout; revisit in `06-hardening.md`.
