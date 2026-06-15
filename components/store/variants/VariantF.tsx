"use client";

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
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

export default function VariantF(): ReactElement {
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

  // The first available product (falling back to the first overall) is featured.
  const spotlight =
    filtered.find((p) => p.availability === "available") ?? filtered[0];
  const rest = filtered.filter((p) => p.squareItemId !== spotlight?.squareItemId);

  return (
    <section className="min-h-screen py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
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
                      boxShadow: "0 3px 10px rgba(12,74,110,0.25)",
                    }
                  : {
                      background: "white",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {isError && (
          <p className="text-center text-[var(--color-error)] text-lg py-16">
            Unable to load products. Please try again later.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Spotlight card */}
            {spotlight && (
              <motion.div
                key={`spotlight-${spotlight.squareItemId}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row rounded-3xl overflow-hidden mb-8 border border-sky-100"
                style={{ boxShadow: "0 8px 32px rgba(12,74,110,0.10)" }}
              >
                {/* Big real image */}
                <div
                  className="relative md:w-2/5 bg-[var(--color-light)]"
                  style={{ minHeight: 260 }}
                >
                  {spotlight.primaryImage ? (
                    <Image
                      src={spotlight.primaryImage.url}
                      alt={spotlight.primaryImage.altText ?? spotlight.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-subtle)]">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-8 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      <FaStar className="text-[10px]" />
                      Featured
                    </span>
                    {availabilityTag[spotlight.availability] && (
                      <span
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                          background: "var(--color-light)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {availabilityTag[spotlight.availability]}
                      </span>
                    )}
                  </div>

                  <h2
                    className="text-3xl font-bold leading-tight mb-3"
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-eb-garamond)",
                    }}
                  >
                    {spotlight.name}
                  </h2>
                  {spotlight.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-md line-clamp-3">
                      {spotlight.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-black">
                      {formatPriceRange(spotlight.priceRange)}
                    </span>
                  </div>

                  <AddToCartButton
                    product={spotlight}
                    className="mt-5 self-start px-7 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "var(--gradient-button)", boxShadow: "0 4px 14px rgba(12,74,110,0.2)" }}
                    showCartIcon
                  />
                </div>
              </motion.div>
            )}

            {/* Rest of grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                  {rest.map((product, i) => {
                    const tag = availabilityTag[product.availability];
                    return (
                      <motion.div
                        key={product.squareItemId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15, delay: 0 } }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:-translate-y-1 transition-all duration-200 flex flex-col"
                        style={{ boxShadow: "0 2px 12px rgba(12,74,110,0.06)" }}
                      >
                        <div className="relative aspect-square bg-[var(--color-light)]">
                          {product.primaryImage ? (
                            <Image
                              src={product.primaryImage.url}
                              alt={product.primaryImage.altText ?? product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-[var(--color-text-subtle)]">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <span
                            className={`inline-block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1${!tag ? " invisible" : ""}`}
                          >
                            {tag ?? " "}
                          </span>
                          <h3
                            className="font-semibold text-sm leading-snug line-clamp-2 mb-1"
                            style={{ color: "var(--color-primary)", fontFamily: "var(--font-eb-garamond)" }}
                          >
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between mb-3">
                            <span className="font-bold text-base text-black">
                              {formatPriceRange(product.priceRange)}
                            </span>
                          </div>

                          <AddToCartButton
                            product={product}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--gradient-button)" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
