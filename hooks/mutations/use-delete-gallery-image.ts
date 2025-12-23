"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteGalleryImageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function deleteGalleryImage(id: string): Promise<void> {
  const response = await fetch(`/api/gallery?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete gallery image");
  }

  const result: DeleteGalleryImageResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete gallery image");
  }
}

/**
 * Mutation hook to delete a gallery image
 * Invalidates the gallery query on success
 */
export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => {
      console.error("[use-delete-gallery-image] Error:", error.message);
    },
  });
}
