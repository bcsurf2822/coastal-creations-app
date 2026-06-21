# Ticket 08 — Parcel sizing for live shipping rates

> How a product's box size + weight is determined so Shippo can return accurate UPS/FedEx rates
> at checkout, with the **least possible manual effort** for the merchant.
> Related: `lib/utils/parcelHelpers.ts`, `lib/shippo/rates.ts`, `lib/models/StoreProductSettings.ts`.

## Status

- **State**: Deciding. Visibility is now Square-category-driven (`00-STATUS.md` B0); this proposes
  doing the same for parcel size.

## Background — what live rates actually need

Carrier rate APIs (UPS/FedEx via Shippo) price a shipment from **weight** + **dimensions**:
- **Weight** is the primary driver.
- **Dimensions** matter because carriers bill the greater of actual weight and **dimensional
  weight** (volume ÷ a divisor) — so a light-but-bulky box still costs more.

So every rate request needs *a box*: L×W×H + weight.

## How stores usually source that (industry patterns)

| Approach | Effort | Accuracy | Notes |
|---|---|---|---|
| **Per-product weight + dims** | High (data entry per item) | Highest | Shopify/Woo make weight a core field. Overkill for a small studio. |
| **Box / packaging presets** | Medium (assign a box per item) | High | ShipStation/Shippo's recommended model: a few named boxes; cart picks/bin-packs. |
| **Category-default presets** | **Lowest** (categorize once) | Good | Map a product category → a default box. New items inherit automatically. |
| **Flat-rate boxes (USPS)** | Low | N/A | Not applicable — spec is UPS/FedEx only. |
| **Single flat parcel** | None | Poor | Over/undercharges; risky for live rates. |

Weight is what must be roughly right; dimensions are a secondary correction. A preset bundles both,
which is why presets are the pragmatic default for a catalog with clustered product types.

## Current implementation

- `lib/utils/parcelHelpers.ts` defines three presets:
  | Preset | L×W×H (in) | Weight |
  |---|---|---|
  | SMALL | 8×6×2 | 1 lb |
  | MEDIUM | 12×9×4 | 3 lb |
  | LARGE | 16×12×6 | 8 lb |
- `StoreProductSettings.parcelPreset` (default MEDIUM) is set per item from the admin Store
  Products screen.
- `lib/shippo/rates.ts` picks the **heaviest preset** in the cart and rates a single parcel.

## Sequencing decision (resolved)

**Defer the sophistication; get the flow working first, then tune.** The flow mechanics (cart →
rate → pay → label → ship → deliver) are identical regardless of sizing precision — sizing only
changes the quoted dollar amount. Accuracy can't be validated until the flow runs against real
products with real weights (quoted vs. actual postage). So: ship a **safe default** now, tune later.

The ONE fix worth doing before "later": today `lib/shippo/rates.ts` rates a single parcel of the
**heaviest** preset in the cart → a cart of 5 kits is billed as one box (undercharge). Replace with
**weight-summing** (below). That removes the only real correctness bug; everything past it is tuning.

## Category model (recommended)

Pick ONE convention. Two were half-started: `Online Sales - Art Kits` (product-type) vs. a
size-based S/M/L. **Use size-based, flat:**

```
Online Sales - Small     → SMALL   (8×6×2, ~1 lb)   stickers, decals, flat books
Online Sales - Medium    → MEDIUM  (12×9×4, ~3 lb)  art kits, paint-by-number
Online Sales - Large     → LARGE   (16×12×6, ~8 lb) mosaic boards, bulky
```

- **The category name IS the box** → no code mapping table to maintain, no "unmapped new product
  type" gap. Parse the suffix to the preset.
- **Visibility is free**: anything whose category starts with `Online Sales` shows in the Shop
  (existing `isInOnlineSalesCategory`).
- **Brand categories** (Emily Lex, Callie Danielle) remain each item's *reporting* category;
  `Online Sales - <Size>` is an **added** category (Square allows multiple). Nothing is lost.
- Effort per item: **one category assignment in Square** — which also makes it visible.
- Precedence: explicit per-item `StoreProductSettings.parcelPreset` override > category size >
  MEDIUM default. The admin dropdown stays as an outlier escape hatch.

## Multi-item / edge-case handling (v1 = weight-sum, single box)

| Scenario | v1 behavior | Notes |
|---|---|---|
| 1 item | its category's box | exact |
| N of same item | sum weights; bump box if over capacity | fine |
| Mixed sizes | sum weights; use the **largest** item's box dims | weight exact, dims conservative → never undercharges |
| Exceeds one box ("doubling up") | split into `ceil(totalWeight ÷ maxBoxWeight)` parcels | **Shippo rates multi-parcel shipments natively** and sums them; the label flow handles it |
| Huge/odd order | log + flag for manual review | rare; revisit only if it happens |

True 3D bin-packing is NOT needed for a studio shipping light, flat goods — weight-summing +
Shippo multi-parcel covers the realistic cases.

## Implementation outline (when we pick this up)

1. `parcelHelpers.ts`: `categoryToParcelPreset(categoryNames)` parses the `Online Sales - <Size>`
   suffix → preset; default MEDIUM.
2. `parcelHelpers.ts`: `planParcels(cartItems)` → sums preset weights, picks the fitting box, and
   splits into multiple parcels when total weight exceeds the largest box's capacity.
3. `lib/shippo/rates.ts`: accept the parcel plan and pass an array of `parcels` to Shippo (it
   already supports multiple). Replace the current `heaviestPreset` single-parcel logic.
4. The label-purchase path needs no change — it buys the chosen rate, which already covers all
   parcels in the shipment.
