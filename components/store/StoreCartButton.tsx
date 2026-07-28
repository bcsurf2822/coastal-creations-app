"use client";

// Store-only floating cart button. Stays pinned bottom-right so shoppers can
// always see and reach the cart while browsing the store, and gives the bag a
// little "jiggle" each time an item is added.

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/store/CartProvider";

export default function StoreCartButton(): ReactElement {
  const { totalItems, openDrawer } = useCart();
  const controls = useAnimationControls();
  const prevCount = useRef(totalItems);

  // Jiggle the bag whenever the item count goes UP (an item was just added).
  useEffect(() => {
    if (totalItems > prevCount.current) {
      controls.start({
        rotate: [0, -16, 13, -9, 6, -3, 0],
        scale: [1, 1.2, 0.96, 1.1, 1],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    }
    prevCount.current = totalItems;
  }, [totalItems, controls]);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`View cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-[0_8px_24px_rgba(12,74,110,0.35)] transition-transform hover:scale-105"
      style={{ background: "var(--gradient-button)" }}
    >
      <motion.span
        animate={controls}
        className="inline-block"
        style={{ transformOrigin: "center 65%" }}
      >
        <FaShoppingBag size={18} />
      </motion.span>
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
