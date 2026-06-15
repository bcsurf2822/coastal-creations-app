"use client";

import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
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

export default function VariantA(): ReactElement {
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
                {cat}
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
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <main className="flex-1">
          {isError && (
            <p className="text-sm text-[var(--color-error)] py-10">
              Unable to load products. Please try again later.
            </p>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <p className="text-sm text-gray-500 mb-5">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product, index) => {
                  const tag = availabilityTag[product.availability];
                  return (
                    <div
                      key={product.squareItemId}
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
                    >
                      {/* Real product image */}
                      <div className="relative aspect-square bg-gray-50">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage.url}
                            alt={product.primaryImage.altText ?? product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            priority={index < 4}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex flex-col flex-1">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5${
                            !tag ? " invisible" : ""
                          }`}
                        >
                          {tag ?? " "}
                        </p>
                        <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-black">
                            {formatPriceRange(product.priceRange)}
                          </span>
                        </div>

                        <AddToCartButton
                          product={product}
                          className="mt-2.5 w-full py-1.5 text-xs border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-colors duration-150"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
