"use client";
import { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ReservationFormProps,
  ReservationFormState,
} from "./shared/types/reservationForm.types";
import { useReservationForm } from "./shared/hooks/useReservationForm";
import ReservationBasicFields from "./shared/fields/ReservationBasicFields";
import ReservationDateTimeFields from "./shared/fields/ReservationDateTimeFields";
import ReservationTimeSlotFields from "./shared/fields/ReservationTimeSlotFields";
import ReservationPricingFields from "./shared/fields/ReservationPricingFields";
// import ReservationImageUpload from "./shared/fields/ReservationImageUpload";
import ReservationOptionsFields from "./shared/fields/ReservationOptionsFields";
import ReservationDiscountFields from "./shared/fields/ReservationDiscountFields";

interface ReservationFormBaseProps extends ReservationFormProps {
  title: string;
  existingImageUrl?: string | null;
  initialData?: ReservationFormState;
}

const ReservationFormBase = ({
  mode,
  reservationId,
  title,
  // existingImageUrl,
  initialData,
  onSuccess,
  onCancel,
}: ReservationFormBaseProps): ReactElement => {
  const router = useRouter();
  const { formData, errors, actions, isSubmitting, handleSubmit } =
    useReservationForm({ mode, reservationId, initialData, onSuccess });

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
          <ReservationBasicFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <ReservationDateTimeFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <ReservationTimeSlotFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <ReservationPricingFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          {/* <ReservationImageUpload
            formData={formData}
            actions={actions}
            errors={errors}
            existingImageUrl={existingImageUrl}
          /> */}

          <ReservationOptionsFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          <ReservationDiscountFields
            formData={formData}
            actions={actions}
            errors={errors}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? `${mode === "add" ? "Creating" : "Updating"}...`
                : `${mode === "add" ? "Create" : "Update"} Reservation`}
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

export default ReservationFormBase;
