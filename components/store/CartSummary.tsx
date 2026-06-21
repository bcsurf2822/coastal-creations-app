"use client";

import type { ReactElement } from "react";
import type { CartItem } from "@/lib/types/cartTypes";
import type { ShippingRate } from "@/lib/shippo/rates";
import { formatCents } from "@/lib/utils/moneyHelpers";

interface CartSummaryProps {
  items: CartItem[];
  subtotalCents: number;
  selectedRate: ShippingRate | null;
}

export default function CartSummary({
  items,
  subtotalCents,
  selectedRate,
}: CartSummaryProps): ReactElement {
  const totalCents = selectedRate
    ? subtotalCents + selectedRate.rateCents
    : null;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="sticky top-6 bg-white border border-[var(--color-border-lighter)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] text-base">
          Order Summary
        </h2>
        <span className="text-xs font-medium bg-[var(--color-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Cart items */}
      <ul className="flex flex-col gap-4 mb-5">
        {items.map((item) => (
          <li key={item.squareVariationId} className="flex items-start gap-3">
            {/* Image */}
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gray-100 shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt ?? item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] leading-tight truncate">
                {item.productName}
              </p>
              {item.variationName && (
                <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
                  {item.variationName}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
                Qty: {item.quantity}
              </p>
            </div>

            {/* Price */}
            <span className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
              {formatCents(item.priceCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="border-t border-[var(--color-border-lighter)] pt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-[var(--color-text-primary)]">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--color-text-primary)]">Shipping</span>
          {selectedRate ? (
            <span className="font-medium text-green-600">
              {formatCents(selectedRate.rateCents)}
            </span>
          ) : (
            <span className="italic text-[var(--color-text-subtle)] text-xs self-center">
              Select a shipping method
            </span>
          )}
        </div>

        <div className="border-t border-[var(--color-border-lighter)] pt-3 mt-1 flex justify-between font-bold text-base">
          <span className="text-[var(--color-primary)]">Total</span>
          <span className="text-[var(--color-primary)]">
            {totalCents !== null ? formatCents(totalCents) : "—"}
          </span>
        </div>
      </div>

    </div>
  );
}
