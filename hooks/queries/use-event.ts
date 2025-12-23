"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiEvent } from "@/types/interfaces";

interface EventResponse {
  success?: boolean;
  data?: ApiEvent;
  event?: ApiEvent;
}

async function fetchEvent(eventId: string): Promise<ApiEvent> {
  const response = await fetch(`/api/event/${eventId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }

  const result: EventResponse = await response.json();

  // Handle different response shapes
  const event = result.data || result.event;

  if (!event || !event._id) {
    throw new Error("Event not found");
  }

  return event;
}

/**
 * Hook to fetch a single event by ID
 * @param eventId - The event ID to fetch
 * @param enabled - Whether the query should run (default: true)
 */
export function useEvent(eventId: string | null, enabled: boolean = true) {
  return useQuery<ApiEvent, Error>({
    queryKey: ["event", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID required");
      return fetchEvent(eventId);
    },
    enabled: !!eventId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
