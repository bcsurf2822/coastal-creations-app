"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantF(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

  const spotlight = filtered.find((p) => p.tag === "Bestseller") ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== spotlight?.id);

  return (
    <section
      className="min-h-screen py-12"
      style={{ background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 40%)" }}
    >
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
                      background: "var(--color-accent)",
                      color: "white",
                      boxShadow: "0 3px 10px rgba(251,146,60,0.35)",
                    }
                  : {
                      background: "white",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Spotlight card */}
        {spotlight && (
          <motion.div
            key={`spotlight-${spotlight.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row rounded-3xl overflow-hidden mb-8 border border-sky-100"
            style={{ boxShadow: "0 8px 32px rgba(12,74,110,0.10)" }}
          >
            {/* Big image */}
            <div
              className="md:w-2/5 flex items-center justify-center text-8xl"
              style={{
                minHeight: 260,
                background: `linear-gradient(135deg, ${spotlight.accentColor}88, ${spotlight.accentColor}ee)`,
              }}
            >
              {spotlight.icon}
            </div>

            {/* Info */}
            <div
              className="flex-1 p-8 flex flex-col justify-center bg-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: "var(--color-accent)" }}
                >
                  <FaStar className="text-[10px]" />
                  Featured
                </span>
                {spotlight.tag && spotlight.tag !== "Bestseller" && (
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      background: "var(--color-light)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {spotlight.tag}
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
              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-md">
                {spotlight.description}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    ${spotlight.price}
                  </span>
                  {spotlight.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ${spotlight.originalPrice}
                    </span>
                  )}
                </div>
                {spotlight.stockCount <= 5 && (
                  <span className="text-xs text-orange-500">
                    Only {spotlight.stockCount} left
                  </span>
                )}
              </div>

              <button
                className="mt-5 self-start flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "var(--gradient-button)",
                  boxShadow: "0 4px 14px rgba(12,74,110,0.2)",
                }}
              >
                <FaShoppingCart className="text-xs" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        )}

        {/* Rest of grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {rest.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:-translate-y-1 transition-all duration-200"
                style={{ boxShadow: "0 2px 12px rgba(12,74,110,0.06)" }}
              >
                <div
                  className="aspect-square flex items-center justify-center text-5xl"
                  style={{
                    background: `linear-gradient(135deg, ${product.accentColor}44, ${product.accentColor}99)`,
                  }}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {product.icon}
                  </span>
                </div>

                <div className="p-4">
                  {product.tag && (
                    <span className="inline-block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      {product.tag}
                    </span>
                  )}
                  <h3
                    className="font-semibold text-sm leading-snug mb-1"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-eb-garamond)" }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-bold text-base"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${product.price}
                    </span>
                    {product.stockCount <= 5 && (
                      <span className="text-xs text-orange-500">
                        {product.stockCount} left
                      </span>
                    )}
                  </div>

                  <button
                    className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--gradient-button)" }}
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
