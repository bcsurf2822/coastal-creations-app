"use client";

// Final Shop grid card — "Gallery/Polaroid" (synthesis of variants H + K):
// a clean framed card with a centered serif caption, category, blurb, and the
// price + Add-to-Cart pinned to the bottom so every card in a row bottom-aligns.
// The product image is shown UNCROPPED (object-contain) on a soft tile so the
// whole photo is always visible.

import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductSummary } from "@/lib/types/storeTypes";

interface ShopProductCardProps {
  product: StoreProductSummary;
  priority?: boolean;
}

export default function ShopProductCard({
  product,
  priority = false,
}: ShopProductCardProps): ReactElement {
  const tag = product.availabilityLabel;
  const soldOut = product.availability === "sold_out";
  const href = `/shop/${product.slug}`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[var(--color-border-light)] bg-white p-3 shadow-[0_2px_12px_rgba(12,74,110,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(12,74,110,0.14)]">
      {/* Whole image, uncropped (object-contain) on a soft tile */}
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-[var(--color-light)]"
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-subtle)]">
            No image
          </div>
        )}
        {tag && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
              soldOut
                ? "bg-[var(--color-error)] text-white"
                : "bg-white/95 text-[var(--color-primary)]"
            }`}
          >
            {tag}
          </span>
        )}
      </Link>

      {/* Centered gallery caption */}
      <div className="flex flex-1 flex-col px-1 pt-4 text-center">
        <Link href={href}>
          {/* min-h reserves space for 2 lines so 1-line and 2-line titles
              still leave the description/price/CTA aligned across the row */}
          <h3
            className="line-clamp-2 min-h-[2.5rem] text-lg font-semibold italic leading-tight text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)]"
            style={{ fontFamily: "var(--font-eb-garamond)" }}
          >
            {product.name}
          </h3>
        </Link>
        {product.description && (
          // Cap long descriptions at ~4 lines and let the overflow scroll inside
          // the card, so the whole blurb is readable without breaking the
          // equal-height alignment of the price/CTA row across the grid.
          <p className="mt-2 max-h-24 overflow-y-auto overscroll-contain pr-1 text-sm leading-relaxed text-[var(--color-text-subtle)] [scrollbar-width:thin]">
            {product.description}
          </p>
        )}

        {/* mt-auto pins price + CTA to the bottom so they align across the row */}
        <div className="mt-auto pt-4">
          <span className="block text-lg font-bold text-black">
            {formatPriceRange(product.priceRange)}
          </span>
          <AddToCartButton
            product={product}
            className="mt-3 w-full rounded-full border-2 border-[var(--color-primary)] bg-transparent py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          />
        </div>
      </div>
    </article>
  );
}
