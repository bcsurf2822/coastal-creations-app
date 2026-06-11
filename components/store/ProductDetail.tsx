"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { useProduct } from "@/hooks/queries/use-products";
import { useCart } from "@/components/store/CartProvider";
import { Badge, Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type {
  StoreProductAvailability,
  StoreProductVariation,
} from "@/lib/types/storeTypes";

interface ProductDetailProps {
  squareItemId: string;
}

const availabilityVariant: Record<
  StoreProductAvailability,
  "available" | "fewSpots" | "soldOut"
> = {
  available: "available",
  low_stock: "fewSpots",
  sold_out: "soldOut",
};

export default function ProductDetail({
  squareItemId,
}: ProductDetailProps): ReactElement {
  const { data: product, isLoading, isError } = useProduct(squareItemId);
  const { addItem, openDrawer } = useCart();
  const [selectedVariation, setSelectedVariation] =
    useState<StoreProductVariation | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-4xl animate-pulse">
          <div className="h-96 bg-[var(--color-light)] rounded-[var(--radius-xl)]" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-error)] text-lg">
          Product not found or unavailable.
        </p>
      </div>
    );
  }

  const activeVariation = selectedVariation ?? product.variations[0] ?? null;
  const displayPrice = activeVariation
    ? formatCents(activeVariation.priceCents)
    : null;

  const activeImage = product.images[activeImageIndex] ?? product.primaryImage;

  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-square bg-[var(--color-light)] rounded-[var(--radius-xl)] overflow-hidden">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.altText ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--color-text-subtle)]">
                No image available
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors ${
                    i === activeImageIndex
                      ? "border-[var(--color-primary)]"
                      : "border-transparent hover:border-[var(--color-border-lighter)]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.name} thumbnail ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {product.categoryName && (
            <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-wide">
              {product.categoryName}
            </p>
          )}

          <h1 className="text-3xl font-bold text-[var(--color-primary)]">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            {displayPrice && (
              <span className="text-2xl font-bold text-[var(--color-primary)]">
                {displayPrice}
              </span>
            )}
            {activeVariation && (
              <Badge
                variant={availabilityVariant[activeVariation.availability]}
                showDot={false}
              />
            )}
          </div>

          {product.description && (
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variation selector */}
          {product.hasMultipleVariations && product.variations.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-medium text-[var(--color-text-primary)]">
                Choose an option:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    disabled={v.availability === "sold_out"}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] border text-sm font-medium transition-colors ${
                      activeVariation?.id === v.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : v.availability === "sold_out"
                        ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "border-[var(--color-border-lighter)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)]"
                    }`}
                  >
                    {v.name}
                    {v.priceCents > 0 && activeVariation?.id !== v.id && (
                      <span className="ml-1 text-[var(--color-text-subtle)]">
                        · {formatCents(v.priceCents)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-2">
            {(() => {
              const isSoldOut = activeVariation?.availability === "sold_out";
              const canAddToCart = !!activeVariation && !isSoldOut;
              return (
                <Button
                  variant="primary"
                  disabled={!canAddToCart}
                  className="w-full"
                  onClick={() => {
                    if (!canAddToCart || !product) return;
                    addItem(product, activeVariation!);
                    openDrawer();
                  }}
                >
                  {isSoldOut ? "Sold Out" : "Add to Cart"}
                </Button>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
