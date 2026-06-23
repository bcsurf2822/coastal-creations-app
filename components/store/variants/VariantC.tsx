"use client";

import type { ReactElement } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";

export default function VariantC(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <section className="min-h-screen py-16 relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section intro */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--color-secondary)" }}
          >
            Coastal Creations Studio
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-eb-garamond)",
            }}
          >
            Take the Studio Home
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
            Art kits, supplies, and studio merch — everything you need to keep
            creating between classes.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => {
                const tag = product.availabilityLabel;
                return (
                  <motion.div
                    key={product.squareItemId}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, delay: i * 0.05 }}
                    className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    style={{ boxShadow: "0 4px 16px rgba(12,74,110,0.08)" }}
                  >
                    {/* Availability badge */}
                    {tag && (
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                          style={{ background: "var(--color-primary)" }}
                        >
                          {tag}
                        </span>
                      </div>
                    )}

                    {/* Real product image */}
                    <div className="relative aspect-square bg-[var(--color-light)]">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage.url}
                          alt={product.primaryImage.altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          priority={i < 4}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-subtle)]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3
                        className="text-lg font-semibold leading-tight line-clamp-2 mb-1.5"
                        style={{
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-eb-garamond)",
                        }}
                      >
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-4">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-black">
                          {formatPriceRange(product.priceRange)}
                        </span>
                      </div>

                      <AddToCartButton
                        product={product}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors active:scale-95"
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
