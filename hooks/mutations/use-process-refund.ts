"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProcessRefundParams {
  customerId: string;
  refundAmount: number;
  reason?: string;
}

interface RefundResponse {
  success: boolean;
  data?: {
    refundId: string;
    status: string;
    amount: number;
  };
  error?: string;
}

async function processRefund(params: ProcessRefundParams): Promise<RefundResponse> {
  const response = await fetch("/api/refunds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process refund");
  }

  const result: RefundResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to process refund");
  }

  return result;
}

/**
 * Mutation hook to process a refund
 * Invalidates customers list on success
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation<RefundResponse, Error, ProcessRefundParams>({
    mutationFn: processRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      console.error("[use-process-refund] Error:", error.message);
    },
  });
}
