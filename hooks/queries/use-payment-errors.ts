"use client";

import { useQuery } from "@tanstack/react-query";

interface PaymentErrorDetail {
  code: string;
  detail: string;
  category: string;
}

export interface PaymentErrorLog {
  _id: string;
  eventId: string;
  eventTitle: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  paymentAmount: number;
  sourceId: string;
  paymentErrors: PaymentErrorDetail[];
  rawErrorResponse: {
    stack: string;
    message: string;
    request: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    };
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
    result?: Record<string, unknown>;
  };
  errors: PaymentErrorDetail[];
  attemptedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaymentErrorsResponse {
  success: boolean;
  paymentErrors: PaymentErrorLog[];
  count: number;
}

interface UsePaymentErrorsOptions {
  limit?: number;
  eventId?: string;
  customerEmail?: string;
  all?: boolean;
  enabled?: boolean;
}

async function fetchPaymentErrors(options: UsePaymentErrorsOptions): Promise<PaymentErrorLog[]> {
  const params = new URLSearchParams();

  if (options.all) params.append("all", "true");
  if (options.limit) params.append("limit", String(options.limit));
  if (options.eventId) params.append("eventId", options.eventId);
  if (options.customerEmail) params.append("customerEmail", options.customerEmail);

  const url = params.toString() ? `/api/payment-errors?${params}` : "/api/payment-errors";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch payment errors");
  }

  const result: PaymentErrorsResponse = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.paymentErrors || [];
}

/**
 * Hook to fetch payment error logs with optional filtering
 */
export function usePaymentErrors(options: UsePaymentErrorsOptions = {}) {
  const { limit, eventId, customerEmail, all, enabled = true } = options;

  return useQuery<PaymentErrorLog[], Error>({
    queryKey: ["paymentErrors", { limit, eventId, customerEmail, all }],
    queryFn: () => fetchPaymentErrors({ limit, eventId, customerEmail, all }),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
}
