"use client";

// Variant K — "Studio Snapshot": clean, upright polaroid-style cards — a white
// frame with a thicker bottom border, centered italic serif caption, and a tidy
// price tag. Warm and playful but perfectly straight. Equal-height cards so the
// Add to Cart row bottom-aligns across each row. Built on shadcn/ui primitives.

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
import { Skeleton } from "@/components/ui/shadcn/skeleton";

const ALL = "All Products";
const availabilityTag: Record<StoreProductAvailability, string | null> = {
  available: null,
  low_stock: "Low stock",
  sold_out: "Sold out",
};

export default function VariantK(): ReactElement {
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
    <section className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Filter pills */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveCategory(cat)}
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-md" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product, index) => {
              const tag = availabilityTag[product.availability];
              return (
                <Card
                  key={product.squareItemId}
                  className="group flex h-full flex-col gap-0 rounded-md border-0 bg-white p-3 pb-5 shadow-[0_6px_20px_rgba(12,74,110,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(12,74,110,0.18)]"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-light)]">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.altText ?? product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        priority={index < 4}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-subtle)]">
                        No image
                      </div>
                    )}
                    {/* Tidy price tag, top-right */}
                    <span
                      className="absolute right-2 top-2 rounded-md px-2.5 py-1 text-sm font-bold text-white shadow-[0_4px_15px_rgba(50,108,133,0.3)]"
                      style={{ background: "var(--gradient-button)" }}
                    >
                      {formatPriceRange(product.priceRange)}
                    </span>
                    {tag && (
                      <Badge
                        variant={
                          product.availability === "sold_out"
                            ? "destructive"
                            : "secondary"
                        }
                        className="absolute left-2 top-2 shadow-sm"
                      >
                        {tag}
                      </Badge>
                    )}
                  </div>

                  {/* Polaroid caption */}
                  <div className="flex flex-1 flex-col px-1 pt-4 text-center">
                    <h3
                      className="text-lg font-semibold italic leading-tight"
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-eb-garamond)",
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.categoryName && (
                      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
                        {product.categoryName}
                      </p>
                    )}
                    {product.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-subtle)]">
                        {product.description}
                      </p>
                    )}
                    <AddToCartButton
                      product={product}
                      className="mt-auto w-full rounded-full border-2 border-[var(--color-primary)] bg-transparent py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
                    />
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
