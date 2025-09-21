import { ReactElement } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
import { useTimeOptions } from "../../../event-form/shared/hooks/useTimeOptions";

interface ReservationDateTimeFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationDateTimeFields = ({
  formData,
  actions,
  errors,
}: ReservationDateTimeFieldsProps): ReactElement => {
  const { generateTimeOptions } = useTimeOptions();
  const startTimeOptions = generateTimeOptions();
  const endTimeOptions = generateTimeOptions(true, formData.startTime);

  const handleExcludeDateAdd = () => {
    const dateInput = document.getElementById("exclude-date-input") as HTMLInputElement;
    if (dateInput?.value) {
      actions.addExcludeDate(dateInput.value);
      dateInput.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Schedule & Dates</h3>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => actions.handleInputChange("startDate", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.endDate || ""}
            onChange={(e) => actions.handleInputChange("endDate", e.target.value || undefined)}
            min={formData.startDate}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.startTime?.format("HH:mm") || ""}
            onChange={(e) => actions.handleTimeChange(e, "startTime")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select start time</option>
            {startTimeOptions}
          </select>
          {errors.startTime && (
            <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.endTime?.format("HH:mm") || ""}
            onChange={(e) => actions.handleTimeChange(e, "endTime")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select end time</option>
            {endTimeOptions}
          </select>
          {errors.endTime && (
            <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Exclude Dates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exclude Specific Dates (Optional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="date"
              id="exclude-date-input"
              min={formData.startDate}
              max={formData.endDate}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleExcludeDateAdd}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Add
            </button>
          </div>

          {formData.excludeDates.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Excluded dates:</p>
              {formData.excludeDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => actions.removeExcludeDate(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Add dates when the program will not be available (holidays, breaks, etc.)
        </p>
      </div>
    </div>
  );
};

export default ReservationDateTimeFields;