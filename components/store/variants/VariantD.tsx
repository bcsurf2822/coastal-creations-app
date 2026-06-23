"use client";

import type { ReactElement } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";

export default function VariantD(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <section className="min-h-screen py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {isError && (
          <p className="text-center text-[var(--color-error)] text-lg py-16">
            Unable to load products. Please try again later.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 animate-pulse"
                style={{ aspectRatio: "3/4" }}
              />
            ))}
          </div>
        )}

        {/* Product grid — tall cards */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => {
                const tag = product.availabilityLabel;
                return (
                  <motion.div
                    key={product.squareItemId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15, delay: 0 } }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                  >
                    {/* Tall real image area */}
                    <div
                      className="relative w-full bg-[var(--color-light)]"
                      style={{ aspectRatio: "3/4" }}
                    >
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage.url}
                          alt={product.primaryImage.altText ?? product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          priority={i < 4}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-[var(--color-text-subtle)]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <span
                        className={`inline-block text-xs font-semibold tracking-wide uppercase px-2 py-0.5 rounded mb-2${!tag ? " invisible" : ""}`}
                        style={tag ? { background: "var(--color-light)", color: "var(--color-primary)" } : {}}
                      >
                        {tag ?? " "}
                      </span>

                      <h3
                        className="font-semibold text-base leading-snug line-clamp-2 mb-1"
                        style={{
                          color: "#1c1917",
                          fontFamily: "var(--font-eb-garamond)",
                        }}
                      >
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-black">
                          {formatPriceRange(product.priceRange)}
                        </span>
                      </div>

                      <AddToCartButton
                        product={product}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors active:scale-95"
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
