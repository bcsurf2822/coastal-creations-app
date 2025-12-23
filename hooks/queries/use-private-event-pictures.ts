"use client";

import { useQuery } from "@tanstack/react-query";
import type { SanityDocument } from "next-sanity";

async function fetchPrivateEventPictures(): Promise<SanityDocument[]> {
  const response = await fetch("/api/privateEventPictures");

  if (!response.ok) {
    throw new Error("Failed to fetch private event pictures");
  }

  const result = await response.json();
  return Array.isArray(result) ? result : result.data || [];
}

/**
 * Hook to fetch private event pictures from Sanity
 */
export function usePrivateEventPictures(enabled: boolean = true) {
  return useQuery<SanityDocument[], Error>({
    queryKey: ["private-event-pictures"],
    queryFn: fetchPrivateEventPictures,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled,
  });
}
