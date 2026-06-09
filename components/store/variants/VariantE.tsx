"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaShoppingCart } from "react-icons/fa";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantE(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

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
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-gray-400 mb-5">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Horizontal list */}
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col divide-y divide-gray-100">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="group flex items-center gap-5 py-5 hover:bg-gray-50 px-3 rounded-xl transition-colors duration-150"
              >
                {/* Square thumbnail */}
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${product.accentColor}66, ${product.accentColor}cc)`,
                  }}
                >
                  {product.icon}
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
                    {product.tag && (
                      <span
                        className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--color-light)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  {product.stockCount <= 5 && (
                    <p className="text-xs text-orange-500 mt-0.5">
                      Only {product.stockCount} left
                    </p>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <span
                      className="text-lg font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="block text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "var(--gradient-button)" }}
                  >
                    <FaShoppingCart className="text-[10px]" />
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </section>
  );
}
