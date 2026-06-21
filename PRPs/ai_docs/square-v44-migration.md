# Square Node SDK — `square/legacy` → v44 native migration reference

> Critical reference for migrating this repo's SERVER Square code off the legacy
> namespaced client (`import { Client, Environment } from "square/legacy"` →
> `squareClient.paymentsApi.createPayment`, etc.) onto the modern v44 client
> (`import { SquareClient, SquareEnvironment } from "square"` →
> `client.payments.create`). This is **server-only**: the client Web Payments SDK
> (`react-square-web-payments-sdk`) is unaffected.
>
> Method names below were verified against the INSTALLED `square@44.1.0` typings in
> `node_modules/.pnpm/square@44.1.0/node_modules/square/api/resources/*/client/Client.d.ts`.
> Re-verify against the installed version before/while implementing.

## Why this is optional (not a deadline)
`square/legacy` is the compatibility surface Square deliberately bundles inside v44
and supports indefinitely. Nothing breaks if we stay on it. This migration is pure
modernization (native types, one client shape, auto-pagination). Do it as its own PR.

## Client construction

```ts
// LEGACY (current, every server file constructs its own)
import { Client, Environment } from "square/legacy";
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});
const { paymentsApi } = squareClient;

// V44 NATIVE
import { SquareClient, SquareEnvironment } from "square";
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? SquareEnvironment.Sandbox
      : SquareEnvironment.Production,
});
// no destructure of "...Api" — call client.payments.create(...) directly
```

Key diffs: `Client` → `SquareClient`; `accessToken` → `token`; `Environment` →
`SquareEnvironment`; resource accessors are `client.<resource>` getters (no `Api`
suffix), methods name the action without repeating the resource.

## Method mapping (VERIFIED against square@44.1.0)

| Legacy call | v44 native |
|---|---|
| `paymentsApi.createPayment(body)` | `client.payments.create(body)` |
| `refundsApi.refundPayment(body)` | `client.refunds.refundPayment(body)` |
| `customersApi.searchCustomers(body)` | `client.customers.search(body)` |
| `customersApi.createCustomer(body)` | `client.customers.create(body)` |
| `customersApi.retrieveCustomer(id)` | `client.customers.get({ customerId })` |
| `customersApi.updateCustomer(id, body)` | `client.customers.update({ customerId, ...body })` |
| `customersApi.deleteCustomer(id)` | `client.customers.delete({ customerId })` |
| `catalogApi.searchCatalogObjects(body)` | `client.catalog.search(body)` |
| `catalogApi.searchCatalogItems(body)` | `client.catalog.searchItems(body)` |
| `catalogApi.batchRetrieveCatalogObjects(body)` | `client.catalog.batchGet(body)` |
| `catalogApi.retrieveCatalogObject(id, incl)` | `client.catalog.object.get({ objectId, includeRelatedObjects })` |
| `catalogApi.listCatalog(cursor, types)` | `client.catalog.list({ types })` (returns a pager) |
| `inventoryApi.batchRetrieveInventoryCounts(body)` | `client.inventory.batchGetCounts(body)` |
| `giftCardsApi.createGiftCard(body)` | `client.giftCards.create(body)` |
| `giftCardsApi.retrieveGiftCardFromGAN(body)` | `client.giftCards.getFromGan(body)` |
| `giftCardsApi.retrieveGiftCard(id)` | `client.giftCards.get({ giftCardId })` |
| `giftCardsApi.listGiftCards(...)` | `client.giftCards.list({...})` (returns a pager) |
| `giftCardActivitiesApi.createGiftCardActivity(body)` | `client.giftCards.activities.create(body)` |
| `giftCardActivitiesApi.listGiftCardActivities(...)` | `client.giftCards.activities.list({...})` |
| `ordersApi.createOrder(body)` | `client.orders.create(body)` |

### ⚠️ The non-obvious ones (will break a naive find/replace)
1. **Gift card activities are NESTED**: there is NO top-level `client.giftCardActivities`.
   It is `client.giftCards.activities.create / .list`. (`lib/square/gift-cards.ts` uses
   both `giftCardsApi` and `giftCardActivitiesApi` — the second becomes a sub-namespace.)
2. **`retrieveCatalogObject` moved to a sub-resource**: `client.catalog.object.get(...)`
   (not `client.catalog.get`). `client.catalog` top-level has `batchGet/batchUpsert/
   batchDelete/list/search/searchItems/info`, while single-object ops live under
   `client.catalog.object.{get,upsert,delete}`.
3. **Inventory batch counts renamed**: `batchRetrieveInventoryCounts` → `batchGetCounts`
   (there are also `deprecated*` variants — do NOT use those).
4. **`retrieveGiftCardFromGAN` → `getFromGan`** (note casing: `Gan`, not `GAN`).
5. **ID-by-path methods take an OBJECT now**: legacy positional `retrieveCatalogObject(id, true)`
   becomes `client.catalog.object.get({ objectId: id, includeRelatedObjects: true })`.
   Same for customers (`{ customerId }`), gift cards (`{ giftCardId }`).

## Response access — the highest-churn change

Legacy returns `{ result: { ... } }`. v44 returns the payload directly.

```ts
// LEGACY
const payment = paymentResult.result.payment;
const objects = response.result.objects ?? [];
const cursor  = response.result.cursor ?? undefined;

// V44
const payment = paymentResult.payment;
const objects = response.objects ?? [];
const cursor  = response.cursor ?? undefined;
```

Every `.result.` access in the touched files must drop `.result`. This is the easiest
change to MISS — grep `\.result\.` in each migrated file and confirm zero remain
(except unrelated non-Square `.result`).

To get the raw HTTP response (rarely needed): `await client.payments.create(body).withRawResponse()` → `{ data, rawResponse }`.

## Error handling

```ts
// LEGACY
import { ApiError } from "square/legacy";
catch (e) { if (e instanceof ApiError) { e.statusCode; e.result?.errors?.[0]?.detail } }

// V44
import { SquareError } from "square";
catch (e) { if (e instanceof SquareError) { e.statusCode; e.message; e.body } }
```

`lib/square/catalog.ts` and `lib/square/gift-cards.ts` import & branch on `ApiError`
today — switch both to `SquareError`. The error body shape differs: prefer `e.message`
/ `e.body` over `e.result?.errors?.[0]?.detail`.

## Money / BigInt — NO CHANGE
v44 still uses `BigInt` for money amounts (`amount: BigInt(totalCents)`), and read
amounts still come back as `bigint` (keep the existing `Number(amount)` /
`moneyAmountToCents` conversions before any JSON/RSC boundary — BigInt still throws in
`JSON.stringify`). The store's `lib/utils/moneyHelpers.ts` conversions are unaffected.

## Pagination

`list`-style methods (`client.catalog.list`, `client.giftCards.list`,
`client.giftCards.activities.list`) return an async-iterable Pager:

```ts
// auto-pagination
const pager = await client.catalog.list({ types: "CATEGORY" });
for await (const obj of pager) { /* ... */ }

// OR manual (closer to current cursor loops): pager.data, pager.hasNextPage(), pager.getNextPage()
```

`searchCatalogObjects`/`batchGet`/`batchGetCounts` are NOT pagers — they still return a
single response object with `cursor`; keep the existing `do { } while (cursor)` loops,
just drop `.result`.

## Files in this repo that construct a legacy client (migrate each)
- `app/actions/actions.ts` — `paymentsApi.createPayment`
- `app/api/store/checkout/route.ts` — `paymentsApi.createPayment`
- `app/api/payments/route.ts` — `paymentsApi.createPayment` (DEAD route — no live caller; migrate or delete)
- `app/api/refunds/route.ts` — `refundsApi.refundPayment`
- `lib/square/customers.ts` — `customersApi.*`
- `lib/square/catalog.ts` — `catalogApi.*`, `inventoryApi.*`, `ApiError`
- `lib/square/products.ts` — `catalogApi.searchCatalogObjects`, `inventoryApi.batchRetrieveInventoryCounts` (legacy/duplicate of catalog.ts — confirm if still used before migrating; candidate for deletion)
- `lib/square/gift-cards.ts` — `giftCardsApi.*`, `giftCardActivitiesApi.*`, `ordersApi.createOrder`, `paymentsApi.createPayment`

## Doc URLs
- Migration guide: https://developer.squareup.com/docs/sdks/nodejs/migration
- New SDK README (resource list, pagination, errors): https://github.com/square/square-nodejs-sdk/blob/master/README.md
- Announcement (rationale, examples): https://developer.squareup.com/blog/announcing-the-new-square-node-js-sdk/
- Using the SDK: https://developer.squareup.com/docs/sdks/nodejs/using-nodejs-sdk
