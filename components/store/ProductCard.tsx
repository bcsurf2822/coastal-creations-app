"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Badge, PriceBadge } from "@/components/ui";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductSummary, StoreProductAvailability } from "@/lib/types/storeTypes";

interface ProductCardProps {
  product: StoreProductSummary;
}

const availabilityVariant: Record<
  StoreProductAvailability,
  "available" | "fewSpots" | "soldOut"
> = {
  available: "available",
  low_stock: "fewSpots",
  sold_out: "soldOut",
};

export default function ProductCard({ product }: ProductCardProps): ReactElement {
  const priceDisplay = formatPriceRange(product.priceRange);

  return (
    <Link href={`/store/${product.slug}`} className="block group">
      <Card
        variant="event"
        className="h-full flex flex-col overflow-hidden p-0 transition-shadow duration-200 group-hover:shadow-[var(--shadow-xl)]"
      >
        {/* Image */}
        <div className="relative w-full aspect-square bg-[var(--color-light)] overflow-hidden rounded-t-[var(--radius-lg)]">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.altText ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-subtle)] text-sm">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          {product.categoryName && (
            <p className="text-xs font-medium text-[var(--color-secondary)] uppercase tracking-wide">
              {product.categoryName}
            </p>
          )}

          <h3 className="font-semibold text-[var(--color-primary)] leading-snug line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center justify-between pt-2">
            <PriceBadge price={priceDisplay} />
            <Badge variant={availabilityVariant[product.availability]} showDot={false} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
