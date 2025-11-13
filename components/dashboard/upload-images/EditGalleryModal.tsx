"use client";

import { useState, useEffect, type ReactElement } from "react";
import { getAllGalleryDestinations } from "@/lib/utils/galleryHelpers";
import type { PictureGalleryItem, GalleryDestination } from "@/types/interfaces";
import { RiCloseLine } from "react-icons/ri";

interface EditGalleryModalProps {
  image: PictureGalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updateData: {
    id: string;
    title: string;
    description?: string;
    destinations: GalleryDestination[];
  }) => Promise<boolean>;
}

export default function EditGalleryModal({
  image,
  isOpen,
  onClose,
  onSave,
}: EditGalleryModalProps): ReactElement | null {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<GalleryDestination[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; destinations?: string }>({});

  const destinations = getAllGalleryDestinations();

  // Initialize form when image changes
  useEffect(() => {
    if (image) {
      setTitle(image.title);
      setDescription(image.description || "");
      setSelectedDestinations(
        (image.destination && Array.isArray(image.destination)
          ? image.destination
          : []) as GalleryDestination[]
      );
      setErrors({});
    }
  }, [image]);

  if (!isOpen || !image) {
    return null;
  }

  const handleDestinationToggle = (destination: GalleryDestination): void => {
    setSelectedDestinations((prev) =>
      prev.includes(destination)
        ? prev.filter((d) => d !== destination)
        : [...prev, destination]
    );
    // Clear destination error when user selects one
    if (errors.destinations) {
      setErrors((prev) => ({ ...prev, destinations: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; destinations?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (selectedDestinations.length === 0) {
      newErrors.destinations = "At least one destination must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    setSaving(true);

    const success = await onSave({
      id: image._id,
      title: title.trim(),
      description: description.trim() || undefined,
      destinations: selectedDestinations,
    });

    setSaving(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = (): void => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Image
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destinations <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((dest) => (
                <button
                  key={dest.value}
                  type="button"
                  onClick={() => handleDestinationToggle(dest.value)}
                  disabled={saving}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    selectedDestinations.includes(dest.value)
                      ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {dest.label}
                </button>
              ))}
            </div>
            {errors.destinations && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.destinations}
              </p>
            )}
            {selectedDestinations.length > 0 && !errors.destinations && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Selected: {selectedDestinations.length} destination(s)
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Created:</span>{" "}
              {new Date(image._createdAt).toLocaleString()}
            </p>
            {image._updatedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(image._updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
