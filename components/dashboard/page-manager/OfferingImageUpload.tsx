"use client";

import { useState, useRef, type ReactElement, type ChangeEvent } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import type { SanityImageRef } from "@/types/pageContent";
import { RiUploadCloudLine, RiDeleteBinLine, RiImageLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

interface OfferingImageUploadProps {
  currentImage: SanityImageRef | undefined;
  onImageChange: (image: SanityImageRef | null) => void;
  label?: string;
}

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource): string | null => {
  if (!projectId || !dataset) return null;
  return imageUrlBuilder({ projectId, dataset })
    .image(source)
    .width(400)
    .quality(85)
    .url();
};

const OfferingImageUpload = ({
  currentImage,
  onImageChange,
  label = "Card Image",
}: OfferingImageUploadProps): ReactElement => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = currentImage ? urlFor(currentImage) : null;

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/page-content/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      console.log("[OfferingImageUpload-handleFileSelect] Upload successful");
      onImageChange(result.data);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("[OfferingImageUpload-handleFileSelect] Error:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (): void => {
    onImageChange(null);
    toast.success("Image removed (save to apply)");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {currentUrl ? (
        /* Current image preview */
        <div className="flex items-start gap-3">
          <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
            <Image
              src={currentUrl}
              alt="Card image"
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RiUploadCloudLine className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RiDeleteBinLine className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* No image - upload prompt */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <RiImageLine className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {uploading ? "Uploading..." : "Upload an image"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A default image will be used if none is set
            </p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
};

export default OfferingImageUpload;
