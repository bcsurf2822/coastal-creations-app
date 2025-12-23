"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiEvent } from "@/types/interfaces";

interface UpdateEventParams {
  id: string;
  data: Partial<ApiEvent>;
}

interface UpdateEventResponse {
  success: boolean;
  data: ApiEvent;
  error?: string;
}

async function updateEvent({ id, data }: UpdateEventParams): Promise<ApiEvent> {
  const response = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update event");
  }

  const result: UpdateEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update event");
  }

  return result.data;
}

/**
 * Mutation hook to update an existing event
 * Invalidates both the events list and the specific event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<ApiEvent, Error, UpdateEventParams>({
    mutationFn: updateEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
    },
    onError: (error) => {
      console.error("[use-update-event] Error:", error.message);
    },
  });
}
