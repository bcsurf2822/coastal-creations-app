import { ReactElement, useEffect } from "react";
import {
  ReservationFormState,
  ReservationFormActions,
} from "../types/reservationForm.types";
import { useTimeOptions } from "../../../event-form/shared/hooks/useTimeOptions";
import dayjs from "dayjs";

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
    const dateInput = document.getElementById(
      "exclude-date-input"
    ) as HTMLInputElement;
    if (dateInput?.value) {
      actions.addExcludeDate(dateInput.value);
      dateInput.value = "";
    }
  };

  // Generate days array when dates change
  useEffect(() => {
    if (
      formData.startDate &&
      formData.endDate &&
      formData.timeType === "custom"
    ) {
      const start = dayjs(formData.startDate);
      const end = dayjs(formData.endDate);
      const days: {
        date: string;
        startTime: dayjs.Dayjs | null;
        endTime: dayjs.Dayjs | null;
      }[] = [];

      let current = start;
      while (current.isBefore(end.add(1, "day"))) {
        const dateStr = current.format("YYYY-MM-DD");

        // Check if this date is excluded
        if (!formData.excludeDates.includes(dateStr)) {
          // Find existing custom time for this date
          const existing = formData.customTimes.find(
            (ct) => ct.date === dateStr
          );
          days.push({
            date: dateStr,
            startTime: existing?.startTime || null,
            endTime: existing?.endTime || null,
          });
        }

        current = current.add(1, "day");
      }

      // Only update if the days array is different
      if (
        JSON.stringify(days.map((d) => d.date)) !==
        JSON.stringify(formData.customTimes.map((ct) => ct.date))
      ) {
        actions.handleInputChange("customTimes", days);
      }
    }
  }, [
    formData.startDate,
    formData.endDate,
    formData.timeType,
    formData.excludeDates,
    actions,
    formData.customTimes,
  ]);

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
            onChange={(e) =>
              actions.handleInputChange("startDate", e.target.value)
            }
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
            onChange={(e) =>
              actions.handleInputChange("endDate", e.target.value || undefined)
            }
            min={formData.startDate}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Time Configuration Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Configuration <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="same"
              checked={formData.timeType === "same"}
              onChange={(e) =>
                actions.handleInputChange("timeType", e.target.value)
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Same time for all days
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="custom"
              checked={formData.timeType === "custom"}
              onChange={(e) =>
                actions.handleInputChange("timeType", e.target.value)
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Custom times for each day
            </span>
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {formData.timeType === "same"
            ? "All days will have the same start and end time"
            : "You can set different times for each day"}
        </p>
      </div>

      {/* Same Time for All Days */}
      {formData.timeType === "same" && (
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
      )}

      {/* Custom Times for Each Day */}
      {formData.timeType === "custom" && formData.customTimes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set Times for Each Day <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
            {formData.customTimes.map((dayTime, index) => {
              const dayStartTimeOptions = generateTimeOptions();
              const dayEndTimeOptions = generateTimeOptions(
                true,
                dayTime.startTime
              );

              return (
                <div
                  key={dayTime.date}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-gray-700">
                      {dayjs(dayTime.date).format("ddd, MMM D, YYYY")}
                    </label>
                  </div>

                  <div>
                    <select
                      value={dayTime.startTime?.format("HH:mm") || ""}
                      onChange={(e) =>
                        actions.handleCustomTimeChange(index, "startTime", e)
                      }
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`customTimes.${index}.startTime`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Start time</option>
                      {dayStartTimeOptions}
                    </select>
                    {errors[`customTimes.${index}.startTime`] && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors[`customTimes.${index}.startTime`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      value={dayTime.endTime?.format("HH:mm") || ""}
                      onChange={(e) =>
                        actions.handleCustomTimeChange(index, "endTime", e)
                      }
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`customTimes.${index}.endTime`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">End time</option>
                      {dayEndTimeOptions}
                    </select>
                    {errors[`customTimes.${index}.endTime`] && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors[`customTimes.${index}.endTime`]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {formData.timeType === "custom" &&
        (!formData.startDate || !formData.endDate) && (
          <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
            Please select start and end dates to configure custom times for each
            day.
          </p>
        )}

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
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-sm">
                    {new Date(date).toLocaleDateString()}
                  </span>
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
          Dates to exclude from the current date range.
        </p>
      </div>
    </div>
  );
};

export default ReservationDateTimeFields;
