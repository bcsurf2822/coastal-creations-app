"use client";

// Variant I — "Art Boxes Catalog": products grouped into labelled category
// sections (à la Jessie's Art Boxes & Kits), with sand-tone section accents
// and generous boxed cards. Built on shadcn/ui primitives.

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type {
  StoreProductAvailability,
  StoreProductSummary,
} from "@/lib/types/storeTypes";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { Skeleton } from "@/components/ui/shadcn/skeleton";

const ALL = "All Products";
const UNCATEGORIZED = "More from the Studio";
const availabilityTag: Record<StoreProductAvailability, string | null> = {
  available: null,
  low_stock: "Low stock",
  sold_out: "Sold out",
};

export default function VariantI(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return [ALL, ...Array.from(set).sort()];
  }, [products]);

  // Group the (filtered) products into ordered category buckets.
  const sections = useMemo(() => {
    const visible = (products ?? []).filter(
      (p) => activeCategory === ALL || p.categoryName === activeCategory
    );
    const map = new Map<string, StoreProductSummary[]>();
    visible.forEach((p) => {
      const key = p.categoryName || UNCATEGORIZED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products, activeCategory]);

  return (
    <section className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Category filter pills */}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading &&
          !isError &&
          sections.map(([category, items]) => (
            <div key={category} className="mb-14">
              {/* Section header with sand accent bar */}
              <div className="mb-6 flex items-end gap-4">
                <div>
                  <div
                    className="mb-2 h-1.5 w-12 rounded-full"
                    style={{ background: "var(--gradient-footer)" }}
                  />
                  <h2
                    className="text-2xl font-bold leading-none"
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-eb-garamond)",
                    }}
                  >
                    {category}
                  </h2>
                </div>
                <span className="mb-1 text-sm text-[var(--color-text-subtle)]">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
                <Separator className="mb-2 flex-1" />
              </div>

              {/* Boxed cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => {
                  const tag = availabilityTag[product.availability];
                  return (
                    <Card
                      key={product.squareItemId}
                      className="group flex h-full flex-col gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/3] w-full bg-[var(--color-light)]">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage.url}
                            alt={product.primaryImage.altText ?? product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
                            className="absolute right-3 top-3 shadow-sm"
                          >
                            {tag}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="flex flex-1 flex-col p-5">
                        <h3
                          className="text-lg font-semibold leading-tight"
                          style={{
                            color: "var(--color-primary)",
                            fontFamily: "var(--font-eb-garamond)",
                          }}
                        >
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1.5 text-sm text-[var(--color-text-subtle)]">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <span className="text-xl font-bold text-black">
                            {formatPriceRange(product.priceRange)}
                          </span>
                          <AddToCartButton
                            product={product}
                            className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--gradient-button)" }}
                            showCartIcon
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
