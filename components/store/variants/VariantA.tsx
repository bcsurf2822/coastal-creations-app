"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { AddToCartButton } from "../AddToCartButton";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPriceRange } from "@/lib/utils/catalogHelpers";

export default function VariantA(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  const filtered = products ?? [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[2rem] border border-white/65 bg-white/85 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">
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
                  const tag = product.availabilityLabel;
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
    </div>
  );
}
