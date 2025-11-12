"use client";

import { useState } from "react";
import type { GalleryUploadFormData, PictureGalleryItem } from "@/types/interfaces";

interface UploadProgress {
  total: number;
  completed: number;
  current: string;
}

interface UseGalleryUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  uploadedImages: PictureGalleryItem[];
  error: string | null;
  uploadImages: (formData: GalleryUploadFormData) => Promise<boolean>;
  reset: () => void;
}

/**
 * Custom hook for uploading gallery images to Sanity
 */
export function useGalleryUpload(): UseGalleryUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadedImages, setUploadedImages] = useState<PictureGalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (
    formData: GalleryUploadFormData
  ): Promise<boolean> => {
    console.log("[useGalleryUpload-uploadImages] Starting upload", {
      title: formData.title,
      destinations: formData.destinations,
      fileCount: formData.files.length,
    });

    setUploading(true);
    setError(null);
    setProgress({
      total: formData.files.length,
      completed: 0,
      current: "",
    });

    try {
      // Validate inputs
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      if (formData.destinations.length === 0) {
        throw new Error("At least one destination must be selected");
      }

      if (formData.files.length === 0) {
        throw new Error("At least one image file must be selected");
      }

      // Prepare FormData for API
      const apiFormData = new FormData();
      apiFormData.append("title", formData.title.trim());

      if (formData.description?.trim()) {
        apiFormData.append("description", formData.description.trim());
      }

      apiFormData.append("destinations", JSON.stringify(formData.destinations));

      // Add all files
      formData.files.forEach((file, index) => {
        apiFormData.append(`file_${index}`, file);
        console.log("[useGalleryUpload-uploadImages] Adding file", {
          index,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      });

      // Update progress
      setProgress({
        total: formData.files.length,
        completed: 0,
        current: "Uploading images...",
      });

      // Send to API
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload images");
      }

      console.log("[useGalleryUpload-uploadImages] Upload successful", {
        uploadedCount: result.data?.length,
      });

      // Update state with uploaded images
      setUploadedImages(result.data || []);
      setProgress({
        total: formData.files.length,
        completed: formData.files.length,
        current: "Complete",
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("[useGalleryUpload-uploadImages] Upload failed", err);
      setError(errorMessage);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const reset = (): void => {
    setUploading(false);
    setProgress(null);
    setUploadedImages([]);
    setError(null);
  };

  return {
    uploading,
    progress,
    uploadedImages,
    error,
    uploadImages,
    reset,
  };
}
