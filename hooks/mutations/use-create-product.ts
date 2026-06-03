"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiProduct } from "@/types/interfaces";

async function createProduct(data: Partial<ApiProduct>): Promise<ApiProduct> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }

  const result = await response.json();
  return result.product;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<ApiProduct, Error, Partial<ApiProduct>>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("[use-create-product] Error:", error.message);
    },
  });
}
