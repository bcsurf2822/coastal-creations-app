import { ReactElement, useLayoutEffect } from "react";
import Image from "next/image";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { useImageUpload } from "../hooks/useImageUpload";

interface EventImageUploadProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
  existingImageUrl?: string | null;
}

const EventImageUpload = ({
  formData,
  actions,
  errors,
  existingImageUrl,
}: EventImageUploadProps): ReactElement => {
  const {
    uploadedImageUrl,
    isImageUploading,
    isImageLoading,
    imageUploadStatus,
    handleImageUpload,
    handleImageDelete,
    setImageUrl,
    setIsImageLoading,
  } = useImageUpload({
    eventName: formData.eventName,
    onSuccess: (imageUrl) => {
      actions.handleInputChange("imageUrl", imageUrl);
    },
    onError: () => {
      // Error handling is done in the hook
    },
  });

  // Seed the local image state from the event's saved image once (edit
  // mode). Keyed only on existingImageUrl, which is set once per event load
  // and never changes again during the session — so this can't re-fire (and
  // silently undo an explicit delete) just because uploadedImageUrl went
  // back to null. useLayoutEffect keeps the timing identical to the old
  // render-body assignment (no flash of the empty state on mount).
  useLayoutEffect(() => {
    if (existingImageUrl) {
      setImageUrl(existingImageUrl);
    }
  }, [existingImageUrl, setImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      actions.handleInputChange("image", file);
      if (formData.eventName) {
        handleImageUpload(file);
      }
    }
  };

  // uploadedImageUrl is now the single source of truth (seeded from
  // existingImageUrl above): null means "no image" — including right after
  // a delete — rather than falling back to the stale existingImageUrl prop.
  const displayImageUrl = uploadedImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Event Image (Optional){" "}
      </label>

      <div className="flex items-center gap-4">
        {/* Image thumbnail or placeholder */}
        <div className="flex-shrink-0">
          {displayImageUrl ? (
            <div className="relative">
              <Image
                src={displayImageUrl}
                alt="Event thumbnail"
                width={80}
                height={80}
                className="w-20 h-20 rounded-md object-cover border border-gray-300"
                onLoad={() => setIsImageLoading(false)}
                onLoadStart={() => setIsImageLoading(true)}
              />
              <button
                type="button"
                onClick={handleImageDelete}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg"
                title="Delete image"
              >
                ×
              </button>
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-md">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Upload button and status */}
        <div className="flex-1">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            {isImageUploading
              ? "Uploading..."
              : displayImageUrl
                ? "Change Image"
                : "Select Image"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isImageUploading}
            />
          </label>

          {imageUploadStatus && (
            <p
              className={`text-sm mt-1 ${
                imageUploadStatus.includes("successfully")
                  ? "text-green-600"
                  : imageUploadStatus.includes("Failed")
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {imageUploadStatus}
            </p>
          )}

          {errors.image && (
            <p className="text-red-600 text-sm mt-1">{errors.image}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventImageUpload;
