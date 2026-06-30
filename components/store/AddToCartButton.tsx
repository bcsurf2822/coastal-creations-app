"use client";

import { useState, useCallback } from "react";
import type { ReactElement, CSSProperties } from "react";
import { FaCheck } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartProvider";
import type { StoreProductSummary } from "@/lib/types/storeTypes";

interface AddToCartButtonProps {
  product: StoreProductSummary;
  className: string;
  style?: CSSProperties;
  showCartIcon?: boolean;
  iconClassName?: string;
  label?: string;
}

export function AddToCartButton({
  product,
  className,
  style,
  showCartIcon = false,
  iconClassName = "text-xs",
  label = "Add to Cart",
}: AddToCartButtonProps): ReactElement {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const variation = product.defaultVariation;
  const soldOut = product.availability === "sold_out" || !variation;

  // Adding an item does NOT open the cart drawer — that was disruptive while
  // browsing. The cart icon badge animates as feedback, and the button itself
  // flips to "Added!"; opening the drawer is reserved for clicking the cart.
  const handleClick = useCallback(() => {
    if (added || !variation || soldOut) return;
    addItem(product, variation);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [added, variation, soldOut, product, addItem]);

  return (
    <button
      onClick={handleClick}
      disabled={soldOut}
      className={`relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={style}
    >
      {added && <span className="btn-shine-sweep" />}
      <span className="relative flex items-center justify-center gap-2 transition-all duration-200">
        {added ? (
          <>
            <FaCheck className={iconClassName} />
            Added!
          </>
        ) : soldOut ? (
          "Sold Out"
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
