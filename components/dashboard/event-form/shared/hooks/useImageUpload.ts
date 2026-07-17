import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseImageUploadOptions {
  eventName: string;
  apiEndpoint?: string;
  onSuccess?: (imageUrl: string | null) => void;
  onError?: (error: string) => void;
  // When set (edit mode, existing event), upload/delete immediately PATCH
  // this event's image field instead of waiting for the form's own Save —
  // every other field still requires the explicit Update Event click.
  autosaveEventId?: string;
}

export const useImageUpload = ({
  eventName,
  apiEndpoint = "/api/upload-image",
  onSuccess,
  onError,
  autosaveEventId,
}: UseImageUploadOptions) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  const persistImageToEvent = useCallback(
    async (imageUrl: string | null): Promise<boolean> => {
      if (!autosaveEventId) return true;

      try {
        const response = await fetch(`/api/event/${autosaveEventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageUrl }),
        });
        if (!response.ok) {
          throw new Error("Failed to save image to event");
        }
        return true;
      } catch (error) {
        console.error(
          "[useImageUpload-persistImageToEvent] Failed to autosave image:",
          error
        );
        return false;
      }
    },
    [autosaveEventId]
  );

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
        formDataObj.append("title", eventName);

        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formDataObj,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setUploadedImageUrl(data.imageUrl);
        onSuccess?.(data.imageUrl);

        const saved = await persistImageToEvent(data.imageUrl);
        setImageUploadStatus(
          autosaveEventId
            ? saved
              ? "Image uploaded and saved to the event!"
              : "Image uploaded, but saving to the event failed — click Update Event to save it."
            : "Image uploaded successfully!"
        );
        if (autosaveEventId && !saved) {
          toast.error("Image uploaded, but couldn't be saved automatically. Click Update Event to save it.");
        }

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
    [eventName, apiEndpoint, onSuccess, onError, autosaveEventId, persistImageToEvent]
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
      onSuccess?.(null);

      const saved = await persistImageToEvent(null);
      toast.dismiss(loadingToastId);
      if (autosaveEventId && !saved) {
        toast.error("Image removed here, but couldn't be saved automatically. Click Update Event to save it.");
      } else {
        toast.success(
          autosaveEventId
            ? "Image deleted and saved to the event!"
            : "Image deleted successfully!"
        );
      }
    } catch (error) {
      console.error("[useImageUpload-handleImageDelete] Error deleting image:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to delete image");
    }
  }, [uploadedImageUrl, onSuccess, autosaveEventId, persistImageToEvent]);

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