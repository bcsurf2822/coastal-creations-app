# Ticket 05 — Sales Tax + Refunds + Label Void

> Two money-correctness gaps: sales tax is currently `0`, and store orders have no refund path.
> Reference: `INITIAL.md` "Other Considerations" (tax always on; v1 full refunds only) and
> Open Questions #2, #4.

## Status

- **State**: Not started
- **Scope**: Tax on every order; full refund + optional Shippo label void

## Part A — Sales tax (always on)

- Today `app/api/store/checkout/route.ts` hardcodes `taxCents: 0` and the total is
  `subtotal + shipping`. Spec requires **tax on every order**.
- **Preferred**: let **Square Orders** compute tax (create a Square Order with line items + a tax,
  take payment against it) rather than a hand-rolled rate — matches existing Square patterns and
  keeps tax authoritative. Fallback: a fixed NJ rate constant if Square Orders tax is too heavy
  for v1.
- Persist the computed `taxCents` on the `Order` (field already exists) and include it in
  `totalCents`, the customer confirmation email, and the admin views (the order detail page
  already renders `taxCents` when `> 0`).

### Decisions to confirm
- Square Orders tax computation vs fixed NJ rate for v1.
- Tax on shipping? (NJ generally does not tax shipping for taxable goods shipped by common
  carrier — confirm before implementing.)

## Part B — Refunds (full only, v1)

- Reuse the existing refund infrastructure: `app/api/refunds/` + `useProcessRefund` (Square).
- Add a **full-refund** action to the order detail page / sales ledger that:
  - Issues the Square refund against `order.square.paymentId`.
  - Sets `order.refundStatus = "full"`, `refundAmountCents = totalCents`, stamps `refundedAt`,
    sets `status = "refunded"`.
  - Sends the customer a refund-confirmation email (optional v1).
- **No partial refunds in v1** (`refundStatus: "partial"` stays reserved).

## Part C — Label void on cancel/refund (optional)

- When an order is refunded/cancelled **before shipping** and a label was already bought, offer to
  **void the Shippo label** (Shippo refund on the transaction) to recover the postage cost.
- Guard: only voidable while unused (not yet scanned/shipped). Skip silently if Shippo refuses.

## Files touched (expected)

- `app/api/store/checkout/route.ts` (tax computation)
- `lib/shippo/labels.ts` (add `voidLabel(transactionId)` — created in ticket 03)
- `app/api/admin/store/orders/[id]/route.ts` (refund action)
- `app/admin/dashboard/store/orders/[id]/page.tsx` (refund button + label-void)
- Refund email template (optional)

## Acceptance criteria

- [ ] Every new order stores a non-zero `taxCents` (where applicable) and the total reflects it.
- [ ] A full refund updates Square + the `Order` (`refundStatus: full`, `status: refunded`).
- [ ] Refunding an unshipped order optionally voids its Shippo label.
- [ ] `pnpm lint` + `pnpm build` pass; TS strict respected.
