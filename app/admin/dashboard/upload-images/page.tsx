"use client";

import { useState, useMemo, type ReactElement } from "react";
import { useGalleryManagement } from "@/components/dashboard/upload-images/hooks/useGalleryManagement";
import { filterGalleryItemsByDestination } from "@/lib/utils/galleryHelpers";
import GalleryUploadForm from "@/components/dashboard/upload-images/GalleryUploadForm";
import DestinationFilter from "@/components/dashboard/upload-images/DestinationFilter";
import GalleryGrid from "@/components/dashboard/upload-images/GalleryGrid";
import EditGalleryModal from "@/components/dashboard/upload-images/EditGalleryModal";
import DeleteConfirmation from "@/components/dashboard/upload-images/DeleteConfirmation";
import type { PictureGalleryItem, GalleryDestination } from "@/types/interfaces";
import { RiImageLine, RiSearchLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

export default function UploadImagesPage(): ReactElement {
  const {
    images: allImages,
    loading,
    error,
    updateGalleryItem,
    deleteGalleryItem,
    refetch,
  } = useGalleryManagement();

  const [selectedDestinations, setSelectedDestinations] = useState<GalleryDestination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingImage, setEditingImage] = useState<PictureGalleryItem | null>(null);
  const [deletingImage, setDeletingImage] = useState<PictureGalleryItem | null>(null);

  // Filter images by destinations and search query
  const filteredImages = useMemo(() => {
    let filtered = allImages;

    // Filter by destinations
    if (selectedDestinations.length > 0) {
      filtered = filterGalleryItemsByDestination(filtered, selectedDestinations);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.title.toLowerCase().includes(query) ||
          img.description?.toLowerCase().includes(query) ||
          img.destination.some((dest) => dest.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allImages, selectedDestinations, searchQuery]);

  const handleUploadSuccess = (): void => {
    console.log("[UploadImagesPage] Upload successful, refetching images");
    refetch();
  };

  const handleEdit = (image: PictureGalleryItem): void => {
    setEditingImage(image);
  };

  const handleDelete = (image: PictureGalleryItem): void => {
    setDeletingImage(image);
  };

  const handleSaveEdit = async (updateData: {
    id: string;
    title: string;
    description?: string;
    destinations: GalleryDestination[];
  }): Promise<boolean> => {
    console.log("[UploadImagesPage] Saving edit", updateData);

    const success = await updateGalleryItem(updateData);

    if (success) {
      toast.success("Image updated successfully");
      setEditingImage(null);
      return true;
    } else {
      toast.error("Failed to update image");
      return false;
    }
  };

  const handleConfirmDelete = async (imageId: string): Promise<boolean> => {
    console.log("[UploadImagesPage] Deleting image", { imageId });

    const success = await deleteGalleryItem(imageId);

    if (success) {
      toast.success("Image deleted successfully");
      setDeletingImage(null);
      return true;
    } else {
      toast.error("Failed to delete image");
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <RiImageLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gallery Management
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Upload, organize, and manage images for your gallery destinations
          </p>
        </div>

        {/* Upload Form */}
        <div className="mb-8">
          <GalleryUploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6">
          <DestinationFilter
            selectedDestinations={selectedDestinations}
            onDestinationChange={setSelectedDestinations}
            allImages={allImages}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or destination..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredImages.length} of {allImages.length} images
              {selectedDestinations.length > 0 &&
                ` (filtered by ${selectedDestinations.length} destination${selectedDestinations.length > 1 ? "s" : ""})`}
              {searchQuery.trim() && " (search active)"}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <GalleryGrid
          images={filteredImages}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* No results message */}
        {!loading && allImages.length > 0 && filteredImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <RiImageLine className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No images match your filters
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
              Try adjusting your destination filter or search query to see more results.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDestinations([]);
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditGalleryModal
        image={editingImage}
        isOpen={editingImage !== null}
        onClose={() => setEditingImage(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        image={deletingImage}
        isOpen={deletingImage !== null}
        onClose={() => setDeletingImage(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
