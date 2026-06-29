"use client";

// Variant J — "Image-First Overlay": large square imagery with product detail
// hidden until hover, when a coastal gradient overlay slides up. Minimal chrome,
// gallery-meets-lookbook. Built on shadcn/ui primitives.

import type { ReactElement } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import { Card } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Skeleton } from "@/components/ui/shadcn/skeleton";

export default function VariantJ(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <section className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[2rem] border border-white/65 bg-white/85 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">
        {isError && (
          <p className="py-16 text-center text-[var(--color-error)]">
            Unable to load products. Please try again later.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product, index) => {
              const tag = product.availabilityLabel;
              return (
                <Card
                  key={product.squareItemId}
                  className="group relative aspect-square gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-sm"
                >
                  {/* Full-bleed image */}
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.altText ?? product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={index < 4}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[var(--color-light)] text-xs text-[var(--color-text-subtle)]">
                      No image
                    </div>
                  )}

                  {/* Always-visible availability badge */}
                  {tag && (
                    <Badge
                      variant={
                        product.availability === "sold_out"
                          ? "destructive"
                          : "secondary"
                      }
                      className="absolute left-3 top-3 z-10 shadow-sm"
                    >
                      {tag}
                    </Badge>
                  )}

                  {/* Hover overlay with details. Kept dark enough across its full
                      height so white text stays readable over any image. */}
                  <div
                    className="absolute inset-x-0 bottom-0 z-10 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(7,58,88,0.96) 0%, rgba(7,58,88,0.93) 70%, rgba(12,74,110,0.82) 100%)",
                    }}
                  >
                    <h3
                      className="text-sm font-semibold leading-snug text-white"
                      style={{ fontFamily: "var(--font-eb-garamond)" }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-xs leading-relaxed text-white/90">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {formatPriceRange(product.priceRange)}
                      </span>
                    </div>
                    <AddToCartButton
                      product={product}
                      className="mt-2.5 w-full rounded-lg bg-white py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-light)]"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
