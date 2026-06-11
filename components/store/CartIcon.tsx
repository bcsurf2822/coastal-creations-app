"use client";

import type { ReactElement } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/store/CartProvider";

export default function CartIcon(): ReactElement {
  const { totalItems, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Shopping cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      className="relative p-1 text-[#0f172a] hover:text-[#0369a1] transition-colors"
    >
      <FaShoppingBag size={20} />
      {totalItems > 0 && (
        // key={totalItems} remounts the badge on each change so the bump
        // animation replays every time an item is added.
        <span
          key={totalItems}
          className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] animate-[cartBump_0.4s_ease] items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[10px] font-bold text-white"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
