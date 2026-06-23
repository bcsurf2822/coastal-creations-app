"use client";

import type { ReactElement } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";
import type { StoreProductAvailability } from "@/lib/types/storeTypes";

const availabilityStyle: Record<
  StoreProductAvailability,
  { background: string; color: string } | null
> = {
  available: null,
  low_stock: { background: "#fef9c3", color: "#854d0e" },
  sold_out: { background: "#fee2e2", color: "#991b1b" },
};

export default function VariantG(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <section className="min-h-screen py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-[var(--color-error)] text-lg py-16">
            Unable to load products. Please try again later.
          </p>
        )}

        {/* Product grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => {
                const tagStyle = availabilityStyle[product.availability];
                return (
                  <motion.div
                    key={product.squareItemId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15, delay: 0 } }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="group bg-white rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
                    style={{ boxShadow: "0 4px 16px rgba(12,74,110,0.08)" }}
                  >
                    {/* Real image with description overlay on hover */}
                    <div className="relative aspect-square overflow-hidden bg-[var(--color-light)]">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage.url}
                          alt={product.primaryImage.altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          priority={i < 4}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-subtle)]">
                          No image
                        </div>
                      )}

                      {/* Description slides up over image on hover */}
                      {product.description && (
                        <div
                          className="absolute inset-0 flex flex-col justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(12,74,110,0.95) 0%, rgba(12,74,110,0.7) 65%, transparent 100%)",
                          }}
                        >
                          <p className="px-4 pb-5 text-white text-xs leading-relaxed line-clamp-4">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card footer — always visible, tags aligned */}
                    <div className="p-4 flex flex-col flex-1">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2${
                          !product.availabilityLabel ? " invisible" : ""
                        }`}
                        style={tagStyle ?? {}}
                      >
                        {product.availabilityLabel ?? " "}
                      </span>

                      <h3
                        className="font-semibold text-base leading-tight line-clamp-2"
                        style={{
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-eb-garamond)",
                        }}
                      >
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-black">
                          {formatPriceRange(product.priceRange)}
                        </span>
                      </div>

                      <AddToCartButton
                        product={product}
                        className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--gradient-button)" }}
                        showCartIcon
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
