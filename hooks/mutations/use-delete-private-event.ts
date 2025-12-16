"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletePrivateEventResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function deletePrivateEvent(id: string): Promise<void> {
  const response = await fetch(`/api/private-events?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete private event");
  }

  const result: DeletePrivateEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete private event");
  }
}

/**
 * Mutation hook to delete a private event
 * Invalidates the privateEvents list on success
 */
export function useDeletePrivateEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePrivateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateEvents"] });
    },
    onError: (error) => {
      console.error("[use-delete-private-event] Error:", error.message);
    },
  });
}
