# Square Catalog + Inventory — `square` v42 LEGACY namespace (read-only storefront)

> Critical reference for reading products from Square to build the customer Shop.
> This repo uses `import { Client, Environment, ApiError } from "square/legacy"` and the
> namespaced `client.catalogApi` / `client.inventoryApi` shape (NOT the new v42 top-level API).
> Confirmed against `lib/square/gift-cards.ts`, `lib/square/customers.ts`, `app/api/payments/route.ts`.

## Client init (mirror existing code exactly)

```ts
import { Client, Environment, ApiError } from "square/legacy";

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});
const { catalogApi, inventoryApi } = squareClient;
const LOCATION_ID =
  process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";
```

## Methods (legacy)

- `catalogApi.searchCatalogObjects(body)` — workhorse. `body = { objectTypes: ["ITEM"], includeRelatedObjects: true, includeDeletedObjects: false, limit, cursor }`. Returns `{ result: { objects, relatedObjects, cursor } }`. ITEM_VARIATIONs are embedded in each `object.itemData.variations[]`; IMAGE + CATEGORY objects come back in `relatedObjects` (resolve by id). One level deep.
- `catalogApi.retrieveCatalogObject(objectId, includeRelatedObjects=true)` — single item detail. Returns `{ result: { object, relatedObjects } }`. **Positional args**, not a body.
- `catalogApi.searchCatalogItems(body)` — item-only search with server-side `productTypes: ["REGULAR"]` + `archivedState: "ARCHIVED_STATE_NOT_ARCHIVED"`, but does NOT return related IMAGE/CATEGORY.
- `inventoryApi.batchRetrieveInventoryCounts(body)` — `body = { catalogObjectIds: variationIds, locationIds: [LOCATION_ID], states: ["IN_STOCK"], cursor }`. Returns `{ result: { counts, cursor } }`; `count.quantity` is a **string**.

## ⚠️ CRITICAL gotchas

1. **BigInt money**: `priceMoney.amount` is a real `bigint`. `JSON.stringify` THROWS `TypeError: Do not know how to serialize a BigInt`. This crashes any `NextResponse.json()` or RSC→client boundary. **Always convert with `Number(amount)` before serializing.** Do it inside the API route / mapper, never pass raw Square objects to the client.
2. **VARIABLE_PRICING**: when `itemVariationData.pricingType === "VARIABLE_PRICING"`, `priceMoney` is absent. Don't assume a price exists. Compute a price range across fixed-price variations; show "Price varies" otherwise.
3. **Inventory only exists when `trackInventory === true`**. Missing inventory record ≠ sold out. Gate sold-out logic on `trackInventory`. `quantity` is a string → `Number(c.quantity)`. `IN_STOCK` is the only sellable state.
4. **Location price overrides**: `itemVariationData.locationOverrides[].priceMoney` can override base price for the selling location — check overrides first, fall back to base `priceMoney`.
5. **`includeRelatedObjects` is one level deep**; **`listCatalog` does NOT support related objects** (use `searchCatalogObjects`).
6. **Pagination**: loop while `result.cursor` is truthy, keeping all other params identical.
7. **Errors**: `catch (e) { if (e instanceof ApiError) ... e.result?.errors?.[0]?.detail }`.
8. **Rate limits (429)**: catalog changes infrequently — cache it (server-side + TanStack Query). Use batch endpoints to cut request count.

## Object shapes (the fields we use)

```ts
// CatalogObject wrapper
{ type: "ITEM"|"ITEM_VARIATION"|"IMAGE"|"CATEGORY", id, version: bigint,
  isDeleted?, presentAtAllLocations?, presentAtLocationIds?,
  itemData?, itemVariationData?, imageData?, categoryData? }

// itemData (CatalogItem)
{ name, description?, descriptionHtml?, descriptionPlaintext?, isArchived?,
  categoryId?, categories?: [{id, ordinal}], imageIds?: string[],
  variations?: CatalogObject[],     // type ITEM_VARIATION, embedded
  productType?: "REGULAR"|"APPOINTMENTS_SERVICE"|"LEGACY_SQUARE_ONLINE_SERVICE"|...,
  ecomVisibility?: "UNINDEXED"|"UNAVAILABLE"|"HIDDEN"|"VISIBLE", availableOnline? }

// itemVariationData (CatalogItemVariation)
{ itemId?, name?, sku?, ordinal?, pricingType?: "FIXED_PRICING"|"VARIABLE_PRICING",
  priceMoney?: { amount?: bigint, currency? }, locationOverrides?, trackInventory? }

// imageData (CatalogImage): { url?: string }    // resolve from itemData.imageIds via relatedObjects
// categoryData (CatalogCategory): { name?: string }
```

## Filtering to "sellable physical good" (Square-side signals)

```
type === "ITEM"
  && itemData.productType === "REGULAR"          // excludes APPOINTMENTS_SERVICE, LEGACY_SQUARE_ONLINE_SERVICE
  && itemData.isArchived !== true
  && (presentAtAllLocations || presentAtLocationIds.includes(LOCATION_ID))
```
NOTE: In THIS project the FINAL visibility gate is the app-side `StoreProductSettings.isOnlineSellable`
flag (admin-controlled, set in Phase B0), NOT Square's `ecomVisibility`. The Square filter above is a
pre-filter that limits what's even eligible; `isOnlineSellable` decides what actually shows on the Shop.

## Image host for `next/image` remotePatterns

Square catalog images are S3-hosted. Production: `square-catalog-production.s3.amazonaws.com`
(some accounts: `items-images-production.s3.us-west-2.amazonaws.com`); sandbox:
`square-catalog-sandbox.s3.amazonaws.com`. Log the real `imageData.url` host once and pin it; a
`*.s3.amazonaws.com` wildcard is a safe fallback.

## Doc URLs

- CatalogApi (legacy): https://github.com/square/square-nodejs-sdk/blob/master/legacy/doc/api/catalog.md
- InventoryApi (legacy): https://github.com/square/square-nodejs-sdk/blob/master/legacy/doc/api/inventory.md
- SearchCatalogObjects: https://developer.squareup.com/reference/square/catalog-api/search-catalog-objects
- RetrieveCatalogObject: https://developer.squareup.com/reference/square/catalog-api/retrieve-catalog-object
- SearchCatalogItems: https://developer.squareup.com/reference/square/catalog-api/search-catalog-items
- BatchRetrieveInventoryCounts: https://developer.squareup.com/reference/square/inventory-api/batch-retrieve-inventory-counts
- CatalogItem object: https://developer.squareup.com/reference/square/objects/CatalogItem
- EcomVisibility enum: https://developer.squareup.com/reference/square/enums/EcomVisibility
- InventoryState enum: https://developer.squareup.com/reference/square/enums/InventoryState
