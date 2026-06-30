"use client";

// Final Shop list row — the "horizontal list" layout (Variant E): a small
// uncropped thumbnail, name + category + blurb, and a price + Add control on
// the right. Stacks vertically and centers on phones, becomes a row from sm up.

import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductSummary } from "@/lib/types/storeTypes";

interface ShopListRowProps {
  product: StoreProductSummary;
  priority?: boolean;
}

export default function ShopListRow({
  product,
  priority = false,
}: ShopListRowProps): ReactElement {
  const tag = product.availabilityLabel;
  const href = `/shop/${product.slug}`;

  return (
    <div className="group flex flex-col items-center gap-4 rounded-xl px-3 py-5 transition-colors duration-150 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-5 sm:text-left">
      {/* Whole thumbnail, uncropped */}
      <Link
        href={href}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--color-light)]"
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.altText ?? product.name}
            fill
            sizes="96px"
            priority={priority}
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-[var(--color-text-subtle)]">
            No image
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Link href={href}>
            <h3
              className="text-lg font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)]"
              style={{ fontFamily: "var(--font-eb-garamond)" }}
            >
              {product.name}
            </h3>
          </Link>
          {tag && (
            <span className="rounded-full bg-[var(--color-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
              {tag}
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-subtle)]">
            {product.description}
          </p>
        )}
      </div>

      {/* Price + CTA — kept on one horizontal line so they share a clean
          vertical-center alignment (stacked, the price reads as overhanging the
          pill button, whose widest point is its mid-height). */}
      <div className="flex flex-shrink-0 items-center gap-4">
        <span className="min-w-[4.5rem] text-right text-lg font-bold text-black">
          {formatPriceRange(product.priceRange)}
        </span>
        <AddToCartButton
          product={product}
          className="rounded-full px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--gradient-button)" }}
          showCartIcon
          iconClassName="text-[10px]"
          label="Add"
        />
      </div>
    </div>
  );
}
