/**
 * Server-side price integrity for the online store checkout.
 *
 * The checkout endpoint must NEVER trust money that arrives in the request body.
 * These helpers recompute the chargeable amounts from authoritative sources:
 *   - line-item prices from the Square catalog (keyed by variation id)
 *   - shipping from a fresh Shippo re-quote (matched by carrier + service level)
 *
 * On any mismatch (unknown item, variable-priced variation, vanished shipping
 * service) a PriceIntegrityError is thrown so the caller rejects the order
 * BEFORE charging. See ecommerce/09-checkout-price-integrity.md.
 */
import { listCatalogItems, getInventoryCounts } from "@/lib/square/catalog";
import StoreProductSettings, {
  DEFAULT_PARCEL_PRESET,
} from "@/lib/models/StoreProductSettings";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";
import { getShippingRates } from "@/lib/shippo/rates";
import type { ShipToAddress, ShippingRate } from "@/lib/shippo/rates";
import type { CartItem } from "@/lib/types/cartTypes";
import { PriceIntegrityError } from "@/lib/checkout/errors";

// Re-exported so existing importers (the checkout route) keep working.
export { PriceIntegrityError };

/** A single order line, priced from the catalog (never from the client). */
export interface PricedItem {
  squareCatalogItemId: string;
  squareVariationId: string;
  name: string;
  variationName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface PricedCart {
  items: PricedItem[];
  subtotalCents: number;
}

const MAX_QUANTITY_PER_LINE = 99;

/** Validates a client-supplied quantity is a sane positive integer. */
function validateQuantity(quantity: unknown, label: string): number {
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY_PER_LINE
  ) {
    throw new PriceIntegrityError(`Invalid quantity for ${label}`);
  }
  return quantity;
}

/**
 * Rebuilds the cart subtotal from authoritative Square catalog prices.
 * Ignores any client-supplied priceCents/subtotalCents entirely.
 */
export async function priceCartFromCatalog(
  items: CartItem[]
): Promise<PricedCart> {
  if (!items.length) {
    throw new PriceIntegrityError("Cart is empty");
  }

  const itemIds = Array.from(new Set(items.map((i) => i.squareCatalogItemId)));
  const catalogItems = await listCatalogItems(itemIds);

  // Map every variation id -> { name, variationName, priceCents, trackInventory }
  // from the catalog.
  const variationById = new Map<
    string,
    {
      name: string;
      variationName: string;
      priceCents: number | null;
      trackInventory: boolean;
    }
  >();
  for (const item of catalogItems) {
    for (const v of item.variations) {
      variationById.set(v.id, {
        name: item.name,
        variationName: v.name,
        priceCents: v.priceCents,
        trackInventory: v.trackInventory,
      });
    }
  }

  const pricedItems: PricedItem[] = items.map((item) => {
    const match = variationById.get(item.squareVariationId);
    if (!match) {
      throw new PriceIntegrityError(
        `Item no longer available: ${item.productName}`
      );
    }
    if (match.priceCents == null) {
      // VARIABLE_PRICING — no authoritative price, cannot charge safely.
      throw new PriceIntegrityError(
        `Item cannot be sold online: ${match.name}`
      );
    }
    const quantity = validateQuantity(item.quantity, match.name);
    return {
      squareCatalogItemId: item.squareCatalogItemId,
      squareVariationId: item.squareVariationId,
      name: match.name,
      variationName: match.variationName,
      quantity,
      unitPriceCents: match.priceCents,
    };
  });

  // Stock check: reject any line whose requested quantity exceeds Square's
  // IN_STOCK count, for variations with inventory tracking enabled. Combine
  // quantities per variation first so a cart split across multiple lines for
  // the same variation can't slip past the check line-by-line. This closes
  // the "sold-out item charges forever" gap but is a point-in-time read, not
  // a hold — two checkouts racing for the last unit can still both pass.
  const requestedByVariation = new Map<string, number>();
  for (const item of pricedItems) {
    requestedByVariation.set(
      item.squareVariationId,
      (requestedByVariation.get(item.squareVariationId) ?? 0) + item.quantity
    );
  }
  const trackedVariationIds = Array.from(requestedByVariation.keys()).filter(
    (id) => variationById.get(id)?.trackInventory
  );
  if (trackedVariationIds.length > 0) {
    const counts = await getInventoryCounts(trackedVariationIds);
    for (const variationId of trackedVariationIds) {
      const requested = requestedByVariation.get(variationId) ?? 0;
      const available = counts.get(variationId) ?? 0;
      if (requested > available) {
        const match = variationById.get(variationId);
        throw new PriceIntegrityError(
          `Not enough stock for ${match?.name ?? "this item"}${
            match?.variationName ? ` (${match.variationName})` : ""
          } — only ${available} left.`
        );
      }
    }
  }

  const subtotalCents = pricedItems.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0
  );

  return { items: pricedItems, subtotalCents };
}

/**
 * Re-quotes shipping live and resolves the customer's chosen service to a fresh,
 * server-authoritative rate. Matches by carrier + service level (NOT rateId — Shippo
 * mints a new rateId on every quote, so the client's id is always stale). The returned
 * rate carries a FRESH rateId that the label purchase can actually transact on.
 */
export async function resolveShippingRate(
  destination: ShipToAddress,
  items: CartItem[],
  selectedRate: ShippingRate
): Promise<ShippingRate> {
  const itemIds = Array.from(new Set(items.map((i) => i.squareCatalogItemId)));
  const settings = await StoreProductSettings.find({
    squareItemId: { $in: itemIds },
  }).select("squareItemId parcelPreset");

  const presets: ParcelPreset[] = [];
  for (const item of items) {
    const setting = settings.find(
      (s) => s.squareItemId === item.squareCatalogItemId
    );
    const preset = (setting?.parcelPreset ?? DEFAULT_PARCEL_PRESET) as ParcelPreset;
    const quantity = validateQuantity(item.quantity, item.productName);
    for (let i = 0; i < quantity; i++) presets.push(preset);
  }

  const rates = await getShippingRates(destination, presets);

  const fresh = rates.find(
    (r) =>
      r.carrier === selectedRate.carrier && r.service === selectedRate.service
  );

  if (!fresh) {
    throw new PriceIntegrityError(
      "The selected shipping option is no longer available. Please review shipping and try again."
    );
  }

  return fresh;
}
