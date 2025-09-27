import { ReactElement } from "react";
import { UsePrivateEventFormReturn } from "./types/privateEventForm.types";
import { usePrivateEventImagePreview } from "./hooks/usePrivateEventImagePreview";
import PrivateEventBasicFields from "./fields/PrivateEventBasicFields";
import PrivateEventPricingFields from "./fields/PrivateEventPricingFields";
import PrivateEventOptionsFields from "./fields/PrivateEventOptionsFields";
import PrivateEventImageUpload from "./fields/PrivateEventImageUpload";
import PrivateEventCardPreview from "./preview/PrivateEventCardPreview";

interface PrivateEventFormBaseProps {
  formHook: UsePrivateEventFormReturn;
  mode: "add" | "edit";
  onCancel?: () => void;
}

const PrivateEventFormBase = ({
  formHook,
  mode,
  onCancel,
}: PrivateEventFormBaseProps): ReactElement => {
  const { formData, errors, actions, isSubmitting, isImageUploading, handleSubmit, setIsImageUploading } = formHook;

  // Get preview URL for newly selected images
  const imagePreviewUrl = usePrivateEventImagePreview(formData.image);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          {mode === "add"
            ? "Create Private Event Offering"
            : "Edit Private Event Offering"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {mode === "add"
            ? "Create a new private event offering."
            : "Update the details for this private event offering."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          <PrivateEventBasicFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <PrivateEventPricingFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <PrivateEventOptionsFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <PrivateEventImageUpload
            formData={formData}
            actions={actions}
            errors={errors}
            onImageUploadStatusChange={setIsImageUploading}
          />

          {/* Live Preview */}
          <div className="space-y-4">
            <PrivateEventCardPreview
              formData={formData}
              imagePreviewUrl={imagePreviewUrl || undefined}
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error {mode === "add" ? "Creating" : "Updating"} Private
                    Event
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errors.submit}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isImageUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isImageUploading
              ? "Uploading Image..."
              : isSubmitting
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                  ? "Create Private Event"
                  : "Update Private Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivateEventFormBase;
