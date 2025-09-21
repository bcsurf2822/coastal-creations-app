import { ReactElement } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";

interface ReservationBasicFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationBasicFields = ({
  formData,
  actions,
  errors,
}: ReservationBasicFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reservation Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.eventName}
          onChange={(e) => actions.handleInputChange("eventName", e.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter reservation name (e.g., After School Program)"
        />
        {errors.eventName && (
          <p className="text-red-600 text-sm mt-1">{errors.eventName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => actions.handleInputChange("description", e.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the reservation program..."
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
};

export default ReservationBasicFields;