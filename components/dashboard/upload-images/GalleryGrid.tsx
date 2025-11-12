"use client";

import type { ReactElement } from "react";
import type { PictureGalleryItem } from "@/types/interfaces";
import GalleryImageCard from "./GalleryImageCard";
import { RiImageLine } from "react-icons/ri";

interface GalleryGridProps {
  images: PictureGalleryItem[];
  loading: boolean;
  onEdit: (image: PictureGalleryItem) => void;
  onDelete: (image: PictureGalleryItem) => void;
}

export default function GalleryGrid({
  images,
  loading,
  onEdit,
  onDelete,
}: GalleryGridProps): ReactElement {
  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-300 dark:bg-gray-700" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <RiImageLine className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No images found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Upload your first images using the form above, or try adjusting your
          filter criteria.
        </p>
      </div>
    );
  }

  // Grid of images
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <GalleryImageCard
          key={image._id}
          image={image}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
