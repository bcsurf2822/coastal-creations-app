import { ReactElement, useMemo } from "react";
import {
  ReservationFormState,
  ReservationFormActions,
  SlotDurationMinutes,
} from "../types/reservationForm.types";
import dayjs from "dayjs";

interface ReservationTimeSlotFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

interface GeneratedSlot {
  startTime: string;
  endTime: string;
  label: string;
}

// Slot duration options - 1, 2, or 4 hours only
const SLOT_DURATION_OPTIONS: { value: SlotDurationMinutes; label: string }[] = [
  { value: 60, label: "1 Hour" },
  { value: 120, label: "2 Hours" },
  { value: 240, label: "4 Hours" },
];

// Format time from 24h to 12h format
const formatTime12h = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Generate time slots based on operating hours and duration
const generateSlotPreview = (
  startTime: string | null,
  endTime: string | null,
  slotDurationMinutes: SlotDurationMinutes
): GeneratedSlot[] => {
  if (!startTime || !endTime) return [];

  const slots: GeneratedSlot[] = [];
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);

  let current = start;
  while (current.add(slotDurationMinutes, "minute").isSameOrBefore(end)) {
    const slotEnd = current.add(slotDurationMinutes, "minute");
    slots.push({
      startTime: current.format("HH:mm"),
      endTime: slotEnd.format("HH:mm"),
      label: `${formatTime12h(current.format("HH:mm"))} - ${formatTime12h(slotEnd.format("HH:mm"))}`,
    });
    current = slotEnd;
  }

  return slots;
};

// Calculate operating hours in minutes
const getOperatingMinutes = (
  startTime: string | null,
  endTime: string | null
): number => {
  if (!startTime || !endTime) return 0;
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  return end.diff(start, "minute");
};

const ReservationTimeSlotFields = ({
  formData,
  actions,
  errors,
}: ReservationTimeSlotFieldsProps): ReactElement => {
  const startTimeStr = formData.startTime?.format("HH:mm") || null;
  const endTimeStr = formData.endTime?.format("HH:mm") || null;

  // Calculate which durations are valid for the current operating hours
  const operatingMinutes = useMemo(
    () => getOperatingMinutes(startTimeStr, endTimeStr),
    [startTimeStr, endTimeStr]
  );

  // Check if a duration fits evenly into operating hours
  const isDurationValid = (duration: SlotDurationMinutes): boolean => {
    if (operatingMinutes === 0) return true;
    return operatingMinutes >= duration;
  };

  // Generate preview of slots (always enabled now)
  const slotPreview = useMemo(() => {
    return generateSlotPreview(
      startTimeStr,
      endTimeStr,
      formData.slotDurationMinutes
    );
  }, [startTimeStr, endTimeStr, formData.slotDurationMinutes]);

  // Show warning if slots don't divide evenly
  const hasUnevenSlots = useMemo(() => {
    if (operatingMinutes === 0) return false;
    return operatingMinutes % formData.slotDurationMinutes !== 0;
  }, [operatingMinutes, formData.slotDurationMinutes]);

  // Only show this section when timeType is "same"
  if (formData.timeType !== "same") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          Time slots are only available when using the same time for all days.
          Switch to &quot;Same time for all days&quot; to configure time slots.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Time Slot Configuration</h3>
        <p className="text-sm text-gray-500 mt-1">
          Clients will select from these time blocks when booking.
        </p>
      </div>

      {/* Slot Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slot Duration <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.slotDurationMinutes}
          onChange={(e) =>
            actions.handleInputChange(
              "slotDurationMinutes",
              Number(e.target.value) as SlotDurationMinutes
            )
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SLOT_DURATION_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={!isDurationValid(option.value)}
            >
              {option.label}
              {!isDurationValid(option.value) && " (exceeds operating hours)"}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          How long each bookable time slot will be
        </p>
        {errors.slotDurationMinutes && (
          <p className="text-red-600 text-sm mt-1">
            {errors.slotDurationMinutes}
          </p>
        )}
      </div>

      {/* Max Participants Per Slot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capacity Per Time Slot <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.maxParticipantsPerSlot}
          onChange={(e) =>
            actions.handleInputChange(
              "maxParticipantsPerSlot",
              Number(e.target.value)
            )
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select capacity per slot</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} participant{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Maximum number of people who can book each time slot
        </p>
        {errors.maxParticipantsPerSlot && (
          <p className="text-red-600 text-sm mt-1">
            {errors.maxParticipantsPerSlot}
          </p>
        )}
      </div>

      {/* Warning for uneven slots */}
      {hasUnevenSlots && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            Note: The operating hours ({Math.floor(operatingMinutes / 60)} hours{" "}
            {operatingMinutes % 60 > 0 ? `${operatingMinutes % 60} minutes` : ""})
            don&apos;t divide evenly by {formData.slotDurationMinutes / 60}-hour slots.
            Some time at the end of the day won&apos;t be bookable.
          </p>
        </div>
      )}

      {/* Slot Preview */}
      {slotPreview.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Time Slots Preview
          </h4>
          <p className="text-xs text-blue-700 mb-3">
            These are the time slots clients can book on each day:
          </p>
          <div className="flex flex-wrap gap-2">
            {slotPreview.map((slot, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {slot.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-3">
            {slotPreview.length} slot{slotPreview.length !== 1 ? "s" : ""} per day,
            {formData.maxParticipantsPerSlot > 0
              ? ` up to ${formData.maxParticipantsPerSlot} participant${formData.maxParticipantsPerSlot > 1 ? "s" : ""} each`
              : " (set capacity above)"}
          </p>
        </div>
      )}

      {/* No slots warning */}
      {slotPreview.length === 0 && startTimeStr && endTimeStr && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">
            No slots can be generated. The operating hours may be too short for the
            selected slot duration. Please adjust the start/end times or choose a
            shorter slot duration.
          </p>
        </div>
      )}

      {/* Info when times not set */}
      {(!startTimeStr || !endTimeStr) && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-600">
            Set the start and end times above to see the generated time slots.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationTimeSlotFields;
