"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Reservation, CreateReservationData } from "@/lib/types/reservationTypes";

interface CreateReservationResponse {
  success: boolean;
  data: Reservation;
  error?: string;
}

async function createReservation(data: CreateReservationData): Promise<Reservation> {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create reservation");
  }

  const result: CreateReservationResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create reservation");
  }

  return result.data;
}

/**
 * Mutation hook to create a new reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation<Reservation, Error, CreateReservationData>({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      console.error("[use-create-reservation] Error:", error.message);
    },
  });
}
