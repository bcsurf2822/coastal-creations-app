"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactElement,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { useGalleryUpload } from "@/components/dashboard/upload-images/hooks/useGalleryUpload";
import type { PictureGalleryItem, GalleryDestination } from "@/types/interfaces";
import {
  RiUploadCloudLine,
  RiCloseLine,
  RiImageLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiPencilLine,
  RiCheckLine,
  RiArrowGoBackLine,
} from "react-icons/ri";
import { toast } from "react-hot-toast";
import { Button, Input, Label } from "@/components/ui";

interface PageImageSectionProps {
  destination: GalleryDestination;
  onFocusSection: (sectionId: string | null) => void;
}

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const PageImageSection = ({
  destination,
  onFocusSection,
}: PageImageSectionProps): ReactElement => {
  const [images, setImages] = useState<PictureGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<PictureGalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  const { uploading, progress, uploadImages, reset } = useGalleryUpload();

  // Fetch images for this destination
  const fetchImages = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/gallery?destination=${encodeURIComponent(destination)}`,
      );
      const result = await response.json();
      if (result.success && result.data) {
        setImages(result.data);
      }
    } catch (err) {
      console.error("[PageImageSection-fetchImages] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Create blob URLs for file previews and revoke on cleanup
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const MAX_FILES = 10;

  // File handling
  const handleFileSelect = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }
    setSelectedFiles((prev) => {
      const combined = [...prev, ...imageFiles];
      if (combined.length > MAX_FILES) {
        toast.error(`You can upload up to ${MAX_FILES} images at a time`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
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

  // Upload – title/description omitted; each file gets its filename as the default title.
  // After upload, images appear in the grid for individual editing.
  const handleUpload = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    const success = await uploadImages({
      destinations: [destination],
      files: selectedFiles,
    });

    if (success) {
      const count = selectedFiles.length;
      // Track existing image IDs so we can highlight new ones after refresh
      const existingIds = new Set(images.map((img) => img._id));
      setSelectedFiles([]);
      reset();
      // Refresh the image list and find newly created IDs
      const response = await fetch(
        `/api/gallery?destination=${encodeURIComponent(destination)}`,
      );
      const result = await response.json();
      if (result.success && result.data) {
        setImages(result.data);
        const freshIds = new Set<string>(
          (result.data as PictureGalleryItem[])
            .filter((img) => !existingIds.has(img._id))
            .map((img) => img._id),
        );
        setNewImageIds(freshIds);
      }
      toast.success(
        count === 1
          ? "Image uploaded -- click the pencil icon to add a title & description"
          : `${count} images uploaded -- click the pencil icon on each to add titles & descriptions`,
      );
    }
  };

  // Delete
  const handleDelete = async (imageId: string): Promise<void> => {
    setDeletingId(imageId);
    try {
      const response = await fetch(
        `/api/gallery?id=${encodeURIComponent(imageId)}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (result.success) {
        toast.success("Image removed");
        setImages((prev) => prev.filter((img) => img._id !== imageId));
        if (editingImage?._id === imageId) {
          setEditingImage(null);
        }
      } else {
        toast.error("Failed to remove image");
      }
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setDeletingId(null);
    }
  };

  // Scroll edit panel into clear view when it appears
  useEffect(() => {
    if (editingImage && editPanelRef.current) {
      // Small delay so the DOM renders the panel before scrolling
      requestAnimationFrame(() => {
        editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [editingImage]);

  // Start editing an image – also clear "new" highlight for this image
  const handleStartEdit = (img: PictureGalleryItem): void => {
    setEditingImage(img);
    setEditTitle(img.title);
    setEditDescription(img.description || "");
    setNewImageIds((prev) => {
      if (!prev.has(img._id)) return prev;
      const next = new Set(prev);
      next.delete(img._id);
      return next;
    });
  };

  // Cancel editing
  const handleCancelEdit = (): void => {
    setEditingImage(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Save edited image metadata
  const handleSaveEdit = async (): Promise<void> => {
    if (!editingImage) return;
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingImage._id,
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          destinations: editingImage.destination || [destination],
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Image updated");
        setImages((prev) =>
          prev.map((img) =>
            img._id === editingImage._id
              ? { ...img, title: editTitle.trim(), description: editDescription.trim() || undefined }
              : img,
          ),
        );
        setEditingImage(null);
        setEditTitle("");
        setEditDescription("");
      } else {
        toast.error(result.error || "Failed to update image");
      }
    } catch {
      toast.error("Failed to update image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => onFocusSection("images")}
      onMouseLeave={() => onFocusSection(null)}
    >
      {/* Current Images Grid */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Page Images ({images.length})
        </h4>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <RiImageLine className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No images assigned to this page yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => {
                const imgUrl = urlFor(img.image)?.width(200).quality(80).url();
                const fullUrl = urlFor(img.image)?.width(1200).quality(90).url();
                const isEditing = editingImage?._id === img._id;
                const isNew = newImageIds.has(img._id);
                return (
                  <div
                    key={img._id}
                    className={`relative group aspect-square rounded-lg overflow-hidden border transition-all ${
                      isEditing
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : isNew
                          ? "border-amber-400 ring-2 ring-amber-400/40 animate-pulse"
                          : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={img.title}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <RiImageLine className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(img)}
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Edit title & description"
                      >
                        <RiPencilLine className="w-4 h-4 text-gray-700" />
                      </button>
                      {fullUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(fullUrl)}
                          className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Preview"
                        >
                          <RiEyeLine className="w-4 h-4 text-gray-700" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(img._id)}
                        disabled={deletingId === img._id}
                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Title tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate">
                        {img.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Edit Panel */}
            {editingImage && (
              <div
                ref={editPanelRef}
                className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-xl p-5 space-y-4 shadow-md"
              >
                {/* Header row with thumbnail */}
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-600 shrink-0 shadow-sm">
                    {(() => {
                      const thumbUrl = urlFor(editingImage.image)?.width(200).quality(80).url();
                      return thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={editingImage.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <RiImageLine className="w-6 h-6 text-gray-400" />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <RiPencilLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Edit Image Details
                      </h4>
                    </div>
                    <div>
                      <Label htmlFor="edit-title" required className="text-xs text-blue-700 dark:text-blue-300">
                        Title
                      </Label>
                      <Input
                        id="edit-title"
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Image title"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* Description field */}
                <div>
                  <Label htmlFor="edit-desc" className="text-xs text-blue-700 dark:text-blue-300">
                    Description (shown on hover in the photo corral)
                  </Label>
                  <Input
                    id="edit-desc"
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="e.g. Students showing off their watercolor paintings"
                    disabled={saving}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RiArrowGoBackLine className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving || !editTitle.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RiCheckLine className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Add Images
        </h4>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <RiUploadCloudLine className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, GIF, WebP -- up to {MAX_FILES} images at a time
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            You can add titles and descriptions after uploading
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

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Selected ({selectedFiles.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="relative group w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <img
                    src={filePreviews[i] || ""}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(i);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && progress && (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {progress.current}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {progress.completed}/{progress.total}
              </p>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
              isLoading={uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Image(s)`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFiles([]);
                reset();
              }}
              disabled={uploading}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageImageSection;
