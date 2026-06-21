name: "Customer Shop Page (Phase A1) — Square Catalog product browsing"
description: |
  Customer-facing storefront: a `/store` product grid and `/store/[slug]` detail page that
  read physical products from the Square Catalog, gated by the app-side
  `StoreProductSettings.isOnlineSellable` flag. Read-only browsing (no cart/checkout). First
  vertical slice of the e-commerce order flow (spec/ecommerce/INITIAL.md, Part A, Phase A1).

## Purpose
Build the "1. Browse the shop" step of the e-commerce flow. Customers can browse the studio's
physical products (workbooks, stickers, kits, mosaics) on a new public Store page and view a
product detail page. This is the foundation later checkout/cart phases build on.

## Core Principles
1. **Context is King**: All Square SDK quirks and codebase patterns are inlined or linked below.
2. **Validation Loops**: `tsc`, `lint`, `vitest`, `build` — all runnable.
3. **Information Dense**: Mirror existing patterns (gift-cards Square service, use-events hook, events listing/detail pages, ui components).
4. **Progressive Success**: Catalog read service → helpers/types → API routes → hooks → components → pages → nav → tests.
5. **Global rules**: Follow CLAUDE.md / AGENTS.md (no `any`, explicit return types, `ReactElement` not `JSX.Element`, max 200 lines/component, `[FILENAME-FUNCTION]` logs, design-system components).

---

## Goal
Ship a customer-facing Store with:
- `/store` — responsive product grid of online-sellable physical products from Square Catalog.
- `/store/[slug]` — product detail page (images, description, variations, price, availability).
- A top-level **Store** link in the main nav (desktop + mobile).

Products shown are the intersection of: Square Catalog `ITEM`s that are `REGULAR` physical goods
**AND** flagged `isOnlineSellable: true` in the `StoreProductSettings` collection (the admin flag,
set later in Phase B0 — for now via the dev seed script in Task 14).

## Why
- Diagram step 1 ("Browse the shop") has no implementation today — no `shop`/`store` route exists.
- Establishes the product read layer (`lib/square/catalog.ts`, `catalogHelpers.ts`, `/api/store/products`) that cart/checkout (A2/A3) build on.
- Square is the single source of truth for products, so the studio can add/sell any item without a code change (catalog-driven design — see INITIAL.md).

## What
Read-only product browsing. Customer-visible behavior:
- Store page lists products with image, name, price (or price range), and an availability badge.
- Clicking a product opens its detail page with all images, description, and selectable variations with per-variation price/availability.
- "Add to cart" is OUT OF SCOPE (a disabled/placeholder CTA is acceptable; cart is Phase A2).

### Success Criteria
- [ ] `/store` renders a grid of online-sellable products fetched from Square Catalog via `/api/store/products`.
- [ ] `/store/[slug]` renders the correct product's detail (images, description, variations, price range, availability) via `/api/store/products/[id]`.
- [ ] Only items flagged `isOnlineSellable: true` (and `productType === "REGULAR"`, not archived) appear; services/classes/test items are excluded.
- [ ] A **Store** link appears in desktop + mobile nav and routes to `/store`, styled identically to other top-level links.
- [ ] No `BigInt` serialization crashes; prices render as dollars from cents.
- [ ] `npm run lint` and `npm run build` pass clean.
- [ ] `npx tsc --noEmit` and `npm run test:run` introduce **no NEW** errors/failures beyond the documented pre-existing baseline (see "Known baseline failures" below). New files added by this PRP must be individually type-clean and their new tests must pass.

## All Needed Context

### Documentation & References
```yaml
- docfile: PRPs/ai_docs/square-catalog-legacy-sdk.md
  why: THE critical reference. Exact legacy SDK methods, object shapes, the BigInt money crash,
       VARIABLE_PRICING, inventory/availability, image host for next/image, filtering. READ FIRST.

- file: lib/square/gift-cards.ts
  why: Canonical `square/legacy` client init (lines 5-15) + service-class pattern to mirror for lib/square/catalog.ts.
        It demonstrates the client setup and namespaced `*Api` access style (it uses giftCardsApi/ordersApi/paymentsApi);
        the catalogApi/inventoryApi method signatures live in PRPs/ai_docs/square-catalog-legacy-sdk.md.
  critical: import from "square/legacy"; environment via SQUARE_ENVIRONMENT.

- file: app/api/payments/route.ts
  why: Square client init inside a route + how BigInt amounts are used. Mirror error/try-catch shape.

- file: app/api/events/route.ts
  why: API route shape — `await connectMongo()`, `{ success: true, ... }` / `{ error }` + status codes, query-param parsing.

- file: hooks/queries/use-events.ts
  why: EXACT TanStack Query hook pattern to mirror for use-products.ts (queryKey, fetch fn, staleTime/gcTime, "use client").

- file: app/events/classes-workshops/page.tsx
  why: Listing page pattern — PageHeader + container; client component.

- file: app/events/classes-workshops/[eventId]/page.tsx
  why: Next 15 dynamic route — `params: Promise<{...}>`, `await params`, `extractEventIdFromSlug`, generateMetadata. Mirror for /store/[slug].

- file: app/walk-in/page.tsx
  why: Simplest page shell (min-h-screen + PageHeader + feature component). Closest analog for app/store/page.tsx.

- file: components/ui/index.ts
  why: Barrel for Button/Card/Badge/PriceBadge — USE these, do not hand-roll. Badge variants: available|fewSpots|soldOut|newClass|upcoming. PriceBadge takes price:number|string.

- file: components/classes/PageHeader.tsx
  why: PageHeader props (title, subtitle, variant?, leftIcon?, rightIcon?). "use client".

- file: lib/utils/slugify.ts
  why: slugify + createEventSlug + extractEventIdFromSlug. Add createProductSlug + extractSquareItemIdFromSlug here (Task 3).

- file: lib/models/StoreProductSettings.ts
  why: The visibility gate (isOnlineSellable), slug, displayOrder. Already committed.

- file: lib/types/storeTypes.ts
  why: StoreProduct / StoreProductSummary / StoreProductVariation read contracts. Already committed — these are the API output shapes.

- file: lib/mongoose.ts
  why: `await connectMongo()` before any Mongoose query in a route.

- file: next.config.ts
  why: images.remotePatterns currently only allows cdn.sanity.io — must add Square S3 host (Task 1).

- file: app/providers.tsx
  why: TanStack Query is already wired app-wide; new hooks just work.

- file: __tests__/hooks/queries/use-events.test.ts
  why: Test pattern to mirror — vitest, renderHook, createWrapper, mockFetch from __tests__/utils/test-utils.

- url: https://developer.squareup.com/reference/square/catalog-api/search-catalog-objects
  why: SearchCatalogObjects params/response (objectTypes, includeRelatedObjects, relatedObjects).

- url: https://developer.squareup.com/reference/square/catalog-api/retrieve-catalog-object
  why: Single-item detail with relatedObjects (images/category).

- url: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
  why: Next 15 async `params` in dynamic routes.

- url: https://tanstack.com/query/latest/docs/framework/react/guides/queries
  why: useQuery contract (queryKey, queryFn, enabled).
```

### Current Codebase tree (relevant slice)
```bash
app/
  api/
    events/route.ts                 # API route pattern (connectMongo, success/error)
    gift-cards/list/route.ts        # Square-backed route pattern
    payments/route.ts               # Square client in a route + BigInt
  events/
    classes-workshops/page.tsx                 # listing page (PageHeader + container)
    classes-workshops/[eventId]/page.tsx       # dynamic route (async params, slug)
  walk-in/page.tsx                  # simplest page shell
  providers.tsx                     # TanStack Query provider (already wired)
  get-query-client.ts
components/
  ui/{Button,Card,Badge,PriceBadge,index}.tsx  # design system
  classes/PageHeader.tsx
  layout/nav/NavBar.tsx             # add Store link here
hooks/queries/{use-events.ts,index.ts}
lib/
  square/{gift-cards,customers,payment-config}.ts  # Square legacy patterns
  models/{Order,StoreProductSettings}.ts           # already committed
  types/storeTypes.ts                              # already committed
  utils/slugify.ts
  mongoose.ts
next.config.ts
__tests__/{hooks/queries/use-events.test.ts, utils/test-utils.tsx, utils/mock-data.ts}
```

### Desired Codebase tree (files to add/modify)
```bash
# ADD
lib/utils/moneyHelpers.ts            # cents<->dollars + BigInt-safe money conversion + format
lib/square/catalog.ts                # Square legacy catalog/inventory READ service -> plain DTOs (BigInt converted)
lib/utils/catalogHelpers.ts          # Square DTOs + StoreProductSettings -> StoreProduct(Summary); filter; price range; availability rollup
app/api/store/products/route.ts      # GET: online-sellable product summaries
app/api/store/products/[id]/route.ts # GET: single product detail by squareItemId (404 if not sellable)
hooks/queries/use-products.ts        # useProducts(), useProduct(squareItemId)
components/store/ProductCard.tsx      # one product card (Card + PriceBadge + Badge + next/image)
components/store/StoreGrid.tsx        # "use client" grid; useProducts(); loading/empty/error states
components/store/ProductDetail.tsx    # "use client" detail; useProduct(); variation selector
app/store/page.tsx                   # Store page shell (PageHeader + StoreGrid)
app/store/[slug]/page.tsx            # detail route (async params, extract id, generateMetadata)
scripts/seed-store-products.ts       # DEV-ONLY: flag REGULAR items isOnlineSellable (acceptance aid until B0)
__tests__/utils/catalogHelpers.test.ts
__tests__/utils/moneyHelpers.test.ts
__tests__/hooks/queries/use-products.test.ts

# MODIFY
next.config.ts                       # add Square S3 image host to remotePatterns
lib/utils/slugify.ts                 # add createProductSlug + extractSquareItemIdFromSlug
hooks/queries/index.ts               # export useProducts, useProduct
components/layout/nav/NavBar.tsx      # add top-level "Store" link (desktop + mobile)
```

### Known Gotchas & Library Quirks
```ts
// CRITICAL: Square legacy import is `square/legacy`, NOT `square`. Client + namespaced *Api.
//   import { Client, Environment, ApiError } from "square/legacy";
//   const { catalogApi, inventoryApi } = new Client({ accessToken, environment });
// CRITICAL: priceMoney.amount is a BigInt. JSON.stringify THROWS on BigInt -> crashes
//   NextResponse.json() and RSC->client. Convert with Number(amount) in lib/square/catalog.ts
//   BEFORE returning. The DTOs that cross any boundary must contain ONLY plain numbers/strings.
// CRITICAL: pricingType === "VARIABLE_PRICING" => no priceMoney. Compute price RANGE over
//   fixed-price variations; never assume every variation has a price.
// CRITICAL: inventory exists only when variation.trackInventory === true. No record != sold out.
//   inventory count.quantity is a STRING -> Number(). IN_STOCK is the only sellable state.
// CRITICAL: Next 15 dynamic route params are async: `params: Promise<{ slug: string }>; await params`.
// GOTCHA: Square catalog ITEM ids are uppercase alphanumeric with NO hyphens (e.g. "MLRF3K3G71HW5").
//   createProductSlug appends the raw id; extractSquareItemIdFromSlug = substring after LAST '-'.
// GOTCHA: next/image blocks unconfigured hosts. Square images are S3 (square-catalog-production.s3.amazonaws.com).
//   Add to next.config.ts remotePatterns or images 500.
// GOTCHA: App-side gate is StoreProductSettings.isOnlineSellable (NOT Square ecomVisibility). The
//   list endpoint should read sellable ids from Mongo first, then fetch those items from Square.
// PATTERN: API success = NextResponse.json({ success: true, ... }); error = ({ error }, { status }).
// PATTERN: logs use `console.log("[FILENAME-FUNCTION] ...")` per CLAUDE.md.
// PATTERN: money in CENTS everywhere server-side (Square + Order model + storeTypes); format at UI.
```

## Implementation Blueprint

### Data models and structure
No new Mongoose models — `Order` and `StoreProductSettings` are already committed, and the read
contracts live in `lib/types/storeTypes.ts` (`StoreProduct`, `StoreProductSummary`,
`StoreProductVariation`, `StoreProductImage`, `StoreProductAvailability`). The API routes return
these exact types. `lib/square/catalog.ts` returns intermediate plain DTOs (already BigInt-free);
`catalogHelpers.ts` maps those + `StoreProductSettings` into the `storeTypes` shapes.

### Mock / Fixture Data (UI reference — build the components against this before the API is live)

Drop this into `components/store/__fixtures__/mock-products.ts` and import it in StoreGrid/ProductDetail
behind a fallback (or in Storybook) so the UI can be built/styled before `/api/store/products` returns
real data. It is typed against `lib/types/storeTypes.ts` and modeled on the studio's real Square catalog.
**All money is CENTS.** `slug` follows `createProductSlug` (`slugify(name)-<squareItemId>`; Square ids are
uppercase, no hyphens). Image URLs use placehold.co so they render offline — to display them via `next/image`
in local dev, add `{ protocol: "https", hostname: "placehold.co" }` to remotePatterns (DEV ONLY; real images
are Square S3). Covers: single-variation, multi-variation w/ price range, available / low_stock / sold_out,
and a no-image item.

```ts
import type { StoreProduct, StoreProductSummary } from "@/lib/types/storeTypes";

// --- Grid fixtures (GET /api/store/products returns StoreProductSummary[]) ---
export const MOCK_STORE_PRODUCTS: StoreProductSummary[] = [
  {
    squareItemId: "MOCKWORKBK001",
    name: "Animals Watercolor Workbook",
    slug: "animals-watercolor-workbook-MOCKWORKBK001",
    primaryImage: { id: "IMG1", url: "https://placehold.co/600x600/e0f2fe/0c4a6e?text=Animals+Workbook", altText: "Animals watercolor workbook cover" },
    categoryName: "Watercolor Workbooks",
    priceRange: { minCents: 2400, maxCents: 2400 },
    hasMultipleVariations: false,
    availability: "available",
    displayOrder: 0,
  },
  {
    squareItemId: "MOCKSTICK002",
    name: "Be The Sunshine Clear Decal Sticker",
    slug: "be-the-sunshine-clear-decal-sticker-MOCKSTICK002",
    primaryImage: { id: "IMG2", url: "https://placehold.co/600x600/fef9c3/854d0e?text=Sunshine+Sticker", altText: "Be The Sunshine clear decal sticker" },
    categoryName: "Stickers & Decals",
    priceRange: { minCents: 500, maxCents: 500 },
    hasMultipleVariations: false,
    availability: "low_stock", // 2 left -> renders fewSpots Badge
    displayOrder: 1,
  },
  {
    squareItemId: "MOCKPBN003",
    name: "Cacti in Bowl Paint-by-Number Kit",
    slug: "cacti-in-bowl-paint-by-number-kit-MOCKPBN003",
    primaryImage: { id: "IMG3", url: "https://placehold.co/600x600/dcfce7/166534?text=Cacti+PBN+Kit", altText: "Cacti in bowl paint-by-number kit" },
    categoryName: "Art Kits",
    priceRange: { minCents: 3999, maxCents: 3999 },
    hasMultipleVariations: false,
    availability: "available",
    displayOrder: 2,
  },
  {
    squareItemId: "MOCKMOSAIC004",
    name: "Thin Mosaic Board",
    slug: "thin-mosaic-board-MOCKMOSAIC004",
    primaryImage: { id: "IMG4", url: "https://placehold.co/600x600/cffafe/155e75?text=Thin+Mosaic+Board", altText: "Thin mosaic board" },
    categoryName: "Mosaics",
    priceRange: { minCents: 2500, maxCents: 7000 }, // multi-variation -> "$25 – $70"
    hasMultipleVariations: true,
    availability: "available",
    displayOrder: 3,
  },
  {
    squareItemId: "MOCKMIRROR005",
    name: "Mirror Mosaics",
    slug: "mirror-mosaics-MOCKMIRROR005",
    primaryImage: { id: "IMG5", url: "https://placehold.co/600x600/ede9fe/5b21b6?text=Mirror+Mosaics", altText: "Mirror mosaics" },
    categoryName: "Mosaics",
    priceRange: { minCents: 4000, maxCents: 8000 },
    hasMultipleVariations: true,
    availability: "available", // some variations sold out, but not all -> still available
    displayOrder: 4,
  },
  {
    squareItemId: "MOCKPAINT006",
    name: "Travel Watercolor Paint Set",
    slug: "travel-watercolor-paint-set-MOCKPAINT006",
    primaryImage: undefined, // no image -> component must render a placeholder
    categoryName: "Supplies",
    priceRange: { minCents: 1599, maxCents: 1599 },
    hasMultipleVariations: false,
    availability: "sold_out", // renders soldOut Badge + disabled CTA
    displayOrder: 5,
  },
];

// --- Detail fixture (GET /api/store/products/[id] returns one StoreProduct) ---
// Full multi-variation example with multiple images + a sold-out variation.
export const MOCK_STORE_PRODUCT_DETAIL: StoreProduct = {
  squareItemId: "MOCKMOSAIC004",
  name: "Thin Mosaic Board",
  slug: "thin-mosaic-board-MOCKMOSAIC004",
  categoryName: "Mosaics",
  description:
    "Pre-cut thin mosaic board, ready to tile. Choose your size and shape — perfect for a take-home creative project or a class kit.",
  primaryImage: { id: "IMG4", url: "https://placehold.co/800x800/cffafe/155e75?text=Mosaic+Board+1", altText: "Thin mosaic board, square" },
  images: [
    { id: "IMG4", url: "https://placehold.co/800x800/cffafe/155e75?text=Mosaic+Board+1", altText: "Thin mosaic board, square" },
    { id: "IMG4b", url: "https://placehold.co/800x800/a5f3fc/155e75?text=Mosaic+Board+2", altText: "Thin mosaic board, heart" },
    { id: "IMG4c", url: "https://placehold.co/800x800/67e8f9/155e75?text=Mosaic+Board+3", altText: "Thin mosaic board, round" },
  ],
  priceRange: { minCents: 2500, maxCents: 7000 },
  hasMultipleVariations: true,
  availability: "available",
  displayOrder: 3,
  variations: [
    { id: "VAR4A", name: "Small Square (6\")",  priceCents: 2500, sku: "MB-SQ-SM", availability: "available", inStockQuantity: 12, ordinal: 0 },
    { id: "VAR4B", name: "Large Square (12\")", priceCents: 4500, sku: "MB-SQ-LG", availability: "low_stock", inStockQuantity: 2,  ordinal: 1 },
    { id: "VAR4C", name: "Heart",                priceCents: 5500, sku: "MB-HEART", availability: "available", inStockQuantity: 8,  ordinal: 2 },
    { id: "VAR4D", name: "Round (14\")",         priceCents: 7000, sku: "MB-RND-LG", availability: "sold_out", inStockQuantity: 0,  ordinal: 3 },
  ],
};
```

OPTIONAL Task 16b — CREATE components/store/__fixtures__/mock-products.ts with the above; have StoreGrid/ProductDetail
fall back to fixtures when `process.env.NEXT_PUBLIC_USE_STORE_FIXTURES === "true"`, OR use them only in tests/Storybook.

### List of tasks (in order)
```yaml
Task 1 — MODIFY next.config.ts:
  - ADD to images.remotePatterns: { protocol: "https", hostname: "square-catalog-production.s3.amazonaws.com" }
    and { protocol: "https", hostname: "square-catalog-sandbox.s3.amazonaws.com" }
  - KEEP the existing cdn.sanity.io entry.
  - NOTE: if production images 404 in next/image, log the real imageData.url host and add it.

Task 2 — CREATE lib/utils/moneyHelpers.ts:
  - export centsToDollars(cents: number): number  // cents/100
  - export formatCents(cents: number): string     // `$${(cents/100).toFixed(2)}`
  - export moneyAmountToCents(amount: bigint | number | string | null | undefined): number | null
      // Number(amount) when present (handles the BigInt -> number conversion at the Square boundary), else null
  - JSDoc each; explicit return types; no `any`.

Task 3 — MODIFY lib/utils/slugify.ts:
  - ADD createProductSlug(name: string, squareItemId: string): string  => `${slugify(name)}-${squareItemId}`
  - ADD extractSquareItemIdFromSlug(slugWithId: string): string
      // return substring after the LAST '-'; if none, return input. (Square ids have no hyphens.)
  - MIRROR JSDoc style of existing createEventSlug/extractEventIdFromSlug. DO NOT touch existing fns.

Task 4 — CREATE lib/square/catalog.ts:
  - MIRROR client init from lib/square/gift-cards.ts (import from "square/legacy"; Environment by SQUARE_ENVIRONMENT).
  - const { catalogApi, inventoryApi } = squareClient; LOCATION_ID from SQUARE_LOCATION_ID || NEXT_PUBLIC_SQUARE_LOCATION_ID.
  - export listCatalogItems(squareItemIds?: string[]): Promise<RawCatalogItem[]>
      // if ids provided -> batchRetrieveCatalogObjects({ objectIds: ids, includeRelatedObjects: true })
      // else -> page searchCatalogObjects({ objectTypes:["ITEM"], includeRelatedObjects:true, includeDeletedObjects:false, limit:200, cursor })
      // build imageById + categoryById maps from relatedObjects; attach to each item.
  - export retrieveCatalogItem(squareItemId: string): Promise<RawCatalogItem | null>
      // catalogApi.retrieveCatalogObject(squareItemId, true); null if not found / not ITEM.
  - export getInventoryCounts(variationIds: string[]): Promise<Map<string, number>>
      // inventoryApi.batchRetrieveInventoryCounts({ catalogObjectIds, locationIds:[LOCATION_ID], states:["IN_STOCK"] }); Number(count.quantity).
  - RawCatalogItem (internal type): { id, name, descriptionHtml?, isArchived, productType, presentAtAllLocations?, presentAtLocationIds?, categoryNames: string[], imageUrls: string[], variations: RawVariation[] }
  - RawVariation: { id, name, sku?, ordinal, priceCents: number | null, variablePricing: boolean, trackInventory: boolean }
  - CRITICAL: convert priceMoney.amount via Number() here. Respect locationOverrides[].priceMoney first.
  - Wrap calls in try/catch; `if (e instanceof ApiError)` throw new Error(e.result?.errors?.[0]?.detail ?? "Square catalog error").
  - log `[CATALOG-listCatalogItems] ...` etc.

Task 5 — CREATE lib/utils/catalogHelpers.ts:
  - export deriveAvailability(variation, inStockQty): StoreProductAvailability
      // if !trackInventory -> "available"; if qty<=0 -> "sold_out"; if qty<=LOW_THRESHOLD(=3) -> "low_stock"; else "available".
  - export toStoreProductVariation(raw: RawVariation, inStock?: number): StoreProductVariation
  - export toStoreProductSummary(item: RawCatalogItem, settings: IStoreProductSettings, stock: Map<string,number>): StoreProductSummary
      // slug = settings.slug || createProductSlug(item.name, item.id); priceRange = min/max of fixed prices;
      // hasMultipleVariations = variations.length>1; availability rollup; primaryImage from imageUrls[0]; displayOrder.
  - export toStoreProduct(item, settings, stock): StoreProduct  // summary + description + images + variations
  - export isSellablePhysicalGood(item: RawCatalogItem): boolean
      // productType === "REGULAR" && !isArchived && (presentAtAllLocations || presentAtLocationIds?.includes(LOCATION_ID))
  - Pure functions, explicit return types. MIRROR lib/utils/eventTypeHelpers.ts style.

Task 6 — CREATE app/api/store/products/route.ts (GET):
  - await connectMongo();
  - const settings = await StoreProductSettings.find({ isOnlineSellable: true }).lean();
  - if empty -> return { success: true, products: [] }.
  - const items = await listCatalogItems(settings.map(s => s.squareItemId));
  - const stock = await getInventoryCounts(items.flatMap(i => i.variations.map(v => v.id)));
  - products = items.filter(isSellablePhysicalGood).map(i => toStoreProductSummary(i, settingsBySquareId.get(i.id)!, stock)).sort(displayOrder).
  - return NextResponse.json({ success: true, products });  // StoreProductSummary[]
  - catch -> console.error("[API-STORE-PRODUCTS-GET] ...") and ({ success:false, error }, {status:500}).

Task 7 — CREATE app/api/store/products/[id]/route.ts (GET):
  - params: Promise<{ id: string }>; const { id } = await params;  // id = squareItemId
  - await connectMongo(); const settings = await StoreProductSettings.findOne({ squareItemId: id, isOnlineSellable: true }).lean();
  - if (!settings) return ({ error: "Not found" }, { status: 404 });   // do not expose hidden items
  - const item = await retrieveCatalogItem(id); if (!item || !isSellablePhysicalGood(item)) -> 404.
  - const stock = await getInventoryCounts(item.variations.map(v => v.id));
  - return NextResponse.json({ success: true, product: toStoreProduct(item, settings, stock) });

Task 8 — CREATE hooks/queries/use-products.ts:
  - MIRROR hooks/queries/use-events.ts structure ("use client", useQuery, fetch fn, staleTime 2*60*1000, gcTime 10*60*1000 — same values as use-events.ts).
  - useProducts(): useQuery<StoreProductSummary[], Error>({ queryKey:["store-products"], queryFn: fetchProducts })
  - useProduct(squareItemId: string): useQuery<StoreProduct, Error>({ queryKey:["store-product", squareItemId], queryFn, enabled: !!squareItemId })
  - fetchProducts -> GET /api/store/products, throw on !ok, return result.products ?? [].
  - fetchProduct -> GET /api/store/products/${id}, return result.product.

Task 9 — MODIFY hooks/queries/index.ts:
  - export { useProducts, useProduct } from "./use-products";

Task 10 — CREATE components/store/ProductCard.tsx:
  - props: { product: StoreProductSummary }. Wrap in <Link href={`/store/${product.slug}`}>.
  - USE Card (variant="event"), PriceBadge (price = formatCents(priceRange.minCents) or `${min}–${max}`), Badge for availability
    (map: available->"available", low_stock->"fewSpots", sold_out->"soldOut").
  - next/image for primaryImage.url with fixed aspect ratio + fill; fallback placeholder when no image.
  - <=200 lines; explicit ReactElement return.

Task 11 — CREATE components/store/StoreGrid.tsx ("use client"):
  - const { data, isLoading, isError } = useProducts();
  - loading -> simple skeleton/loading text; error -> friendly message; empty -> "No products available yet."
  - grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` of <ProductCard>.

Task 12 — CREATE app/store/page.tsx:
  - MIRROR app/walk-in/page.tsx: <div className="min-h-screen"><PageHeader title="Shop" subtitle="..." leftIcon rightIcon /><StoreGrid/></div>.
  - icons from react-icons (e.g. FaShoppingBag / GiPaintBrush). May be a Server Component (no hooks itself).

Task 13 — CREATE components/store/ProductDetail.tsx ("use client") + app/store/[slug]/page.tsx:
  - ProductDetail props: { squareItemId: string }. const { data: product, isLoading, isError } = useProduct(squareItemId).
  - image gallery (primary + thumbnails), description (render descriptionHtml safely — sanitize or render as text),
    variation selector (useState selected variation), price (formatCents), availability Badge, disabled "Add to cart" (Phase A2).
  - app/store/[slug]/page.tsx: `params: Promise<{ slug: string }>`; `const { slug } = await params`;
    `const squareItemId = extractSquareItemIdFromSlug(slug)`; render <ProductDetail squareItemId={squareItemId} />.
  - ADD generateMetadata({ params }): await params, extract id, retrieveCatalogItem(id) for title (try/catch fallback "Product").

Task 14 — CREATE scripts/seed-store-products.ts (DEV ONLY, acceptance aid until Phase B0):
  - connectMongo(); listCatalogItems(); for each isSellablePhysicalGood item, upsert StoreProductSettings
    { squareItemId, isOnlineSellable: true } (default parcelPreset MEDIUM from the model).
  - Runnable via `npx tsx scripts/seed-store-products.ts` (`tsx` is NOT a project dependency — `npx tsx`
    fetches it on demand; alternatively add `tsx` as a devDependency, or expose as an npm script).
  - Header comment: "TEMPORARY — replaced by the Phase B0 admin product-management UI."

Task 15 — MODIFY components/layout/nav/NavBar.tsx:
  - ADD a top-level desktop link (mirror the About/Gallery <motion.div variants={itemVariants}> + <Link href="/store"> + NavRippleText "Store") between About and Gallery (or after Home — match existing styling exactly incl. the underline after: classes).
  - ADD matching mobile entry in the mobile <motion.nav> block (border-b border-gray-100 pb-2, onClick setIsMenuOpen(false)).
  - DO NOT add to OFFER_DROPDOWN_ITEMS — this is a top-level link.

Task 16 — CREATE tests:
  - __tests__/utils/moneyHelpers.test.ts — centsToDollars, formatCents, moneyAmountToCents (bigint/number/null).
  - __tests__/utils/catalogHelpers.test.ts — isSellablePhysicalGood, deriveAvailability, price range over fixed+variable, slug fallback.
  - __tests__/hooks/queries/use-products.test.ts — MIRROR use-events.test.ts (mockFetch success/error, createWrapper).
```

### Per-task pseudocode (critical details only)
```ts
// Task 4 — lib/square/catalog.ts (BigInt conversion is the crux)
import { Client, Environment, ApiError } from "square/legacy";
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "sandbox" ? Environment.Sandbox : Environment.Production,
});
const { catalogApi, inventoryApi } = squareClient;
const LOCATION_ID = process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";

function variationPriceCents(vd): number | null {
  const override = vd.locationOverrides?.find(lo => lo.locationId === LOCATION_ID)?.priceMoney;
  const amt = (override ?? vd.priceMoney)?.amount;      // bigint | undefined
  return amt != null ? Number(amt) : null;             // <-- BigInt -> number, stays cents
}
// page with searchCatalogObjects({ objectTypes:["ITEM"], includeRelatedObjects:true, ... });
// build imageById from relatedObjects where r.type==="IMAGE" -> r.imageData.url
//       categoryById where r.type==="CATEGORY" -> r.categoryData.name
// each RawCatalogItem.variations[].priceCents = variationPriceCents(v.itemVariationData)

// Task 6 — app/api/store/products/route.ts
export async function GET(): Promise<Response> {
  try {
    await connectMongo();
    const settings = await StoreProductSettings.find({ isOnlineSellable: true }).lean();
    if (settings.length === 0) return NextResponse.json({ success: true, products: [] });
    const byId = new Map(settings.map(s => [s.squareItemId, s]));
    const items = (await listCatalogItems([...byId.keys()])).filter(isSellablePhysicalGood);
    const stock = await getInventoryCounts(items.flatMap(i => i.variations.map(v => v.id)));
    const products = items
      .map(i => toStoreProductSummary(i, byId.get(i.id)!, stock))
      .sort((a, b) => a.displayOrder - b.displayOrder);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[API-STORE-PRODUCTS-GET] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load products" }, { status: 500 });
  }
}

// Task 13 — app/store/[slug]/page.tsx
interface Props { params: Promise<{ slug: string }>; }
export default async function StoreProductPage({ params }: Props): Promise<ReactElement> {
  const { slug } = await params;
  const squareItemId = extractSquareItemIdFromSlug(slug);
  return <ProductDetail squareItemId={squareItemId} />;
}
```

### Integration Points
```yaml
CONFIG:
  - next.config.ts: add Square S3 hosts to images.remotePatterns (Task 1).
  - ENV (already set for the project): SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, SQUARE_LOCATION_ID. No new env needed for A1.

DATABASE:
  - StoreProductSettings collection drives visibility. Until Phase B0 ships the admin UI, run
    scripts/seed-store-products.ts to flag items isOnlineSellable for acceptance testing.

ROUTES:
  - hooks/queries/index.ts: export useProducts, useProduct.
  - components/layout/nav/NavBar.tsx: add /store top-level link (desktop + mobile).

NAV:
  - href="/store", label "Store", top-level (NOT in What We Offer dropdown).
```

## Validation Loop

### Known baseline failures (PRE-EXISTING — out of scope, do NOT try to fix)
```text
At the time this PRP was written, the repo already has, with ZERO changes:
- `npx tsc --noEmit` -> 32 errors, ALL inside `__tests__/` (mock-data.ts, test-utils.tsx,
  and several __tests__/hooks/** files — e.g. "Cannot find name 'vi'"). tsconfig includes
  **/*.ts(x) with no __tests__ exclude, so tsc typechecks tests.
- `npm run test:run` -> 1 pre-existing failure: __tests__/hooks/queries/use-reservations.test.ts.
The gate for THIS PRP is: introduce NO NEW tsc errors and NO NEW test failures. Your new source
files must be type-clean; your new test files must pass. Verify with the targeted commands below.
Do NOT attempt to repair the pre-existing __tests__ failures — that is unrelated scope.
```

### Level 1: Syntax & Style
```bash
npm run lint                     # next lint / eslint — expected: zero errors
npx tsc --noEmit 2>&1 | grep -E "lib/square/catalog|lib/utils/(catalog|money)|app/store|components/store|hooks/queries/use-products"
# Expected: NO lines (your new files contribute zero errors). The 32 pre-existing __tests__ errors are baseline.
```

### Level 2: Unit Tests (mirror __tests__/hooks/queries/use-events.test.ts)
```bash
npm run test:run
# moneyHelpers: formatCents(2499) === "$24.99"; moneyAmountToCents(2499n) === 2499; moneyAmountToCents(null) === null
# catalogHelpers: isSellablePhysicalGood excludes APPOINTMENTS_SERVICE & archived; deriveAvailability respects trackInventory;
#                 price range ignores VARIABLE_PRICING variations; slug falls back to createProductSlug.
# use-products: mockFetch({ success:true, products:[...] }) -> data; mockFetch({ error },false) -> isError.
```

### Level 3: Integration Test (manual)
```bash
# 1. Seed (one-time, dev): npx tsx scripts/seed-store-products.ts
# 2. npm run dev
# 3. curl http://localhost:3000/api/store/products   -> { "success": true, "products": [ {name, slug, priceRange, ...} ] }
# 4. Open http://localhost:3000/store                -> product grid renders (images, prices, badges)
# 5. Click a product                                  -> /store/<slug>-<squareItemId> detail renders
# 6. curl http://localhost:3000/api/store/products/<squareItemId> -> { success:true, product:{...} }
# 7. Confirm nav "Store" link works on desktop + mobile.
# If 500: check terminal for "[API-STORE-PRODUCTS-GET]"; a BigInt error means a priceMoney.amount wasn't Number()-converted.
```

### Level 4: Build
```bash
npm run build                    # production build must pass (catches RSC/serialization + image config issues)
```

## Final Validation Checklist
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] `npx tsc --noEmit` shows NO errors in new files (only the 32 pre-existing `__tests__` baseline errors remain)
- [ ] `npm run test:run` — new tests pass; no NEW failures beyond the pre-existing `use-reservations.test.ts` baseline
- [ ] `/api/store/products` returns only online-sellable REGULAR items (no services/classes/test items)
- [ ] `/store` grid + `/store/[slug]` detail render with images, prices (cents->$), availability badges
- [ ] Nav "Store" link present desktop + mobile, routes to /store
- [ ] No BigInt serialization errors anywhere; prices correct
- [ ] Variable-priced / missing-price variations handled ("Price varies", no crash)
- [ ] Logs use `[FILENAME-FUNCTION]` format; no `any`; ReactElement return types

---

## Anti-Patterns to Avoid
- ❌ Don't import from `square` — this repo uses `square/legacy`.
- ❌ Don't pass raw Square objects (with BigInt) across `NextResponse.json` or to client components — convert in `lib/square/catalog.ts`.
- ❌ Don't gate the Shop on Square `ecomVisibility` — the gate is `StoreProductSettings.isOnlineSellable`.
- ❌ Don't assume every variation has a price (VARIABLE_PRICING) or inventory (trackInventory false).
- ❌ Don't hand-roll buttons/cards/badges — use `components/ui`.
- ❌ Don't add Store to the "What We Offer" dropdown — it's a top-level link.
- ❌ Don't build cart/checkout — out of scope (Phase A2/A3).
- ❌ Don't forget Next 15 async `params` (`await params`).

## Confidence Score: 9/10
High confidence for one-pass success: all SDK quirks documented (PRPs/ai_docs/square-catalog-legacy-sdk.md),
every pattern has a concrete file reference (all 19 verified to exist), models/types already committed, and the
validation gates are honest about the 32 pre-existing `__tests__` baseline failures. Residual risk: exact
production Square image host (mitigated by wildcard fallback + log-and-pin note) and the B0 dependency for
visibility (mitigated by the dev seed script).
