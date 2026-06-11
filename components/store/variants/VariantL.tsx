"use client";

// Variant L — "Boutique Minimal": whitespace-forward, borderless, editorial.
// Serif product names, thin dividers, understated CTAs. Upscale gallery-shop
// feel. Built on shadcn/ui primitives.

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";
import { Card } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { Skeleton } from "@/components/ui/shadcn/skeleton";

const ALL = "All Products";
const availabilityTag: Record<StoreProductAvailability, string | null> = {
  available: null,
  low_stock: "Low stock",
  sold_out: "Sold out",
};

export default function VariantL(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return [ALL, ...Array.from(set).sort()];
  }, [products]);

  const filtered = (products ?? []).filter(
    (p) => activeCategory === ALL || p.categoryName === activeCategory
  );

  return (
    <section className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Minimal text-link filters */}
        <div className="mb-14 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="link"
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={`h-auto p-0 text-sm tracking-wide no-underline ${
                activeCategory === cat
                  ? "font-semibold text-[var(--color-primary)] underline underline-offset-8"
                  : "font-normal text-[var(--color-text-subtle)]"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

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
              const tag = availabilityTag[product.availability];
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
    </section>
  );
}
