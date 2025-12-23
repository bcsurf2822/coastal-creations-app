"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiEvent } from "@/types/interfaces";

interface CreateEventResponse {
  success: boolean;
  data: ApiEvent;
  error?: string;
}

async function createEvent(eventData: Partial<ApiEvent>): Promise<ApiEvent> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create event");
  }

  const result: CreateEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create event");
  }

  return result.data;
}

/**
 * Mutation hook to create a new event
 * Invalidates the events list on success
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<ApiEvent, Error, Partial<ApiEvent>>({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("[use-create-event] Error:", error.message);
    },
  });
}
