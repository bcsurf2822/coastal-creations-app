"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { motion, useAnimationControls } from "motion/react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/store/CartProvider";

export default function CartIcon(): ReactElement {
  const { totalItems, openDrawer } = useCart();
  const controls = useAnimationControls();
  const prevTotal = useRef(totalItems);

  // Jiggle the bag whenever the item count goes UP (an item was just added).
  // Skipped on removals/initial mount so it only celebrates additions.
  useEffect(() => {
    if (totalItems > prevTotal.current) {
      controls.start({
        rotate: [0, -16, 13, -9, 6, -3, 0],
        scale: [1, 1.2, 0.96, 1.1, 1],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    }
    prevTotal.current = totalItems;
  }, [totalItems, controls]);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Shopping cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      className="relative p-1 text-[#0f172a] hover:text-[#0369a1] transition-colors"
    >
      <motion.span
        animate={controls}
        className="inline-block origin-center"
        style={{ transformOrigin: "center 65%" }}
      >
        <FaShoppingBag size={20} />
      </motion.span>
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
