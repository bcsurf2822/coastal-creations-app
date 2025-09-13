import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";

interface EventReservationFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventReservationFields = ({
  formData,
  actions,
  errors,
}: EventReservationFieldsProps): ReactElement => {
  // Only render for reservation events
  if (formData.eventType !== "reservation") {
    return <></>;
  }

  const getFieldError = (fieldPath: string): string | null => {
    return errors[fieldPath] || null;
  };

  const handleCapacityChange = (value: string) => {
    const capacityValue = value ? parseInt(value, 10) : undefined;

    const updatedSettings = {
      dayPricing: formData.reservationSettings?.dayPricing || [
        { numberOfDays: 1, price: 75 },
      ],
      dailyCapacity: capacityValue,
    };

    actions.handleInputChange("reservationSettings", updatedSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Reservation Settings</h3>

      {/* Daily Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Capacity (Optional)
        </label>
        <select
          value={formData.reservationSettings?.dailyCapacity || ""}
          onChange={(e) => handleCapacityChange(e.target.value)}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No capacity limit</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} participant{num > 1 ? "s" : ""} per day
            </option>
          ))}
        </select>
        {getFieldError("reservationSettings.dailyCapacity") && (
          <p className="text-red-600 text-sm mt-1">
            {getFieldError("reservationSettings.dailyCapacity")}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventReservationFields;