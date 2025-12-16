"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { HoursOfOperation } from "@/types/hours";

interface UpdateHoursResponse {
  success: boolean;
  data: HoursOfOperation;
  error?: string;
}

async function updateHours(hours: HoursOfOperation): Promise<HoursOfOperation> {
  const response = await fetch("/api/hours", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hours),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update hours");
  }

  const result: UpdateHoursResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update hours");
  }

  return result.data;
}

/**
 * Mutation hook to update business hours
 * Invalidates the hours query on success
 */
export function useUpdateHours() {
  const queryClient = useQueryClient();

  return useMutation<HoursOfOperation, Error, HoursOfOperation>({
    mutationFn: updateHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hours"] });
    },
    onError: (error) => {
      console.error("[use-update-hours] Error:", error.message);
    },
  });
}
