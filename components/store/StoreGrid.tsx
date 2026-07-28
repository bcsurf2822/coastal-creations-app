"use client";

import type { ReactElement } from "react";
import { useProducts } from "@/hooks/queries/use-products";
import ProductCard from "./ProductCard";

export default function StoreGrid(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-[var(--color-light)] rounded-[var(--radius-lg)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-error)] text-lg">
          Unable to load products. Please try again later.
        </p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-text-subtle)] text-lg">
          No products available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.squareItemId} product={product} />
        ))}
      </div>
    </section>
  );
}
