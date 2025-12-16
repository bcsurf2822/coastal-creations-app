"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IPrivateEvent } from "@/lib/models/PrivateEvent";

interface UpdatePrivateEventParams {
  id: string;
  data: Partial<IPrivateEvent>;
}

interface UpdatePrivateEventResponse {
  success: boolean;
  privateEvent: IPrivateEvent;
  error?: string;
}

async function updatePrivateEvent({ id, data }: UpdatePrivateEventParams): Promise<IPrivateEvent> {
  const response = await fetch(`/api/private-events?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update private event");
  }

  const result: UpdatePrivateEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update private event");
  }

  return result.privateEvent;
}

/**
 * Mutation hook to update a private event
 * Invalidates both the list and single item queries on success
 */
export function useUpdatePrivateEvent() {
  const queryClient = useQueryClient();

  return useMutation<IPrivateEvent, Error, UpdatePrivateEventParams>({
    mutationFn: updatePrivateEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["privateEvents"] });
      queryClient.invalidateQueries({ queryKey: ["privateEvent", variables.id] });
    },
    onError: (error) => {
      console.error("[use-update-private-event] Error:", error.message);
    },
  });
}
