"use client";

import { useQuery } from "@tanstack/react-query";
import type { StoreProduct, StoreProductSummary } from "@/lib/types/storeTypes";

interface ProductsResponse {
  success: boolean;
  products: StoreProductSummary[];
}

interface ProductResponse {
  success: boolean;
  product: StoreProduct;
}

async function fetchProducts(): Promise<StoreProductSummary[]> {
  const response = await fetch("/api/store/products");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: ProductsResponse = await response.json();

  if (!result.success && !result.products) {
    throw new Error("API returned unsuccessful response");
  }

  return result.products ?? [];
}

async function fetchProduct(squareItemId: string): Promise<StoreProduct> {
  const response = await fetch(`/api/store/products/${squareItemId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const result: ProductResponse = await response.json();
  return result.product;
}

export function useProducts() {
  return useQuery<StoreProductSummary[], Error>({
    queryKey: ["store-products"],
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProduct(squareItemId: string) {
  return useQuery<StoreProduct, Error>({
    queryKey: ["store-product", squareItemId],
    queryFn: () => fetchProduct(squareItemId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!squareItemId,
  });
}
