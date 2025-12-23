"use client";

import { useQuery } from "@tanstack/react-query";
import type { ICustomer } from "@/types/interfaces";

interface CustomersResponse {
  success: boolean;
  data: ICustomer[];
}

type EventType = "Event" | "PrivateEvent" | "Reservation";

interface UseCustomersOptions {
  eventId?: string;
  eventType?: EventType;
  enabled?: boolean;
}

async function fetchCustomers(options: UseCustomersOptions): Promise<ICustomer[]> {
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append("eventId", options.eventId);
  }
  if (options.eventType) {
    params.append("eventType", options.eventType);
  }

  const url = params.toString() ? `/api/customer?${params}` : "/api/customer";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  const result: CustomersResponse = await response.json();

  if (!result.success && !result.data) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data || [];
}

/**
 * Hook to fetch customers with optional filtering
 * @param options - Optional configuration { eventId, eventType, enabled }
 */
export function useCustomers(options: UseCustomersOptions = {}) {
  const { eventId, eventType, enabled = true } = options;

  // Build query key based on filters
  const queryKey = eventId
    ? ["customers", { eventId, eventType }]
    : ["customers"];

  return useQuery<ICustomer[], Error>({
    queryKey,
    queryFn: () => fetchCustomers({ eventId, eventType }),
    staleTime: 1 * 60 * 1000, // 1 minute (customers change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
}
