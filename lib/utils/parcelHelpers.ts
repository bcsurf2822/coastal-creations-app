import type { ParcelPreset } from "@/lib/models/StoreProductSettings";

export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
  distanceUnit: "in";
  weight: number;
  massUnit: "lb";
}

// Box preset defaults used when a product has no exact shipping override.
// These are reasonable defaults — the merchant can override per-product via StoreProductSettings.shipping.
const PARCEL_PRESETS: Record<ParcelPreset, ParcelDimensions> = {
  SMALL: { length: 8, width: 6, height: 2, distanceUnit: "in", weight: 1, massUnit: "lb" },
  MEDIUM: { length: 12, width: 9, height: 4, distanceUnit: "in", weight: 3, massUnit: "lb" },
  LARGE: { length: 16, width: 12, height: 6, distanceUnit: "in", weight: 8, massUnit: "lb" },
};

export function getParcelDimensions(preset: ParcelPreset): ParcelDimensions {
  return PARCEL_PRESETS[preset];
}

const PRESET_ORDER: ParcelPreset[] = ["SMALL", "MEDIUM", "LARGE"];

// Max weight (lb) a preset box is trusted to hold before a multi-item cart should
// bump to the next size up. Keeps the box dimensions honest once several items are
// packed into one parcel, instead of always shipping in whatever box the single
// heaviest item calls for.
const PRESET_WEIGHT_CAPACITY: Record<ParcelPreset, number> = {
  SMALL: 2,
  MEDIUM: 5,
  LARGE: Infinity,
};

// Resolves the single parcel Shippo should quote/ship for an entire cart. Weight is
// the true sum of every item's preset weight (quantity-expanded) — a cart of 3 items
// now weighs ~3x a single item instead of being quoted at whatever one item weighs.
// Dimensions start at the largest individual item's preset (never pack a LARGE item
// into a SMALL box) and step up a tier if the summed weight exceeds that box's
// capacity, so a full cart of small items doesn't get under-weighted into a box too
// small to plausibly hold them.
export function resolveParcel(presets: ParcelPreset[]): ParcelDimensions {
  const totalWeight = presets.reduce((sum, p) => sum + PARCEL_PRESETS[p].weight, 0);
  let tierIndex = Math.max(...presets.map((p) => PRESET_ORDER.indexOf(p)));

  while (
    tierIndex < PRESET_ORDER.length - 1 &&
    totalWeight > PRESET_WEIGHT_CAPACITY[PRESET_ORDER[tierIndex]]
  ) {
    tierIndex++;
  }

  return { ...PARCEL_PRESETS[PRESET_ORDER[tierIndex]], weight: totalWeight };
}
