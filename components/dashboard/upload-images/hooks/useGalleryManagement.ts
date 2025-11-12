"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PictureGalleryItem,
  GalleryUpdateData,
  GalleryDestination,
} from "@/types/interfaces";

interface UseGalleryManagementReturn {
  images: PictureGalleryItem[];
  loading: boolean;
  error: string | null;
  fetchGallery: (destinations?: GalleryDestination[]) => Promise<void>;
  updateGalleryItem: (updateData: GalleryUpdateData) => Promise<boolean>;
  deleteGalleryItem: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing gallery images (fetch, update, delete)
 */
export function useGalleryManagement(): UseGalleryManagementReturn {
  const [images, setImages] = useState<PictureGalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDestinations, setLastDestinations] = useState<
    GalleryDestination[] | undefined
  >(undefined);

  /**
   * Fetch gallery images with optional destination filter
   */
  const fetchGallery = useCallback(
    async (destinations?: GalleryDestination[]): Promise<void> => {
      console.log("[useGalleryManagement-fetchGallery] Fetching images", {
        destinations,
      });

      setLoading(true);
      setError(null);
      setLastDestinations(destinations);

      try {
        // Build query params
        const params = new URLSearchParams();
        if (destinations && destinations.length > 0) {
          params.append("destination", destinations.join(","));
        }

        const url = `/api/gallery${params.toString() ? `?${params.toString()}` : ""}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch gallery images");
        }

        console.log("[useGalleryManagement-fetchGallery] Fetch successful", {
          imageCount: result.data?.length || 0,
        });

        setImages(result.data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("[useGalleryManagement-fetchGallery] Fetch failed", err);
        setError(errorMessage);
        setImages([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update gallery item metadata
   */
  const updateGalleryItem = async (
    updateData: GalleryUpdateData
  ): Promise<boolean> => {
    console.log("[useGalleryManagement-updateGalleryItem] Updating item", {
      id: updateData.id,
      title: updateData.title,
      destinations: updateData.destinations,
    });

    try {
      // Validate inputs
      if (!updateData.id) {
        throw new Error("Image ID is required");
      }

      if (!updateData.title.trim()) {
        throw new Error("Title is required");
      }

      if (updateData.destinations.length === 0) {
        throw new Error("At least one destination must be selected");
      }

      const response = await fetch("/api/gallery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updateData.id,
          title: updateData.title.trim(),
          description: updateData.description?.trim() || undefined,
          destinations: updateData.destinations,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update image");
      }

      console.log("[useGalleryManagement-updateGalleryItem] Update successful");

      // Update local state
      setImages((prev) =>
        prev.map((img) =>
          img._id === updateData.id
            ? {
                ...img,
                title: updateData.title,
                description: updateData.description,
                destination: updateData.destinations,
              }
            : img
        )
      );

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error(
        "[useGalleryManagement-updateGalleryItem] Update failed",
        err
      );
      setError(errorMessage);
      return false;
    }
  };

  /**
   * Delete gallery item
   */
  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    console.log("[useGalleryManagement-deleteGalleryItem] Deleting item", {
      id,
    });

    try {
      if (!id) {
        throw new Error("Image ID is required");
      }

      const response = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image");
      }

      console.log("[useGalleryManagement-deleteGalleryItem] Delete successful");

      // Update local state
      setImages((prev) => prev.filter((img) => img._id !== id));

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error(
        "[useGalleryManagement-deleteGalleryItem] Delete failed",
        err
      );
      setError(errorMessage);
      return false;
    }
  };

  /**
   * Refetch with the same filter
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchGallery(lastDestinations);
  }, [fetchGallery, lastDestinations]);

  // Initial fetch on mount
  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return {
    images,
    loading,
    error,
    fetchGallery,
    updateGalleryItem,
    deleteGalleryItem,
    refetch,
  };
}
