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
