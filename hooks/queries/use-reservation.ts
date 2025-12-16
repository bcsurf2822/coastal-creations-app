"use client";

import { useQuery } from "@tanstack/react-query";
import type { Reservation } from "@/lib/types/reservationTypes";

interface ReservationResponse {
  success?: boolean;
  data?: Reservation;
  reservation?: Reservation;
}

async function fetchReservation(id: string): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch reservation");
  }

  const result: ReservationResponse = await response.json();
  const reservation = result.data || result.reservation;

  if (!reservation || !reservation._id) {
    throw new Error("Reservation not found");
  }

  return reservation;
}

/**
 * Hook to fetch a single reservation by ID
 */
export function useReservation(id: string | null, enabled: boolean = true) {
  return useQuery<Reservation, Error>({
    queryKey: ["reservation", id],
    queryFn: () => {
      if (!id) throw new Error("Reservation ID required");
      return fetchReservation(id);
    },
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
