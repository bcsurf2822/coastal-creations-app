"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/store/CartProvider";
import CartItemRow from "@/components/store/CartItemRow";
import { Button, Card } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";

export default function CartPage(): ReactElement {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <FaShoppingBag size={64} className="text-[var(--color-text-subtle)]" />
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          Your cart is empty
        </h1>
        <p className="text-[var(--color-text-subtle)] max-w-sm">
          Looks like you haven&apos;t added anything yet. Head back to the shop
          to find something you&apos;ll love.
        </p>
        <Link href="/store">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.squareVariationId}
              item={item}
              compact={false}
              onUpdateQty={(qty) => updateQuantity(item.squareVariationId, qty)}
              onRemove={() => removeItem(item.squareVariationId)}
            />
          ))}

          <div className="mt-6">
            <Link href="/store">
              <Button variant="ghost" size="sm">
                ← Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card variant="standard">
            <h2 className="text-lg font-bold text-[var(--color-primary)] mb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-[var(--color-text-primary)]">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatCents(subtotalCents)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--color-text-subtle)]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-[var(--color-border-lighter)] pt-3 flex justify-between font-bold text-[var(--color-primary)]">
                <span>Total</span>
                <span>{formatCents(subtotalCents)}</span>
              </div>
            </div>

            <div className="mt-5">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
