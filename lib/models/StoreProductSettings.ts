import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * App-side metadata layered on top of a Square Catalog item ("the online-store layer").
 *
 * Square owns the product itself (name, price, photos, variations, inventory). Square
 * does NOT know (a) whether an item should appear on this website's Shop, or (b) its
 * shipping box/weight for Shippo rating. This model holds exactly those website-only
 * fields, keyed by the Square item id. It is what makes the storefront catalog-driven:
 * the merchant flips `isOnlineSellable` on ANY catalog item to sell it online, with no
 * code change. See spec/ecommerce/INITIAL.md.
 */

// Box-size presets used to build Shippo parcels without per-item measuring.
// Default dimensions/weights for each preset live in lib/utils/parcelHelpers.ts.
// Default for a brand-new product is "MEDIUM" (~5lb) so live rates never break.
export type ParcelPreset = "SMALL" | "MEDIUM" | "LARGE";

export const DEFAULT_PARCEL_PRESET: ParcelPreset = "MEDIUM";

export type WeightUnit = "oz" | "lb";
export type DistanceUnit = "in" | "cm";

// Optional exact parcel override (only needed when a preset is not precise enough).
export interface IProductShipping {
  weight: number;
  weightUnit: WeightUnit;
  length: number;
  width: number;
  height: number;
  distanceUnit: DistanceUnit;
}

export interface IStoreProductSettings extends Document {
  squareItemId: string; // links to a Square Catalog ITEM (unique)
  isOnlineSellable: boolean; // THE Shop visibility flag
  parcelPreset: ParcelPreset; // default MEDIUM (5lb)
  shipping?: IProductShipping; // optional exact override of the preset
  slug?: string; // optional pretty URL for /shop/[slug]
  displayOrder?: number; // optional manual sort within the Shop
  createdAt: Date;
  updatedAt: Date;
}

const ProductShippingSchema = new Schema<IProductShipping>(
  {
    weight: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, enum: ["oz", "lb"], required: true, default: "lb" },
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    distanceUnit: { type: String, enum: ["in", "cm"], required: true, default: "in" },
  },
  { _id: false }
);

const StoreProductSettingsSchema = new Schema<IStoreProductSettings>(
  {
    squareItemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isOnlineSellable: {
      type: Boolean,
      required: true,
      default: false,
    },
    parcelPreset: {
      type: String,
      enum: ["SMALL", "MEDIUM", "LARGE"],
      required: true,
      default: DEFAULT_PARCEL_PRESET,
    },
    shipping: {
      type: ProductShippingSchema,
      required: false,
    },
    slug: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Shop query: only sellable items, in display order.
StoreProductSettingsSchema.index({ isOnlineSellable: 1, displayOrder: 1 });

const StoreProductSettings: Model<IStoreProductSettings> =
  mongoose.models.StoreProductSettings ||
  mongoose.model<IStoreProductSettings>(
    "StoreProductSettings",
    StoreProductSettingsSchema
  );

export default StoreProductSettings;
