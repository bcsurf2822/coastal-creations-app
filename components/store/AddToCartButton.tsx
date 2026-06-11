"use client";

import { useState, useCallback } from "react";
import type { ReactElement, CSSProperties } from "react";
import { FaCheck } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartProvider";
import type { Product } from "./mockProducts";
import type { StoreProduct, StoreProductVariation } from "@/lib/types/storeTypes";

interface AddToCartButtonProps {
  product: Product;
  className: string;
  style?: CSSProperties;
  showCartIcon?: boolean;
  iconClassName?: string;
  label?: string;
}

function toStoreProduct(p: Product): StoreProduct {
  const variation: StoreProductVariation = {
    id: `mock-${p.id}-default`,
    name: "Default",
    priceCents: Math.round(p.price * 100),
    availability: p.inStock ? "available" : "sold_out",
    inStockQuantity: p.stockCount,
    ordinal: 0,
  };
  return {
    squareItemId: `mock-${p.id}`,
    name: p.name,
    slug: p.id,
    primaryImage: undefined,
    categoryName: p.category,
    priceRange: {
      minCents: Math.round(p.price * 100),
      maxCents: Math.round(p.price * 100),
    },
    hasMultipleVariations: false,
    availability: p.inStock ? "available" : "sold_out",
    displayOrder: 0,
    description: p.description,
    images: [],
    variations: [variation],
  };
}

export function AddToCartButton({
  product,
  className,
  style,
  showCartIcon = false,
  iconClassName = "text-xs",
  label = "Add to Cart",
}: AddToCartButtonProps): ReactElement {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = useCallback(() => {
    if (added) return;
    const storeProduct = toStoreProduct(product);
    addItem(storeProduct, storeProduct.variations[0]);
    openDrawer();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [added, product, addItem, openDrawer]);

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {added && <span className="btn-shine-sweep" />}
      <span className="relative flex items-center justify-center gap-2 transition-all duration-200">
        {added ? (
          <>
            <FaCheck className={iconClassName} />
            Added!
          </>
        ) : (
          <>
            {showCartIcon && <FaShoppingCart className={iconClassName} />}
            {label}
          </>
        )}
      </span>
    </button>
  );
}
