import { useState, useEffect } from "react";
import type { PageContent } from "@/types/pageContent";

let cachedContent: PageContent | null = null;
let isFetching = false;
let fetchPromise: Promise<PageContent | null> | null = null;

export function usePageContent() {
  const [content, setContent] = useState<PageContent | null>(cachedContent);
  const [isLoading, setIsLoading] = useState(!cachedContent);

  useEffect(() => {
    // If we already have cached content, use it
    if (cachedContent) {
      setContent(cachedContent);
      setIsLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (isFetching && fetchPromise) {
      fetchPromise.then((data) => {
        setContent(data);
        setIsLoading(false);
      });
      return;
    }

    // Start fetching
    isFetching = true;
    fetchPromise = fetch("/api/page-content")
      .then((response) => response.json())
      .then((result) => {
        const pageContent = result.data || null;
        cachedContent = pageContent;
        isFetching = false;
        return pageContent;
      })
      .catch((error) => {
        console.error("[usePageContent] Error fetching page content:", error);
        isFetching = false;
        return null;
      });

    fetchPromise.then((data) => {
      setContent(data);
      setIsLoading(false);
    });
  }, []);

  return { content, isLoading };
}

// Helper to clear cache (useful for admin updates)
export function clearPageContentCache(): void {
  cachedContent = null;
  isFetching = false;
  fetchPromise = null;
}
