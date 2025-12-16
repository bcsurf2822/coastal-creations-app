"use client";

import { useQuery } from "@tanstack/react-query";
import type { PictureGalleryItem } from "@/types/interfaces";

interface GalleryResponse {
  success: boolean;
  data: PictureGalleryItem[];
}

interface UseGalleryOptions {
  destination?: string; // Comma-separated: "adult-class,kid-class"
  enabled?: boolean;
}

async function fetchGallery(destination?: string): Promise<PictureGalleryItem[]> {
  const url = destination ? `/api/gallery?destination=${destination}` : "/api/gallery";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch gallery images");
  }

  const result: GalleryResponse = await response.json();

  if (!result.success && !result.data) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data || [];
}

/**
 * Hook to fetch gallery images with optional destination filtering
 */
export function useGallery(options: UseGalleryOptions = {}) {
  const { destination, enabled = true } = options;

  return useQuery<PictureGalleryItem[], Error>({
    queryKey: destination ? ["gallery", { destination }] : ["gallery"],
    queryFn: () => fetchGallery(destination),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled,
  });
}
