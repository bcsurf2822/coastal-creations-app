"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateGalleryImageParams {
  id: string;
  title: string;
  description?: string;
  destinations: string[];
}

interface GalleryDocument {
  _id: string;
  _type: string;
  title: string;
  description?: string;
  destination: string[];
}

interface UpdateGalleryImageResponse {
  success: boolean;
  data: GalleryDocument;
  message?: string;
  error?: string;
}

async function updateGalleryImage(params: UpdateGalleryImageParams): Promise<GalleryDocument> {
  const response = await fetch("/api/gallery", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update gallery image");
  }

  const result: UpdateGalleryImageResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update gallery image");
  }

  return result.data;
}

/**
 * Mutation hook to update gallery image metadata
 * Invalidates the gallery query on success
 */
export function useUpdateGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation<GalleryDocument, Error, UpdateGalleryImageParams>({
    mutationFn: updateGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => {
      console.error("[use-update-gallery-image] Error:", error.message);
    },
  });
}
