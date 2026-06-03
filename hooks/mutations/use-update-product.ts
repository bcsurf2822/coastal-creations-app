"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiProduct } from "@/types/interfaces";

interface UpdateProductArgs {
  id: string;
  data: Partial<ApiProduct>;
}

async function updateProduct({ id, data }: UpdateProductArgs): Promise<ApiProduct> {
  const response = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  const result = await response.json();
  return result.product;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<ApiProduct, Error, UpdateProductArgs>({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("[use-update-product] Error:", error.message);
    },
  });
}
