import { ReactElement, useRef } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
import { useImageUpload } from "../../../event-form/shared/hooks/useImageUpload";

interface ReservationImageUploadProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
  existingImageUrl?: string | null;
}

const ReservationImageUpload = ({
  formData,
  actions,
  errors,
  existingImageUrl,
}: ReservationImageUploadProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileSelect, isUploading } = useImageUpload({
    onFileSelect: actions.handleFileChange,
  });

  const displayImage = formData.imageUrl || existingImageUrl;

  const handleRemoveImage = () => {
    actions.handleInputChange("image", undefined);
    actions.handleInputChange("imageUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="image-upload"
          checked={Boolean(displayImage)}
          onChange={(e) => {
            if (!e.target.checked) {
              handleRemoveImage();
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
          Add Image to Reservation
        </label>
      </div>

      {displayImage && (
        <div className="space-y-4 border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-gray-900">Reservation Image</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.image && (
              <p className="text-red-600 text-sm mt-1">{errors.image}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 800x600 pixels or larger. JPG, PNG, or WebP format.
            </p>
          </div>

          {displayImage && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <div className="relative inline-block">
                <img
                  src={displayImage}
                  alt="Reservation preview"
                  className="max-w-sm max-h-48 object-cover rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Uploading image...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationImageUpload;