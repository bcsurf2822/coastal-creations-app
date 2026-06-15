/**
 * @fileoverview Customer-facing store (Shop) read contracts.
 * @module lib/types/storeTypes
 *
 * The product the customer browses is NOT a MongoDB document — it is assembled at
 * read time from the Square Catalog API (product data) merged with the app-side
 * `StoreProductSettings` document (online visibility, slug, display order). The
 * shapes below are the contract the Shop grid + product detail page bind to, and
 * what `lib/utils/catalogHelpers.ts` produces from a Square `CatalogObject`.
 *
 * Money is in CENTS (Square-native). Format for display via lib/utils/moneyHelpers.ts.
 * The Order flow consumes these: a cart line built from a StoreProductVariation maps
 * directly onto lib/models/Order.ts -> IOrderItem.
 */

/** Stock state, mapped from Square Inventory (or "available" when tracking is off). */
export type StoreProductAvailability = "available" | "low_stock" | "sold_out";

/** A product image sourced from a Square catalog IMAGE object. */
export interface StoreProductImage {
  id: string; // Square IMAGE object id
  url: string;
  altText?: string;
}

/** A single selectable Square ItemVariation (e.g. "Large", "Blue"). */
export interface StoreProductVariation {
  id: string; // Square ItemVariation id -> Order.IOrderItem.squareVariationId
  name: string; // -> Order.IOrderItem.variationName
  priceCents: number; // -> Order.IOrderItem.unitPriceCents
  sku?: string;
  availability: StoreProductAvailability;
  inStockQuantity?: number; // present only when Square tracks inventory
  ordinal: number; // display order within the item (from Square)
}

/**
 * Lightweight shape for the Shop grid / product cards.
 * Returned by GET /api/store/products (the listing endpoint).
 */
export interface StoreProductSummary {
  squareItemId: string; // -> Order.IOrderItem.squareCatalogItemId
  name: string;
  slug: string; // resolved route segment for /store/[slug]
  primaryImage?: StoreProductImage;
  categoryName?: string;
  description?: string; // plain-text, for grid cards that show a blurb
  priceRange: { minCents: number; maxCents: number };
  hasMultipleVariations: boolean;
  availability: StoreProductAvailability; // rolled up across variations
  displayOrder: number;
  /**
   * The item's first (lowest-ordinal) variation, so the grid card can add to cart
   * with a real Square variation id without fetching the full detail payload.
   */
  defaultVariation?: StoreProductVariation;
}

/**
 * Full shape for the product detail page (/store/[slug]).
 * Returned by GET /api/store/products/[id].
 */
export interface StoreProduct extends StoreProductSummary {
  description?: string;
  images: StoreProductImage[];
  variations: StoreProductVariation[];
}
