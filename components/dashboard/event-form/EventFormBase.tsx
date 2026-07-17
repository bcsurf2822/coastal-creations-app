import { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { EventFormProps, EventFormState } from "./shared/types/eventForm.types";
import { useEventForm } from "./shared/hooks/useEventForm";
import { useImagePreview } from "./shared/hooks/useImagePreview";
import EventBasicFields from "./shared/fields/EventBasicFields";
import EventDateTimeFields from "./shared/fields/EventDateTimeFields";
import EventPricingFields from "./shared/fields/EventPricingFields";
import EventImageUpload from "./shared/fields/EventImageUpload";
import EventInstagramField from "./shared/fields/EventInstagramField";
import EventOptionsFields from "./shared/fields/EventOptionsFields";
import EventDiscountFields from "./shared/fields/EventDiscountFields";
import EventCardPreview from "./shared/preview/EventCardPreview";

interface EventFormBaseProps extends EventFormProps {
  title: string;
  existingImageUrl?: string | null;
  initialData?: EventFormState;
  onEventTypeChange?: (
    eventType: "adult-class" | "kid-class" | "event" | "camp" | "artist",
  ) => void;
}

const EventFormBase = ({
  mode,
  eventId,
  title,
  existingImageUrl,
  initialData,
  onSuccess,
  onCancel,
  onEventTypeChange,
}: EventFormBaseProps): ReactElement => {
  const router = useRouter();
  const {
    formData,
    errors,
    actions,
    isSubmitting,
    handleSubmit,
    discountWarning,
    confirmDiscountSubmit,
    cancelDiscountSubmit,
  } = useEventForm({ mode, eventId, initialData, onSuccess });

  // Get preview URL for newly selected images
  const imagePreviewUrl = useImagePreview(formData.image);

  const handleEventTypeChange = (
    eventType: "adult-class" | "kid-class" | "event" | "camp" | "artist",
  ) => {
    if (onEventTypeChange) {
      onEventTypeChange(eventType);
    }
    actions.handleInputChange("eventType", eventType);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="bg-white rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <EventBasicFields
            formData={formData}
            actions={actions}
            errors={errors}
            onEventTypeChange={handleEventTypeChange}
          />

          <EventDateTimeFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <EventPricingFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          {/* Discount fields directly after pricing for clear price preview */}
          <EventDiscountFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <EventImageUpload
            formData={formData}
            actions={actions}
            errors={errors}
            existingImageUrl={existingImageUrl}
            autosaveEventId={mode === "edit" ? eventId : undefined}
          />

          <EventInstagramField
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <EventOptionsFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          {/* Live Preview */}
          <div className="space-y-4">
            <EventCardPreview
              formData={formData}
              imagePreviewUrl={
                imagePreviewUrl ||
                formData.imageUrl ||
                existingImageUrl ||
                undefined
              }
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 cursor-pointer hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? `${mode === "add" ? "Creating" : "Updating"}...`
                : `${mode === "add" ? "Create" : "Update"} Event`}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        /* Hide the spinner for number inputs */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Discount Warning Confirmation Modal */}
      {discountWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Warning</h3>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              The discount set reduces the event price by{" "}
              <span className="font-bold text-amber-700">
                {discountWarning.discountPercent}%
              </span>
              . Please confirm.
            </p>

            <div className="mb-6 rounded-md bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original Price:</span>
                <span className="font-medium text-gray-800">
                  ${discountWarning.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discount:</span>
                <span className="font-medium text-red-600">
                  -${discountWarning.discountValue.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-700">Final Price:</span>
                <span className="font-bold text-gray-900">
                  ${discountWarning.discountedPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelDiscountSubmit}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={confirmDiscountSubmit}
                className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Confirm Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFormBase;
