"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type { CartItem } from "@/lib/types/cartTypes";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
  compact?: boolean;
}

export default function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  compact = false,
}: CartItemRowProps): ReactElement {
  const imgSize = compact ? 56 : 96;
  const atMin = item.quantity === 1;
  const atMax =
    item.maxQuantity !== undefined && item.quantity >= item.maxQuantity;

  const qtyControls = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onUpdateQty(item.quantity - 1)}
        disabled={atMin}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center rounded border border-[var(--color-border-lighter)] text-[var(--color-text-primary)] text-sm hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center text-sm font-medium text-[var(--color-text-primary)]">
        {item.quantity}
      </span>
      <button
        type="button"
        onClick={() => onUpdateQty(item.quantity + 1)}
        disabled={atMax}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center rounded border border-[var(--color-border-lighter)] text-[var(--color-text-primary)] text-sm hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        +
      </button>
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border-lighter)] last:border-0">
        {/* Image */}
        <div
          className="relative flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-light)]"
          style={{ width: imgSize, height: imgSize }}
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.productName}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-subtle)] text-xs">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/store/${item.slug}`}
            className="block text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] truncate"
          >
            {item.productName}
          </Link>
          <p className="text-xs text-[var(--color-text-subtle)] truncate">
            {item.variationName}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {qtyControls}
            <span className="text-sm font-semibold text-[var(--color-primary)]">
              {formatCents(item.priceCents * item.quantity)}
            </span>
          </div>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.productName}`}
          className="flex-shrink-0 p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-error)] transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  // Full layout (cart page)
  return (
    <div className="flex items-start gap-4 py-4 border-b border-[var(--color-border-lighter)] last:border-0">
      {/* Image */}
      <div
        className="relative flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-light)]"
        style={{ width: imgSize, height: imgSize }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt ?? item.productName}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-subtle)] text-xs">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/store/${item.slug}`}
          className="block text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
        >
          {item.productName}
        </Link>
        <p className="text-sm text-[var(--color-text-subtle)] mt-0.5">
          {item.variationName}
        </p>
        <p className="text-sm text-[var(--color-text-subtle)] mt-0.5">
          {formatCents(item.priceCents)} each
        </p>
        <div className="mt-3">{qtyControls}</div>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-base font-bold text-[var(--color-primary)]">
          {formatCents(item.priceCents * item.quantity)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.productName}`}
          className="text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-error)] transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
