"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaStar } from "react-icons/fa";
import { AddToCartButton } from "../AddToCartButton";
import { StockCounter } from "../StockCounter";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantC(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

  return (
    <section
      className="min-h-screen py-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #073a58 0%, #0c4a6e 45%, #0369a1 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "var(--color-accent)",
            filter: "blur(100px)",
            transform: "translate(-30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full opacity-10"
          style={{ background: "#bae6fd", filter: "blur(120px)", transform: "translate(20%, 20%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section intro */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-300 mb-3">
            Coastal Creations Studio
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-eb-garamond)" }}
          >
            Take the Studio Home
          </h2>
          <p className="text-sky-200 max-w-md mx-auto text-sm leading-relaxed">
            Art kits, supplies, and studio merch — everything you need to keep
            creating between classes.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
              style={
                activeCategory === cat
                  ? {
                      background: "var(--color-accent)",
                      color: "white",
                      borderColor: "transparent",
                      boxShadow: "0 4px 15px rgba(251,146,60,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.75)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.28, delay: i * 0.05 }}
                className="group relative rounded-2xl overflow-hidden border border-white/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Tag badge */}
                {product.tag && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-400 text-white shadow-sm">
                      {product.tag === "Bestseller" && (
                        <FaStar className="text-[10px]" />
                      )}
                      {product.tag}
                    </span>
                  </div>
                )}

                {/* Image placeholder */}
                <div
                  className="aspect-square flex items-center justify-center text-7xl"
                  style={{
                    background: `linear-gradient(135deg, ${product.accentColor}28, ${product.accentColor}55)`,
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                    {product.icon}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="text-lg font-semibold text-white leading-tight line-clamp-2 mb-1.5"
                    style={{ fontFamily: "var(--font-eb-garamond)" }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-sky-200 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-400">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-sky-300/70 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <StockCounter productId={product.id} stockCount={product.stockCount} prefix="" />
                  </div>

                  <AddToCartButton
                    product={product}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #fb923c, #f97316)", boxShadow: "0 4px 12px rgba(251,146,60,0.3)" }}
                    showCartIcon
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
