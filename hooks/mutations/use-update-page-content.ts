"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PageContent } from "@/types/pageContent";

interface UpdatePageContentResponse {
  success: boolean;
  data: PageContent;
  error?: string;
}

async function updatePageContent(content: PageContent): Promise<PageContent> {
  const response = await fetch("/api/page-content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update page content");
  }

  const result: UpdatePageContentResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update page content");
  }

  return result.data;
}

/**
 * Mutation hook to update CMS page content
 * Invalidates the pageContent query on success
 */
export function useUpdatePageContent() {
  const queryClient = useQueryClient();

  return useMutation<PageContent, Error, PageContent>({
    mutationFn: updatePageContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageContent"] });
    },
    onError: (error) => {
      console.error("[use-update-page-content] Error:", error.message);
    },
  });
}
