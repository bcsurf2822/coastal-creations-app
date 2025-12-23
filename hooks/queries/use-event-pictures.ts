"use client";

import { useQuery } from "@tanstack/react-query";
import type { SanityDocument } from "next-sanity";

async function fetchEventPictures(): Promise<SanityDocument[]> {
  const response = await fetch("/api/eventPictures");

  if (!response.ok) {
    throw new Error("Failed to fetch event pictures");
  }

  const result = await response.json();
  return Array.isArray(result) ? result : result.data || [];
}

/**
 * Hook to fetch event pictures from Sanity
 */
export function useEventPictures(enabled: boolean = true) {
  return useQuery<SanityDocument[], Error>({
    queryKey: ["event-pictures"],
    queryFn: fetchEventPictures,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled,
  });
}
