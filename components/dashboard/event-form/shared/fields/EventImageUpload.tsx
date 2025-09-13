import { ReactElement } from "react";
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

  // Set existing image URL if provided (for edit mode)
  if (existingImageUrl && !uploadedImageUrl) {
    setImageUrl(existingImageUrl);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      actions.handleInputChange("image", file);
      if (formData.eventName) {
        handleImageUpload(file);
      }
    }
  };

  const displayImageUrl = uploadedImageUrl || existingImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Event Image
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
        {displayImageUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={displayImageUrl}
                alt="Event preview"
                width={400}
                height={256}
                className="max-w-full h-auto max-h-64 mx-auto rounded-md object-contain"
                onLoad={() => setIsImageLoading(false)}
                onLoadStart={() => setIsImageLoading(true)}
              />
              <button
                type="button"
                onClick={handleImageDelete}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg"
                title="Delete image"
              >
                ×
              </button>
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-md">
                  <div className="text-blue-600">Loading image...</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-6xl text-gray-400 mb-4">📷</div>
            <p className="text-gray-500 mb-4">Upload an image for your event</p>
          </>
        )}

        <div className="mt-4">
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
            {isImageUploading ? "Uploading..." : "Choose File"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isImageUploading}
            />
          </label>
        </div>

        {imageUploadStatus && (
          <p
            className={`text-sm mt-2 ${
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
          <p className="text-red-600 text-sm mt-2">{errors.image}</p>
        )}
      </div>
    </div>
  );
};

export default EventImageUpload;