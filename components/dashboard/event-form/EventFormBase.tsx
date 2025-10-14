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
    eventType: "class" | "camp" | "workshop" | "artist"
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
  const { formData, errors, actions, isSubmitting, handleSubmit } =
    useEventForm({ mode, eventId, initialData, onSuccess });

  // Get preview URL for newly selected images
  const imagePreviewUrl = useImagePreview(formData.image);

  const handleEventTypeChange = (
    eventType: "class" | "camp" | "workshop" | "artist"
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

          <EventImageUpload
            formData={formData}
            actions={actions}
            errors={errors}
            existingImageUrl={existingImageUrl}
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

          <EventDiscountFields
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
    </div>
  );
};

export default EventFormBase;
