"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletePaymentErrorResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function deletePaymentError(id: string): Promise<void> {
  const response = await fetch(`/api/payment-errors?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete payment error");
  }

  const result: DeletePaymentErrorResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete payment error");
  }
}

/**
 * Mutation hook to delete a payment error log
 * Invalidates the paymentErrors query on success
 */
export function useDeletePaymentError() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePaymentError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentErrors"] });
    },
    onError: (error) => {
      console.error("[use-delete-payment-error] Error:", error.message);
    },
  });
}
