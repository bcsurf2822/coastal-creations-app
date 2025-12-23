"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteReservationResponse {
  success: boolean;
  error?: string;
}

async function deleteReservation(reservationId: string): Promise<void> {
  const response = await fetch(`/api/reservations?id=${reservationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete reservation");
  }

  const result: DeleteReservationResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete reservation");
  }
}

/**
 * Mutation hook to delete a reservation
 */
export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      console.error("[use-delete-reservation] Error:", error.message);
    },
  });
}
