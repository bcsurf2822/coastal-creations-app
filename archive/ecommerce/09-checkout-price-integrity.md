# Ticket 09 — Checkout price integrity (recompute amounts server-side)

> **Money/security critical.** The store currently charges amounts supplied by the client, so a
> tampered request can underpay. Server must recompute the charge from authoritative sources.
> Reference: `INITIAL.md` (checkout), `06-hardening.md` (security). Companion to those.

## Status

- **State**: 🔴 Not started — **critical, do before real-money launch**.
- **Origin**: **Pre-existing** on `develop` (NOT introduced by PR #152 / `david-working`). Surfaced during the #152 review. Fix belongs on our own branch.
- **Scope**: `app/api/store/checkout/route.ts` server-side pricing.

## The problem

`POST /api/store/checkout` builds the amount it charges from values in the **request body**:

```ts
const { ..., selectedRate, items, subtotalCents } = body;
const taxCents = computeTaxCents(subtotalCents, shippingAddress.stateProvince); // tax: server-computed ✅
const totalCents = subtotalCents + selectedRate.rateCents + taxCents;           // subtotal + shipping: client-trusted ❌
// ...
await squareClient.paymentsApi.createPayment({ amountMoney: { amount: BigInt(totalCents), ... } });
```

- **`subtotalCents`** comes from the client.
- **Item prices** (`item.priceCents`, used for the order snapshot `unitPriceCents`) come from the client.
- **`selectedRate.rateCents`** (shipping) comes from the client.

Only **tax** is recomputed server-side. So a crafted request can set `subtotalCents: 1` (and/or a tiny `rateCents`) and **pay ~$0.01 for a $50 order**. The saved `Order` would also record the bogus prices.

## Impact

- Direct revenue loss / fraud: customers can pay arbitrary amounts.
- Corrupted order records (snapshot prices are attacker-controlled).
- Affects production once real payments are enabled.

## The fix

Never trust client-sent money. Recompute everything chargeable on the server:

1. **Subtotal from the Square catalog (authoritative).** For each `items[]` entry, look up the current price of its `squareCatalogItemId` / `squareVariationId` via `lib/square/catalog.ts`
   (`listCatalogItems(ids)` / `retrieveCatalogItem`) and multiply by a **validated quantity**. Build `subtotalCents` from these server prices — ignore client `priceCents`/`subtotalCents`.
   - Handle `VARIABLE_PRICING` variations explicitly (reject or require an allowed amount).
   - Optionally enforce inventory via `getInventoryCounts` (out-of-stock → reject).
2. **Shipping from a server re-quote.** Re-run `getShippingRates(destination, parcelPresets)` (`lib/shippo/rates.ts`) and confirm the client's `selectedRate.rateId` is present in the fresh quote; charge that quote's amount — do not trust client `rateCents`. (Rate ids are short-lived, so re-quoting also guards against stale/expired rates.)
3. **Tax on the server subtotal.** Keep `computeTaxCents`, but feed it the **server-recomputed** subtotal (today it's fed the client one). (See also Ticket on tax correctness/nexus — base-rate-only is a separate decision.)
4. **Charge only the server total**, and write the **server prices** into the `Order` snapshot.
5. On mismatch (client total ≠ server total, item unsellable, rate gone), return a clear error and do **not** charge — let the client refresh the cart.

## Files / helpers

- `app/api/store/checkout/route.ts` — the change.
- `lib/square/catalog.ts` — `listCatalogItems`, `retrieveCatalogItem`, `getInventoryCounts`.
- `lib/utils/catalogHelpers.ts` — sellable-good checks.
- `lib/shippo/rates.ts` — `getShippingRates` for the shipping re-quote.
- `lib/utils/taxHelpers.ts` — tax on the recomputed subtotal.

## Validation

- Unit/integration test: POST a tampered body (`subtotalCents: 1`, `priceCents: 1`, tiny `rateCents`) and assert the charge uses **server-derived** amounts (or is rejected), and the saved order reflects catalog prices.
- Regression: a normal, untampered checkout still succeeds with identical totals.

## Notes

- This is independent of (and more fundamental than) the tax-accuracy/nexus question.
- Because it affects `develop`, schedule it as its own fix — not bundled into the #152 review.
