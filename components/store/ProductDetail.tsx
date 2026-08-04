"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useProduct } from "@/hooks/queries/use-products";
import { useCart } from "@/components/store/CartProvider";
import { Badge, Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import { buildAvailabilityLabel } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";

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
  const { addItem } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // A grid/list card links here with ?variation=<id> to pin the specific
  // flavor it represents, e.g. clicking "Mini Beach Art Kit" shouldn't land
  // you on whichever variation this page would otherwise default to. There
  // is deliberately no way to switch to a different variation from this page
  // — each flavor is presented as its own independent product (matching the
  // shop grid), so offering a picker here would just reopen the "which one
  // am I even buying" confusion the grid change was meant to remove.
  const requestedVariationId = useSearchParams().get("variation");

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

  // Priority: the flavor the card was clicked from (?variation=), then the
  // stock-aware default (never a sold-out variation just because it happens
  // to be ordinal 0 — product.variations is ordinal-sorted, so variations[0]
  // alone would silently land on a sold-out flavor whenever it's first,
  // showing "Sold Out" on load even though other flavors are in stock).
  const requestedVariation = requestedVariationId
    ? product.variations.find((v) => v.id === requestedVariationId)
    : undefined;
  const activeVariation =
    requestedVariation ?? product.defaultVariation ?? product.variations[0] ?? null;
  const displayPrice = activeVariation
    ? formatCents(activeVariation.priceCents)
    : null;

  // Default the hero to the active variation's OWN photo (e.g. the actual
  // lizard art kit, not item.images[0] — which may be a different flavor or
  // an unrelated promotional shot on multi-variation items). Once the
  // shopper picks a thumbnail, that choice takes over.
  const variationImage = activeVariation?.imageUrl
    ? { id: `variation-${activeVariation.id}`, url: activeVariation.imageUrl, altText: activeVariation.name }
    : undefined;
  const activeImage =
    activeImageIndex === 0
      ? (variationImage ?? product.images[0] ?? product.primaryImage)
      : (product.images[activeImageIndex] ?? product.primaryImage);

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
              >
                {buildAvailabilityLabel(
                  activeVariation.availability,
                  activeVariation.inStockQuantity ?? 0
                ) ?? undefined}
              </Badge>
            )}
          </div>

          {product.description && (
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {product.description}
            </p>
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
                    // Don't auto-open the cart drawer on add — the cart icon
                    // badge animates as feedback; opening is reserved for the
                    // cart icon itself (consistent with the shop grid).
                    addItem(product, activeVariation!);
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
