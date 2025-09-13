import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseImageUploadOptions {
  eventName: string;
  apiEndpoint?: string;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = ({
  eventName,
  apiEndpoint = "/api/events/upload-image",
  onSuccess,
  onError,
}: UseImageUploadOptions) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!eventName) {
        const error = "Please enter an event name first";
        onError?.(error);
        return;
      }

      setIsImageUploading(true);
      setImageUploadStatus("Uploading image...");

      try {
        const formDataObj = new FormData();
        formDataObj.append("file", file);
        formDataObj.append("eventName", eventName);

        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formDataObj,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setUploadedImageUrl(data.imageUrl);
        setImageUploadStatus("Image uploaded successfully!");
        onSuccess?.(data.imageUrl);

        setTimeout(() => setImageUploadStatus(null), 3000);
      } catch (error) {
        console.error("[useImageUpload-handleImageUpload] Image upload failed:", error);
        const errorMessage = "Failed to upload image. Please try again.";
        setImageUploadStatus("Failed to upload image");
        onError?.(errorMessage);
      } finally {
        setIsImageUploading(false);
      }
    },
    [eventName, apiEndpoint, onSuccess, onError]
  );

  const handleImageDelete = useCallback(async () => {
    if (!uploadedImageUrl) return;

    const loadingToastId = toast.loading("Deleting image...");

    try {
      const response = await fetch(
        `/api/delete-image?imageUrl=${encodeURIComponent(uploadedImageUrl)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setUploadedImageUrl(null);
      toast.dismiss(loadingToastId);
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("[useImageUpload-handleImageDelete] Error deleting image:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to delete image");
    }
  }, [uploadedImageUrl]);

  const setImageUrl = useCallback((url: string | null) => {
    setUploadedImageUrl(url);
  }, []);

  return {
    uploadedImageUrl,
    isImageUploading,
    isImageLoading,
    imageUploadStatus,
    handleImageUpload,
    handleImageDelete,
    setImageUrl,
    setIsImageLoading,
  };
};