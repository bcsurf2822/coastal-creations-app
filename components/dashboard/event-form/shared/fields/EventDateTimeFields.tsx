import { ReactElement, useRef } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { useTimeOptions } from "../hooks/useTimeOptions";
import { handleDateInputClick } from "../utils/formHelpers";

interface EventDateTimeFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventDateTimeFields = ({
  formData,
  actions,
  errors,
}: EventDateTimeFieldsProps): ReactElement => {
  const { generateTimeOptions } = useTimeOptions();
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const recurringEndDateInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => actions.handleInputChange("startDate", e.target.value)}
            ref={startDateInputRef}
            onClick={() => handleDateInputClick(startDateInputRef)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          {errors.startDate && (
            <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.startTime ? formData.startTime.format("HH:mm") : ""}
            onChange={(e) => actions.handleTimeChange(e, "startTime")}
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select start time</option>
            {generateTimeOptions()}
          </select>
          {errors.startTime && (
            <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.endTime ? formData.endTime.format("HH:mm") : ""}
            onChange={(e) => actions.handleTimeChange(e, "endTime")}
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select end time</option>
            {generateTimeOptions(
              true,
              formData.startTime ? formData.startTime.format("HH:mm") : undefined
            )}
          </select>
          {errors.endTime && (
            <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Recurring Events (not for artist events) */}
      {formData.eventType !== "artist" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isRecurring || false}
                onChange={(e) =>
                  actions.handleInputChange("isRecurring", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                This is a recurring event
              </label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurring Pattern <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recurringPattern || "weekly"}
                    onChange={(e) =>
                      actions.handleInputChange("recurringPattern", e.target.value)
                    }
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  {errors.recurringPattern && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.recurringPattern}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.recurringEndDate || ""}
                    onChange={(e) =>
                      actions.handleInputChange("recurringEndDate", e.target.value)
                    }
                    ref={recurringEndDateInputRef}
                    onClick={() => handleDateInputClick(recurringEndDateInputRef)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  {errors.recurringEndDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.recurringEndDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );
};

export default EventDateTimeFields;