"use client";

import { useQuery } from "@tanstack/react-query";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl?: string;
}

async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const response = await fetch("/api/payment-config");

  if (!response.ok) {
    throw new Error("Failed to fetch payment configuration");
  }

  const result = await response.json();
  return result;
}

/**
 * Hook to fetch Square payment configuration
 * This data rarely changes, so we cache it for a long time
 */
export function usePaymentConfig(enabled: boolean = true) {
  return useQuery<PaymentConfig, Error>({
    queryKey: ["payment-config"],
    queryFn: fetchPaymentConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes - config rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled,
  });
}
