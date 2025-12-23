"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ICustomer } from "@/types/interfaces";

interface CreateCustomerResponse {
  success: boolean;
  data: ICustomer;
  error?: string;
}

async function createCustomer(customerData: Partial<ICustomer>): Promise<ICustomer> {
  const response = await fetch("/api/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create customer booking");
  }

  const result: CreateCustomerResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create customer booking");
  }

  return result.data;
}

/**
 * Mutation hook to create a new customer booking
 * Invalidates customers and events lists on success
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<ICustomer, Error, Partial<ICustomer>>({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("[use-create-customer] Error:", error.message);
    },
  });
}
