"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { useCart } from "./CartProvider";

interface StockCounterProps {
  productId: string;
  stockCount: number;
  threshold?: number;
  prefix?: string;
}

export function StockCounter({
  productId,
  stockCount,
  threshold = 5,
  prefix = "Only ",
}: StockCounterProps): ReactElement | null {
  const { items } = useCart();

  const cartQty = items
    .filter((i) => i.squareCatalogItemId === `mock-${productId}`)
    .reduce((sum, i) => sum + i.quantity, 0);

  const displayStock = Math.max(0, stockCount - cartQty);

  const [emoji, setEmoji] = useState<":)" | "-_-" | null>(null);
  const prevQty = useRef(cartQty);

  useEffect(() => {
    if (cartQty === prevQty.current) return;
    setEmoji(cartQty > prevQty.current ? ":)" : "-_-");
    prevQty.current = cartQty;
    const t = setTimeout(() => setEmoji(null), 2000);
    return () => clearTimeout(t);
  }, [cartQty]);

  if (displayStock > threshold) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-orange-500">
      {prefix}{displayStock} left
      {emoji && (
        <span className="font-mono transition-all duration-300">
          {emoji}
        </span>
      )}
    </span>
  );
}
