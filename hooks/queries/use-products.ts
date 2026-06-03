"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiProduct } from "@/types/interfaces";

interface ProductsResponse {
  success: boolean;
  products: ApiProduct[];
}

async function fetchProducts(): Promise<ApiProduct[]> {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: ProductsResponse = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.products || [];
}

export function useProducts() {
  return useQuery<ApiProduct[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
