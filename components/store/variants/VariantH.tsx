"use client";

// Variant H — "Gallery Wall": framed, matted art prints in a uniform grid with
// centered captions. Equal-height cards so the price + Add to Cart row bottom-
// aligns across every row. Built on shadcn/ui primitives.

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Skeleton } from "@/components/ui/shadcn/skeleton";

const ALL = "All Products";
const availabilityTag: Record<StoreProductAvailability, string | null> = {
  available: null,
  low_stock: "Low stock",
  sold_out: "Sold out",
};

export default function VariantH(): ReactElement {
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
        <div className="mb-10 flex flex-wrap justify-center gap-2">
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
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-2 items-stretch gap-5 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const tag = availabilityTag[product.availability];
              return (
                <Card
                  key={product.squareItemId}
                  className="group flex h-full flex-col gap-0 bg-white p-3 shadow-[0_2px_12px_rgba(12,74,110,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(12,74,110,0.14)]"
                >
                  {/* Matted, framed print */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-light)] ring-1 ring-[var(--color-border-light)]">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.altText ?? product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-subtle)]">
                        No image
                      </div>
                    )}
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

                  {/* Centered gallery caption */}
                  <CardContent className="flex flex-1 flex-col px-1 pt-4 text-center">
                    <h3
                      className="text-sm font-semibold leading-snug"
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-eb-garamond)",
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                        {product.description}
                      </p>
                    )}

                    {/* mt-auto pins the price + button to the card bottom, so
                        they bottom-align across the whole row (items-stretch
                        makes the row's cards equal height). */}
                    <div className="mt-auto pt-3">
                      <span className="block text-base font-bold text-black">
                        {formatPriceRange(product.priceRange)}
                      </span>
                      <AddToCartButton
                        product={product}
                        className="mt-2.5 w-full rounded-xl py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--gradient-button)" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
