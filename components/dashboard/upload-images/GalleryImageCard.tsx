"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { getGalleryDestinationDisplayName } from "@/lib/utils/galleryHelpers";
import type { PictureGalleryItem } from "@/types/interfaces";
import { RiImageLine, RiEyeLine } from "react-icons/ri";

interface GalleryImageCardProps {
  image: PictureGalleryItem;
  onEdit: (image: PictureGalleryItem) => void;
  onDelete: (image: PictureGalleryItem) => void;
}

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function GalleryImageCard({
  image,
  onEdit,
  onDelete,
}: GalleryImageCardProps): ReactElement {
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const imageUrl = urlFor(image.image)?.width(400).quality(85).url();
  const previewUrl = urlFor(image.image)?.width(1200).quality(90).url();

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
          {imageError || !imageUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <RiImageLine className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <>
              <Image
                src={imageUrl}
                alt={image.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
              />
              {/* Preview overlay */}
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <div className="bg-white dark:bg-gray-800 p-3 rounded-full">
                  <RiEyeLine className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
            {image.title}
          </h3>
          {image.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {image.description}
            </p>
          )}

          {/* Destination tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {image.destination && Array.isArray(image.destination) && image.destination.length > 0 ? (
              <>
                {image.destination.slice(0, 3).map((dest) => (
                  <span
                    key={dest}
                    className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                    title={getGalleryDestinationDisplayName(dest)}
                  >
                    {getGalleryDestinationDisplayName(dest)}
                  </span>
                ))}
                {image.destination.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
                    +{image.destination.length - 3} more
                  </span>
                )}
              </>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded">
                No destination set
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(image)}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(image)}
              className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Uploaded: {new Date(image._createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={previewUrl}
              alt={image.title}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
