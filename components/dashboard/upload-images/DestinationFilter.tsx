"use client";

import { type ReactElement } from "react";
import { getAllGalleryDestinations, countItemsByDestination } from "@/lib/utils/galleryHelpers";
import type { GalleryDestination, PictureGalleryItem } from "@/types/interfaces";
import { RiFilterLine } from "react-icons/ri";

interface DestinationFilterProps {
  selectedDestinations: GalleryDestination[];
  onDestinationChange: (destinations: GalleryDestination[]) => void;
  allImages: PictureGalleryItem[];
}

export default function DestinationFilter({
  selectedDestinations,
  onDestinationChange,
  allImages,
}: DestinationFilterProps): ReactElement {
  const destinations = getAllGalleryDestinations();
  const counts = countItemsByDestination(allImages);

  const handleDestinationToggle = (destination: GalleryDestination): void => {
    if (selectedDestinations.includes(destination)) {
      // Remove destination
      const newDestinations = selectedDestinations.filter((d) => d !== destination);
      onDestinationChange(newDestinations);
    } else {
      // Add destination
      onDestinationChange([...selectedDestinations, destination]);
    }
  };

  const handleClearAll = (): void => {
    onDestinationChange([]);
  };

  const handleSelectAll = (): void => {
    onDestinationChange(destinations.map((d) => d.value));
  };

  const isAllSelected = selectedDestinations.length === destinations.length;
  const isNoneSelected = selectedDestinations.length === 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RiFilterLine className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filter by Destination
          </h3>
        </div>
        <div className="flex gap-2">
          {!isAllSelected && !isNoneSelected && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear
            </button>
          )}
          {!isAllSelected && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Select All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {destinations.map((dest) => {
          const count = counts[dest.value] || 0;
          const isSelected = selectedDestinations.includes(dest.value);

          return (
            <button
              key={dest.value}
              type="button"
              onClick={() => handleDestinationToggle(dest.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
                isSelected
                  ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{dest.label}</span>
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                    isSelected
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isNoneSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing images from {selectedDestinations.length} destination(s)
          </p>
        </div>
      )}
      {isNoneSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing all {allImages.length} images
          </p>
        </div>
      )}
    </div>
  );
}
