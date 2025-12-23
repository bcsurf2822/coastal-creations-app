"use client";

import { useQuery } from "@tanstack/react-query";
import type { PrivateEvent } from "@/types/interfaces";

interface PrivateEventResponse {
  success?: boolean;
  data?: PrivateEvent;
  privateEvent?: PrivateEvent;
}

async function fetchPrivateEvent(id: string): Promise<PrivateEvent> {
  const response = await fetch(`/api/private-events/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch private event");
  }

  const result: PrivateEventResponse = await response.json();
  const privateEvent = result.data || result.privateEvent;

  if (!privateEvent || !privateEvent._id) {
    throw new Error("Private event not found");
  }

  return privateEvent;
}

/**
 * Hook to fetch a single private event by ID
 */
export function usePrivateEvent(id: string | null, enabled: boolean = true) {
  return useQuery<PrivateEvent, Error>({
    queryKey: ["private-event", id],
    queryFn: () => {
      if (!id) throw new Error("Private event ID required");
      return fetchPrivateEvent(id);
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
