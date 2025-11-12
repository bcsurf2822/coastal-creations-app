"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import type { PictureGalleryItem } from "@/types/interfaces";
import { RiAlertLine, RiCloseLine, RiImageLine } from "react-icons/ri";

interface DeleteConfirmationProps {
  image: PictureGalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageId: string) => Promise<boolean>;
}

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function DeleteConfirmation({
  image,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationProps): ReactElement | null {
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !image) {
    return null;
  }

  const thumbnailUrl = urlFor(image.image)?.width(200).quality(80).url();

  const handleConfirm = async (): Promise<void> => {
    setDeleting(true);
    const success = await onConfirm(image._id);
    setDeleting(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = (): void => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <RiAlertLine className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delete Image
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete this image? This action cannot be undone.
          </p>

          {/* Image Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {imageError || !thumbnailUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RiImageLine className="w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <Image
                    src={thumbnailUrl}
                    alt={image.title}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {image.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {image.destination && Array.isArray(image.destination) && image.destination.length > 0 ? (
                    <>
                      {image.destination.slice(0, 2).map((dest) => (
                        <span
                          key={dest}
                          className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                        >
                          {dest}
                        </span>
                      ))}
                      {image.destination.length > 2 && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          +{image.destination.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded">
                      No destination
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              <span className="font-semibold">Warning:</span> This will permanently delete
              the image from Sanity CMS and remove it from all associated destinations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {deleting ? "Deleting..." : "Delete Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
