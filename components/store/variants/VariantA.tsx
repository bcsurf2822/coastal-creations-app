"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { AddToCartButton } from "../AddToCartButton";
import { StockCounter } from "../StockCounter";
import {
  MOCK_PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "../mockProducts";

export default function VariantA(): ReactElement {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar filters — mirrors Jessie's Art Shed layout */}
        <aside className="md:w-48 flex-shrink-0">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Filters
          </h3>
          {/* Mobile: horizontal scroll row */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          {/* Desktop: stacked list */}
          <ul className="hidden md:block space-y-0.5">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <main className="flex-1">
          <p className="text-sm text-gray-400 mb-5">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                {/* Image placeholder */}
                <div
                  className="aspect-square flex items-center justify-center text-5xl"
                  style={{ background: product.accentColor }}
                >
                  {product.icon}
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <p className={`text-xs font-medium uppercase tracking-wide text-gray-400 mb-0.5${!product.tag ? " invisible" : ""}`}>
                    {product.tag ?? " "}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ${product.price}
                      {product.originalPrice && (
                        <span className="ml-1.5 text-xs font-normal text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </span>
                    <StockCounter productId={product.id} stockCount={product.stockCount} />
                  </div>

                  <AddToCartButton product={product} className="mt-2.5 w-full py-1.5 text-xs border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-colors duration-150" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
