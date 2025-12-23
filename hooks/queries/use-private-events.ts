"use client";

import { useQuery } from "@tanstack/react-query";
import type { PrivateEvent } from "@/types/interfaces";

interface PrivateEventsResponse {
  success: boolean;
  privateEvents: PrivateEvent[];
}

async function fetchPrivateEvents(): Promise<PrivateEvent[]> {
  const response = await fetch("/api/private-events");

  if (!response.ok) {
    throw new Error("Failed to fetch private events");
  }

  const result: PrivateEventsResponse = await response.json();

  if (!result.success && !result.privateEvents) {
    throw new Error("API returned unsuccessful response");
  }

  return result.privateEvents || [];
}

/**
 * Hook to fetch private event offerings
 */
export function usePrivateEvents(enabled: boolean = true) {
  return useQuery<PrivateEvent[], Error>({
    queryKey: ["private-events"],
    queryFn: fetchPrivateEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled,
  });
}
