"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Reservation } from "@/lib/types/reservationTypes";

interface UpdateReservationParams {
  id: string;
  data: Partial<Reservation>;
}

interface UpdateReservationResponse {
  success: boolean;
  data: Reservation;
  error?: string;
}

async function updateReservation({ id, data }: UpdateReservationParams): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update reservation");
  }

  const result: UpdateReservationResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update reservation");
  }

  return result.data;
}

/**
 * Mutation hook to update a reservation
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation<Reservation, Error, UpdateReservationParams>({
    mutationFn: updateReservation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", variables.id] });
    },
    onError: (error) => {
      console.error("[use-update-reservation] Error:", error.message);
    },
  });
}
