# Ticket 02 — Admin Sales Page (Phase B1, unified ledger)

> A single private admin screen listing **every sale in one organized list** — online store
> orders, class registrations, gift card purchases, reservations, and private parties — with
> filter, search, and refund-from-one-place.
> Reference: `INITIAL.md` Phase B1. Related: `01-customer-storefront-shop.md`, `00-STATUS.md`.

## Status

- **State**: Not started. Only a store-orders list exists today
  (`app/admin/dashboard/store/orders/` + `/api/admin/store/orders`). No unification, no refunds.
- **Scope**: Private admin-console unified sales ledger

## Why

Per the order-flow diagram the merchant runs everything from one Admin Console. The Sales page is
the unified ledger across all revenue sources, with refund from one place.

## Revenue sources to unify (read-only across existing models — do NOT modify them)

| Source | Model | Existing API/hook |
|---|---|---|
| Online store orders | `lib/models/Order.ts` | `/api/admin/store/orders`, `useProducts` n/a |
| Class / event registrations | `lib/models/Customer.ts` | `/api/customer`, `useCustomers` |
| Reservations (day bookings) | `lib/models/Reservations.ts` | `/api/reservations`, `useReservations` |
| Private events | `lib/models/PrivateEvent.ts` | `/api/private-events`, `usePrivateEvents` |
| Gift card purchases | Square (no local model) | `lib/square/gift-cards.ts`, `/api/gift-cards` |

> **Non-destructive constraint** (`INITIAL.md`): this page *reads across* all of these but must
> not alter their schemas or flows.

## What to build

- **Route**: `app/admin/dashboard/sales/` + `components/dashboard/sales/`. NextAuth-protected.
  Not in public nav.
- **Normalized row shape** — map each source into one `SaleRow` view model, e.g.:
  `{ id, source: "store" | "registration" | "reservation" | "private" | "giftcard",
     date, customerName, customerEmail, description, amountCents, status, refundStatus,
     squarePaymentId, href }`. Keep amounts in cents; convert at the UI via `moneyHelpers`.
- **Aggregation**: either a combined `GET /api/sales` endpoint that queries all sources and
  returns normalized rows, or aggregate client-side via the existing per-source hooks. A server
  endpoint is cleaner for sorting/paging across sources.
- **Filter / search / sort**: by source type, date range, customer, status, amount.
- **Detail view** per sale → link out to the source record (store order detail already exists;
  others link to their existing admin detail pages).
- **Refund from one place**: reuse `useProcessRefund` + `/api/refunds` (Square) against the row's
  `squarePaymentId`. Reflect `refundStatus` back onto the source record/order. **Full refunds
  only in v1** (see `05-tax-and-refunds.md`).

## Acceptance criteria

- [ ] One list shows sales from all five sources, sorted by date, with source pills.
- [ ] Filter + search + sort work across the unified set.
- [ ] A row's refund issues a Square refund and updates the source record's `refundStatus`.
- [ ] Reads only — no source schema/flow is modified.
- [ ] `pnpm lint` + `pnpm build` pass; TS strict respected.

## Notes / open questions

- Paging across heterogeneous sources: paginate the combined endpoint, or cap each source and
  merge? (Cap + merge is simplest for v1; document the cap.)
- Gift cards have no local Mongo model — pull from Square; decide how far back to list.
- Does B1 also subsume the Shipments tracker, or is that a separate screen?
  **Resolved**: separate — see `04-shipments-tracker.md`.
