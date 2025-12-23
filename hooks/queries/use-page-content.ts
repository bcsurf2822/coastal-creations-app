"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PageContent } from "@/types/pageContent";

interface PageContentResponse {
  success: boolean;
  data: PageContent;
}

async function fetchPageContent(): Promise<PageContent | null> {
  const response = await fetch("/api/page-content");

  if (!response.ok) {
    throw new Error("Failed to fetch page content");
  }

  const result: PageContentResponse = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data || null;
}

/**
 * Hook to fetch page content from Sanity CMS
 * Returns { content, isLoading } for backwards compatibility with the old hook
 */
export function usePageContent() {
  const query = useQuery<PageContent | null, Error>({
    queryKey: ["page-content"],
    queryFn: fetchPageContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Return with backwards-compatible property names
  return {
    content: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Hook to invalidate page content cache
 * Replaces the old clearPageContentCache() function
 */
export function useInvalidatePageContent() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["page-content"] });
}
