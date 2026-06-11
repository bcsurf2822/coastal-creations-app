/**
 * Maps Square Catalog raw DTOs + StoreProductSettings into the storefront storeTypes shapes.
 * All functions are pure — no I/O, no Square SDK imports.
 */
import type { RawCatalogItem, RawVariation } from "@/lib/square/catalog";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";
import type {
  StoreProduct,
  StoreProductAvailability,
  StoreProductImage,
  StoreProductSummary,
  StoreProductVariation,
} from "@/lib/types/storeTypes";
import { createProductSlug } from "@/lib/utils/slugify";
import { formatCents } from "@/lib/utils/moneyHelpers";

const LOW_STOCK_THRESHOLD = 3;

/**
 * Returns true for items that should be allowed in the Shop:
 * REGULAR physical goods, not archived, present at the merchant's location.
 */
export function isSellablePhysicalGood(item: RawCatalogItem): boolean {
  return item.productType === "REGULAR" && !item.isArchived;
}

/**
 * Derives availability from a variation's inventory tracking settings and stock count.
 * When trackInventory is false, Square doesn't track stock → always "available".
 */
export function deriveAvailability(
  variation: RawVariation,
  inStockQty: number | undefined
): StoreProductAvailability {
  if (!variation.trackInventory) return "available";
  const qty = inStockQty ?? 0;
  if (qty <= 0) return "sold_out";
  if (qty <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "available";
}

/**
 * Maps a raw variation DTO to the storefront StoreProductVariation shape.
 */
export function toStoreProductVariation(
  raw: RawVariation,
  inStockQty: number | undefined
): StoreProductVariation {
  return {
    id: raw.id,
    name: raw.name,
    priceCents: raw.priceCents ?? 0,
    sku: raw.sku ?? undefined,
    availability: deriveAvailability(raw, inStockQty),
    inStockQuantity: raw.trackInventory ? (inStockQty ?? 0) : undefined,
    ordinal: raw.ordinal,
  };
}

/**
 * Computes the price range across a set of fixed-price variations.
 * Variable-priced variations (priceCents === null) are excluded from the range.
 */
function priceRange(
  variations: RawVariation[]
): { minCents: number; maxCents: number } {
  const prices = variations
    .map((v) => v.priceCents)
    .filter((p): p is number => p !== null);

  if (prices.length === 0) return { minCents: 0, maxCents: 0 };
  return {
    minCents: Math.min(...prices),
    maxCents: Math.max(...prices),
  };
}

/**
 * Rolls up availability across all variations:
 * - "available" if any variation is available
 * - "low_stock" if the best available is low_stock
 * - "sold_out" if all variations are sold out
 */
function rollupAvailability(
  variations: RawVariation[],
  stock: Map<string, number>
): StoreProductAvailability {
  const availabilities = variations.map((v) =>
    deriveAvailability(v, stock.get(v.id))
  );
  if (availabilities.includes("available")) return "available";
  if (availabilities.includes("low_stock")) return "low_stock";
  return "sold_out";
}

/**
 * Builds the StoreProductSummary (grid card shape) from a raw item + settings + stock map.
 */
export function toStoreProductSummary(
  item: RawCatalogItem,
  settings: IStoreProductSettings,
  stock: Map<string, number>
): StoreProductSummary {
  const slug =
    (settings.slug as string | undefined) ||
    createProductSlug(item.name, item.id);

  const primaryImage: StoreProductImage | undefined =
    item.imageUrls.length > 0
      ? { id: `img-${item.id}-0`, url: item.imageUrls[0], altText: item.name }
      : undefined;

  return {
    squareItemId: item.id,
    name: item.name,
    slug,
    primaryImage,
    categoryName: item.categoryNames[0],
    priceRange: priceRange(item.variations),
    hasMultipleVariations: item.variations.length > 1,
    availability: rollupAvailability(item.variations, stock),
    displayOrder: (settings.displayOrder as number | undefined) ?? 0,
  };
}

/**
 * Builds the full StoreProduct (detail page shape) from a raw item + settings + stock map.
 */
export function toStoreProduct(
  item: RawCatalogItem,
  settings: IStoreProductSettings,
  stock: Map<string, number>
): StoreProduct {
  const summary = toStoreProductSummary(item, settings, stock);

  const images: StoreProductImage[] = item.imageUrls.map((url, i) => ({
    id: `img-${item.id}-${i}`,
    url,
    altText: `${item.name} image ${i + 1}`,
  }));

  const variations: StoreProductVariation[] = item.variations
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((v) => toStoreProductVariation(v, stock.get(v.id)));

  return {
    ...summary,
    description: item.descriptionHtml
      ? stripHtml(item.descriptionHtml)
      : undefined,
    images,
    variations,
  };
}

/**
 * Strips basic HTML tags from Square's descriptionHtml for safe plain-text rendering.
 * The product detail component can render this as plain text without dangerouslySetInnerHTML.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Formats a price range for display.
 * Single-variation items show one price; multi-variation shows "$min – $max".
 */
export function formatPriceRange(range: {
  minCents: number;
  maxCents: number;
}): string {
  if (range.minCents === range.maxCents) return formatCents(range.minCents);
  return `${formatCents(range.minCents)} – ${formatCents(range.maxCents)}`;
}

