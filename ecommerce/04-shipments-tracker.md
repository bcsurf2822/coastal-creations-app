# Ticket 04 — Shipments Tracker (Phase B2)

> Dedicated admin view for fulfillment: which orders need printing, which are awaiting shipment,
> which are in transit, which are delivered — plus one-click label PDF and tracking links.
> Reference: `INITIAL.md` Phase B2. Depends on `03-shipping-notification-flow.md` (status flow).

## Status

- **State**: Not started (order list + detail page exist; no dedicated tracker)
- **Scope**: Admin-only fulfillment board

## What exists today

- `app/admin/dashboard/store/orders/` (list) + `/[id]` (detail) — generic order views.
- Order detail already surfaces label PDF download, tracking link, and "Create Label."
- No board grouped by fulfillment state; no void/reprint.

## What to build

- **Route**: `app/admin/dashboard/store/shipments/` + `components/dashboard/shipments/`.
- **Columns / lanes** sourced from `Order.status`:
  - **Awaiting Shipment** (`label_created`) — has a label, not yet shipped. Primary work queue.
  - **Shipped** (`shipped`) — in transit.
  - **Delivered** (`delivered`).
  - (Optional) **Needs Attention** (`paid` with no label — auto-creation failed).
- **Per-row actions**:
  - Download label PDF (`shippo.labelUrl`).
  - Open tracking link (`shippo.trackingUrlProvider`).
  - **Mark Shipped & Notify Customer** (the `mark_shipped` action from ticket 03) — only on
    Awaiting Shipment rows.
  - (Optional) **Void / reprint label** — Shippo refund a label for a cancelled order; reprint
    re-fetches the same `labelUrl`.
- **Data**: reuse `GET /api/admin/store/orders?status=` (already supports a status filter).
  Consider a count-by-status summary endpoint for the lane headers.

## Notes / constraints

- Not in public nav. NextAuth-protected like the rest of `app/admin/dashboard/`.
- Tracking numbers are never entered manually — they arrive from Shippo at label purchase.
- Delivered flips automatically from the Shippo webhook (ticket 03 #6).

## Acceptance criteria

- [ ] Awaiting-Shipment lane lists every `label_created` order with label PDF + Mark Shipped.
- [ ] Marking shipped moves the order to the Shipped lane and notifies the customer (once).
- [ ] Delivered orders appear in the Delivered lane without manual action.
- [ ] `pnpm lint` + `pnpm build` pass; TS strict respected.

## Open questions

- Board/Kanban layout vs filterable table with a status pill? (Table reuses more existing code.)
- Is label void/reprint in v1 scope or deferred to the refunds ticket (`05`)?
