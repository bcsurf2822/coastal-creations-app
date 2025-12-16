"use client";

import { useQuery } from "@tanstack/react-query";
import type { HoursOfOperation } from "@/types/hours";

interface HoursResponse {
  success: boolean;
  data: HoursOfOperation;
}

async function fetchHours(): Promise<HoursOfOperation> {
  const response = await fetch("/api/hours");

  if (!response.ok) {
    throw new Error("Failed to fetch hours of operation");
  }

  const result: HoursResponse = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data;
}

export function useHours() {
  return useQuery<HoursOfOperation, Error>({
    queryKey: ["hours"],
    queryFn: fetchHours,
    // Hours rarely change - cache for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
