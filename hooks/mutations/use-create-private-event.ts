"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IPrivateEvent } from "@/lib/models/PrivateEvent";

type PrivateEventInput = Omit<IPrivateEvent, "_id" | "createdAt" | "updatedAt">;

interface CreatePrivateEventResponse {
  success: boolean;
  privateEvent: IPrivateEvent;
  error?: string;
}

async function createPrivateEvent(data: PrivateEventInput): Promise<IPrivateEvent> {
  const response = await fetch("/api/private-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create private event");
  }

  const result: CreatePrivateEventResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create private event");
  }

  return result.privateEvent;
}

/**
 * Mutation hook to create a new private event
 * Invalidates the privateEvents list on success
 */
export function useCreatePrivateEvent() {
  const queryClient = useQueryClient();

  return useMutation<IPrivateEvent, Error, PrivateEventInput>({
    mutationFn: createPrivateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateEvents"] });
    },
    onError: (error) => {
      console.error("[use-create-private-event] Error:", error.message);
    },
  });
}
