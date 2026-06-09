"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantB(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

  const tagStyles: Record<string, { background: string; color: string }> = {
    Sale: { background: "#fef9c3", color: "#854d0e" },
    New: { background: "#dcfce7", color: "#166534" },
    Limited: { background: "#fee2e2", color: "#991b1b" },
    Bestseller: { background: "#dbeafe", color: "#1e40af" },
  };

  return (
    <section
      className="min-h-screen py-12"
      style={{
        background:
          "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 55%, #f0f9ff 100%)",
      }}
    >
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
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-200"
              style={{ boxShadow: "0 4px 16px rgba(12,74,110,0.08)" }}
            >
              {/* Image placeholder */}
              <div
                className="aspect-square flex items-center justify-center text-6xl"
                style={{
                  background: `linear-gradient(135deg, ${product.accentColor} 0%, white 100%)`,
                }}
              >
                {product.icon}
              </div>

              <div className="p-4">
                {product.tag && (
                  <span
                    className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2"
                    style={tagStyles[product.tag]}
                  >
                    {product.tag}
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
                <p
                  className="text-xs mt-1 line-clamp-2 leading-relaxed"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  {product.description}
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <span
                      className="text-xl font-bold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span
                        className="ml-1.5 text-xs line-through"
                        style={{ color: "var(--color-text-subtle)" }}
                      >
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.stockCount <= 5 && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-warning)" }}
                    >
                      {product.stockCount} left
                    </span>
                  )}
                </div>

                <button
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-button)" }}
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
