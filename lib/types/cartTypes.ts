/**
 * @fileoverview Cart line item contract for the customer-facing store.
 * @module lib/types/cartTypes
 *
 * CartItem is a snapshot captured at add-time from a StoreProduct + StoreProductVariation.
 * Fields map directly onto lib/models/Order.ts -> IOrderItem for Phase A3 checkout.
 */

export interface CartItem {
  squareCatalogItemId: string; // product.squareItemId -> IOrderItem.squareCatalogItemId
  squareVariationId: string; // variation.id (unique cart line key) -> IOrderItem.squareVariationId
  productName: string; // -> IOrderItem.name
  variationName: string; // -> IOrderItem.variationName
  priceCents: number; // snapshot at add-time -> IOrderItem.unitPriceCents
  imageUrl?: string; // product.primaryImage?.url
  imageAlt?: string; // product.primaryImage?.altText ?? product.name
  slug: string; // product.slug — for linking back to the PDP
  quantity: number; // >= 1
  maxQuantity?: number; // undefined = unlimited; set from variation.inStockQuantity
}
