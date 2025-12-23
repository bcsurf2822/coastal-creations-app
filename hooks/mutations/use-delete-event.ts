"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteEventResponse {
  success: boolean;
  error?: string;
}

async function deleteEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/events?id=${eventId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete event");
  }

  const result: DeleteEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete event");
  }
}

/**
 * Mutation hook to delete an event
 * Invalidates the events list on success
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("[use-delete-event] Error:", error.message);
    },
  });
}
