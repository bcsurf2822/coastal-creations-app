"use client";

import { useState, useRef, type ReactElement, type ChangeEvent, type DragEvent } from "react";
import { useGalleryUpload } from "./hooks/useGalleryUpload";
import { getAllGalleryDestinations } from "@/lib/utils/galleryHelpers";
import type { GalleryDestination } from "@/types/interfaces";
import { RiUploadCloudLine, RiCloseLine, RiImageLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

interface GalleryUploadFormProps {
  onUploadSuccess?: () => void;
}

export default function GalleryUploadForm({
  onUploadSuccess,
}: GalleryUploadFormProps): ReactElement {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<
    GalleryDestination[]
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploading, progress, uploadImages, reset } = useGalleryUpload();

  const destinations = getAllGalleryDestinations();

  const handleDestinationToggle = (destination: GalleryDestination): void => {
    setSelectedDestinations((prev) =>
      prev.includes(destination)
        ? prev.filter((d) => d !== destination)
        : [...prev, destination]
    );
  };

  const handleFileSelect = (files: FileList | null): void => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleFileSelect(e.target.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (selectedDestinations.length === 0) {
      toast.error("Please select at least one destination");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    // Upload
    const success = await uploadImages({
      title: title.trim(),
      description: description.trim() || undefined,
      destinations: selectedDestinations,
      files: selectedFiles,
    });

    if (success) {
      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDestinations([]);
      setSelectedFiles([]);
      reset();
      onUploadSuccess?.();
    } else {
      toast.error("Failed to upload images");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upload New Images
        </h2>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {/* Form Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter image description"
              disabled={uploading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destinations <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {destinations.map((dest) => (
                <button
                  key={dest.value}
                  type="button"
                  onClick={() => handleDestinationToggle(dest.value)}
                  disabled={uploading}
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
            {selectedDestinations.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Selected: {selectedDestinations.length} destination(s)
              </p>
            )}
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <RiUploadCloudLine className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                Drag and drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports: JPG, PNG, GIF, WebP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Files ({selectedFiles.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RiImageLine className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-900">
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <RiCloseLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {uploading && progress && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {progress.current}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {progress.completed} / {progress.total}
                </p>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(progress.completed / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setSelectedDestinations([]);
                setSelectedFiles([]);
                reset();
              }}
              disabled={uploading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
