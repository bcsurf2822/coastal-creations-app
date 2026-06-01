# Ticket: Admin Sales Page

> Part of the E-Commerce Order Flow. Corresponds to the **"Sales page"** card in the Admin Console section of `spec/ecommerce/ecommerce-order-flow.drawio.png`.

## Status

- **State**: Not started — stub (to be fleshed out)
- **Scope**: Private admin-console view of all sales
- **Related**: Customer storefront — see `spec/ecommerce/01-customer-storefront-shop.md`

## Goal

A single private admin screen listing **every sale in one organized list** — online orders, class registrations, gift card purchases, reservations, and private parties — with filter, search, and refund-from-one-place.

## Why

Per the diagram, the merchant runs everything from one Admin Console. The Sales page is the unified sales ledger across all revenue sources.

## What (to detail later)

- Lives under `app/admin/dashboard/` (NextAuth protected, same as other admin pages).
- Unified list across: online store orders, `Customer` event registrations, gift card purchases, `Reservations`, and `PrivateEvent` bookings.
- Filter + search + per-row refund (reuse existing `useProcessRefund` / `/api/refunds`).
- Likely a companion **Shipments tracker** view (label-to-print / shipped / delivered, label PDF + tracking link) — confirm whether that is in this ticket or its own.

## Notes

- Not in the public nav. Do not add to `components/layout/nav/NavBar.tsx`.
- Depends on online-order data existing first (storefront + checkout tickets).
- Expand this stub into a full ticket when the customer storefront/checkout work lands.
