"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadGalleryImageParams {
  title: string;
  description?: string;
  destinations: string[];
  files: File[];
}

interface GalleryDocument {
  _id: string;
  _type: string;
  title: string;
  description?: string;
  destination: string[];
  imageUrl: string;
}

interface UploadGalleryImageResponse {
  success: boolean;
  data: GalleryDocument[];
  message?: string;
  error?: string;
}

async function uploadGalleryImage(params: UploadGalleryImageParams): Promise<GalleryDocument[]> {
  const formData = new FormData();
  formData.append("title", params.title);
  if (params.description) {
    formData.append("description", params.description);
  }
  formData.append("destinations", JSON.stringify(params.destinations));

  params.files.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });

  const response = await fetch("/api/gallery", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload gallery image");
  }

  const result: UploadGalleryImageResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to upload gallery image");
  }

  return result.data;
}

/**
 * Mutation hook to upload images to the gallery
 * Invalidates the gallery query on success
 */
export function useUploadGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation<GalleryDocument[], Error, UploadGalleryImageParams>({
    mutationFn: uploadGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => {
      console.error("[use-upload-gallery-image] Error:", error.message);
    },
  });
}
