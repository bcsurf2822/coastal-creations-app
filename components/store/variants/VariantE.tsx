"use client";

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";

const ALL = "All Products";
const availabilityTag: Record<StoreProductAvailability, string | null> = {
  available: null,
  low_stock: "Low stock",
  sold_out: "Sold out",
};

export default function VariantE(): ReactElement {
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
    <section className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Category pill strip */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
              style={
                activeCategory === cat
                  ? {
                      background: "var(--color-primary)",
                      color: "white",
                      borderColor: "var(--color-primary)",
                    }
                  : {
                      background: "white",
                      color: "#6b7280",
                      borderColor: "#e5e7eb",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {isError && (
          <p className="text-sm text-[var(--color-error)] py-10">
            Unable to load products. Please try again later.
          </p>
        )}

        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Count */}
            <p className="text-sm text-gray-500 mb-5">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Horizontal list */}
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col divide-y divide-gray-100">
                {filtered.map((product, i) => {
                  const tag = availabilityTag[product.availability];
                  return (
                    <motion.div
                      key={product.squareItemId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="group flex items-center gap-5 py-5 hover:bg-gray-50 px-3 rounded-xl transition-colors duration-150"
                    >
                      {/* Square real thumbnail */}
                      <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage.url}
                            alt={product.primaryImage.altText ?? product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3
                            className="font-semibold text-base text-gray-900 truncate"
                            style={{ fontFamily: "var(--font-eb-garamond)" }}
                          >
                            {product.name}
                          </h3>
                          {tag && (
                            <span
                              className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{
                                background: "var(--color-light)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {tag}
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="text-right">
                          <span className="text-lg font-bold text-black">
                            {formatPriceRange(product.priceRange)}
                          </span>
                        </div>
                        <AddToCartButton
                          product={product}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{ background: "var(--gradient-button)" }}
                          showCartIcon
                          iconClassName="text-[10px]"
                          label="Add"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
