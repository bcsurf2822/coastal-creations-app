"use client";

import { useQuery } from "@tanstack/react-query";
import type { Reservation } from "@/lib/types/reservationTypes";

interface ReservationsResponse {
  success: boolean;
  reservations: Reservation[];
}

interface UseReservationsOptions {
  type?: string;
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
}

async function fetchReservations(options: UseReservationsOptions): Promise<Reservation[]> {
  const params = new URLSearchParams();

  if (options.type) params.append("type", options.type);
  if (options.fromDate) params.append("fromDate", options.fromDate);
  if (options.toDate) params.append("toDate", options.toDate);

  const url = params.toString() ? `/api/reservations?${params}` : "/api/reservations";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch reservations");
  }

  const result: ReservationsResponse = await response.json();

  if (!result.success && !result.reservations) {
    throw new Error("API returned unsuccessful response");
  }

  return result.reservations || [];
}

/**
 * Hook to fetch reservations with optional date filtering
 */
export function useReservations(options: UseReservationsOptions = {}) {
  const { type, fromDate, toDate, enabled = true } = options;

  return useQuery<Reservation[], Error>({
    queryKey: ["reservations", { type, fromDate, toDate }],
    queryFn: () => fetchReservations({ type, fromDate, toDate }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });
}
