"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiEvent } from "@/types/interfaces";

interface EventsResponse {
  success: boolean;
  events: ApiEvent[];
}

type EventTypeFilter = "class" | "camp" | "workshop" | "artist";

interface UseEventsOptions {
  type?: EventTypeFilter;
  enabled?: boolean;
}

async function fetchEvents(type?: EventTypeFilter): Promise<ApiEvent[]> {
  const url = type ? `/api/events?type=${type}` : "/api/events";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const result: EventsResponse = await response.json();

  if (!result.success && !result.events) {
    throw new Error("API returned unsuccessful response");
  }

  return result.events || [];
}

/**
 * Hook to fetch events with optional type filtering
 * @param options - Optional configuration { type, enabled }
 */
export function useEvents(options: UseEventsOptions = {}) {
  const { type, enabled = true } = options;

  return useQuery<ApiEvent[], Error>({
    queryKey: type ? ["events", { type }] : ["events"],
    queryFn: () => fetchEvents(type),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });
}
