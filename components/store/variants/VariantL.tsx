"use client";

// Variant L — "Boutique Minimal": whitespace-forward, borderless, editorial.
// Serif product names, thin dividers, understated CTAs. Upscale gallery-shop
// feel. Built on shadcn/ui primitives.

import type { ReactElement } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import { Card } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Separator } from "@/components/ui/shadcn/separator";
import { Skeleton } from "@/components/ui/shadcn/skeleton";

export default function VariantL(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <section className="min-h-screen py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] border border-white/65 bg-white/85 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">
        {isError && (
          <p className="py-16 text-center text-[var(--color-error)]">
            Unable to load products. Please try again later.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, index) => {
              const tag = product.availabilityLabel;
              return (
                <Card
                  key={product.squareItemId}
                  className="group flex h-full flex-col gap-0 rounded-none border-0 bg-transparent p-0 shadow-none"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-light)]">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.altText ?? product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={index < 3}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-subtle)]">
                        No image
                      </div>
                    )}
                    {tag && (
                      <Badge
                        variant="outline"
                        className="absolute left-3 top-3 border-[var(--color-border)] bg-white/90 text-[var(--color-text-muted)] backdrop-blur-sm"
                      >
                        {tag}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col pt-5">
                    <h3
                      className="text-xl font-medium leading-snug text-[var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-eb-garamond)" }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-subtle)]">
                        {product.description}
                      </p>
                    )}

                    {/* mt-auto keeps the divider + price/CTA aligned at the
                        bottom across the row, no matter the description length. */}
                    <div className="mt-auto">
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <span className="text-base tracking-wide text-[var(--color-text-primary)]">
                          {formatPriceRange(product.priceRange)}
                        </span>
                        <AddToCartButton
                          product={product}
                          className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
                          label="Add to Cart"
                        />
                      </div>
                    </div>
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
