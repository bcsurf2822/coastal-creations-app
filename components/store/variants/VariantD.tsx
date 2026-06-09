"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantD(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

  return (
    <section className="min-h-screen py-12" style={{ background: "#fdf6ed" }}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Category tab strip */}
        <div className="flex gap-0 border-b border-amber-200 mb-10 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="whitespace-nowrap px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
              style={
                activeCategory === cat
                  ? {
                      borderBottomColor: "#b45309",
                      color: "#b45309",
                    }
                  : {
                      borderBottomColor: "transparent",
                      color: "#78716c",
                    }
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Product grid — tall cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="group rounded-2xl overflow-hidden bg-white border border-amber-100 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Tall image area */}
              <div
                className="w-full flex items-center justify-center text-6xl"
                style={{
                  aspectRatio: "3/4",
                  background: `linear-gradient(160deg, ${product.accentColor}55, ${product.accentColor}cc)`,
                }}
              >
                <span className="group-hover:scale-110 transition-transform duration-300 drop-shadow">
                  {product.icon}
                </span>
              </div>

              <div className="p-4">
                {product.tag && (
                  <span
                    className="inline-block text-xs font-semibold tracking-wide uppercase px-2 py-0.5 rounded mb-2"
                    style={{ background: "#fef3c7", color: "#92400e" }}
                  >
                    {product.tag}
                  </span>
                )}

                <h3
                  className="font-semibold text-base leading-snug mb-1"
                  style={{
                    color: "#1c1917",
                    fontFamily: "var(--font-eb-garamond)",
                  }}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-amber-700">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-stone-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.stockCount <= 5 && (
                    <span className="text-xs text-orange-600">
                      {product.stockCount} left
                    </span>
                  )}
                </div>

                <button
                  className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
