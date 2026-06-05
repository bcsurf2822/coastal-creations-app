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
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center px-1">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
