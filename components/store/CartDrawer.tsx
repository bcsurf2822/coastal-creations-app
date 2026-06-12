"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/components/store/CartProvider";
import CartItemRow from "@/components/store/CartItemRow";
import { Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";

export default function CartDrawer(): ReactElement {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    closeDrawer,
    subtotalCents
  } = useCart();

  // Close on ESC key
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
            className="fixed right-0 top-0 z-[61] h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-lighter)]">
              <h2 className="text-lg font-bold text-[var(--color-primary)]">
                Your Cart
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (items.length > 0) {
                    if (confirm("Remove all items from your cart?")) {
                      clearCart();
                      closeDrawer();
                    }
                  } else {
                    closeDrawer();
                  }
                }}
                aria-label={items.length > 0 ? "Clear cart" : "Close cart"}
                className="p-1.5 rounded text-[var(--color-text-subtle)] hover:text-[var(--color-error)] hover:bg-[var(--color-light)] transition-colors"
                title={items.length > 0 ? "Clear all items" : "Close"}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                  <p className="text-[var(--color-text-subtle)]">
                    Your cart is empty.
                  </p>
                  <Link href="/store" onClick={closeDrawer}>
                    <Button variant="secondary" size="sm">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <CartItemRow
                    key={item.squareVariationId}
                    item={item}
                    compact
                    onUpdateQty={(qty) =>
                      updateQuantity(item.squareVariationId, qty)
                    }
                    onRemove={() => removeItem(item.squareVariationId)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-[var(--color-border-lighter)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    Subtotal
                  </span>
                  <span className="font-bold text-[var(--color-primary)]">
                    {formatCents(subtotalCents)}
                  </span>
                </div>
                <Link href="/cart" onClick={closeDrawer}>
                  <Button variant="secondary" className="w-full">
                    View Full Cart
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    closeDrawer();
                    router.push("/checkout");
                  }}
                >
                  Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
