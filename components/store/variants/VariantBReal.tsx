"use client";

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";

// Real-data version of VariantB ("Coastal"). Same design as the mock variant, but bound
// to live Square catalog data via useProducts() and rendering real product images.
const availabilityTag: Record<
  StoreProductAvailability,
  { label: string; style: { background: string; color: string } } | null
> = {
  available: null,
  low_stock: { label: "Low stock", style: { background: "#fef9c3", color: "#854d0e" } },
  sold_out: { label: "Sold out", style: { background: "#fee2e2", color: "#991b1b" } },
};

export default function VariantBReal(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>("All Products");

  // Categories are derived from the live data (Square category names), not the mock enum.
  const categories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return ["All Products", ...Array.from(set).sort()];
  }, [products]);

  const filtered = (products ?? []).filter(
    (p) => activeCategory === "All Products" || p.categoryName === activeCategory
  );

  return (
    <section className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeCategory === cat
                  ? {
                      background: "var(--color-primary)",
                      color: "white",
                      boxShadow: "0 4px 10px rgba(12,74,110,0.25)",
                    }
                  : {
                      background: "white",
                      color: "var(--color-text-muted)",
                      border: "1px solid var(--color-border-light)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-[var(--color-error)] text-lg py-16">
            Unable to load products. Please try again later.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => {
              const tag = availabilityTag[product.availability];
              return (
                <motion.div
                  key={product.squareItemId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-200"
                  style={{ boxShadow: "0 4px 16px rgba(12,74,110,0.08)" }}
                >
                  {/* Real product image */}
                  <div className="relative aspect-square bg-[var(--color-light)]">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.altText ?? product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-subtle)]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {tag && (
                      <span
                        className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2"
                        style={tag.style}
                      >
                        {tag.label}
                      </span>
                    )}

                    <h3
                      className="font-semibold text-base leading-tight"
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-eb-garamond)",
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.categoryName && (
                      <p
                        className="text-xs mt-1 uppercase tracking-wide"
                        style={{ color: "var(--color-secondary)" }}
                      >
                        {product.categoryName}
                      </p>
                    )}

                    <div className="mt-3 flex items-end justify-between">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {formatPriceRange(product.priceRange)}
                      </span>
                    </div>

                    <button
                      className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ background: "var(--gradient-button)" }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
