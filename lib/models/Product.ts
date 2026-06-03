import mongoose, { Document, Model, Schema } from "mongoose";

export type ProductCategory = "art-kits" | "supplies" | "classes" | "other";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  customCategory?: string;
  image?: string;
  stock: number;
  isActive: boolean;
  squareCatalogId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["art-kits", "supplies", "classes", "other"],
    },
    customCategory: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    squareCatalogId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1, isActive: 1 });

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
