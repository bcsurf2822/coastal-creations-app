"use client";

// Store-only floating cart button. Stays pinned bottom-right so shoppers can
// always see and reach the cart while browsing the store, and gives a small
// "bump" each time an item is added.

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/store/CartProvider";

export default function StoreCartButton(): ReactElement {
  const { totalItems, openDrawer } = useCart();
  const prevCount = useRef(totalItems);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (totalItems > prevCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 450);
      prevCount.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`View cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-[0_8px_24px_rgba(12,74,110,0.35)] transition-transform hover:scale-105 ${
        bump ? "animate-[cartBump_0.45s_ease]" : ""
      }`}
      style={{ background: "var(--gradient-button)" }}
    >
      <FaShoppingBag size={18} />
      <span className="text-sm font-semibold">Cart</span>
      {totalItems > 0 && (
        <span
          key={totalItems}
          className="ml-0.5 flex h-6 min-w-[24px] animate-[cartBump_0.4s_ease] items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-[var(--color-primary)]"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
