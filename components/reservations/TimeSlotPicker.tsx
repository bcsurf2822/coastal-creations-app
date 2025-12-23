"use client";

import { ReactElement } from "react";
import { TimeSlot } from "./types";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlot?: { startTime: string; endTime: string };
  onSlotSelect: (slot: { startTime: string; endTime: string } | null) => void;
  participantCount: number;
  onParticipantChange: (count: number) => void;
}

// Format time from 24h to 12h format
const formatTime12h = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function TimeSlotPicker({
  timeSlots,
  selectedSlot,
  onSlotSelect,
  participantCount,
  onParticipantChange,
}: TimeSlotPickerProps): ReactElement {
  const handleSlotClick = (slot: TimeSlot): void => {
    if (!slot.isAvailable || slot.maxParticipants - slot.currentBookings <= 0) {
      return;
    }

    // Toggle selection
    if (
      selectedSlot?.startTime === slot.startTime &&
      selectedSlot?.endTime === slot.endTime
    ) {
      onSlotSelect(null);
    } else {
      onSlotSelect({ startTime: slot.startTime, endTime: slot.endTime });
    }
  };

  const handleParticipantChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    e.stopPropagation();
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      onParticipantChange(value);
    }
  };

  // Get the selected slot's available spots
  const getSelectedSlotAvailability = (): number => {
    if (!selectedSlot) return 0;
    const slot = timeSlots.find(
      (s) =>
        s.startTime === selectedSlot.startTime &&
        s.endTime === selectedSlot.endTime
    );
    return slot ? slot.maxParticipants - slot.currentBookings : 0;
  };

  const availableSpots = getSelectedSlotAvailability();

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p
        className={`${ebGaramond.className} text-sm text-gray-600 font-medium mb-2`}
      >
        Select a Time Slot:
      </p>

      {/* Time Slots Grid */}
      <div className="space-y-2">
        {timeSlots.map((slot, index) => {
          const spotsRemaining = slot.maxParticipants - slot.currentBookings;
          const isSoldOut = spotsRemaining <= 0 || !slot.isAvailable;
          const isSelected =
            selectedSlot?.startTime === slot.startTime &&
            selectedSlot?.endTime === slot.endTime;

          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSlotClick(slot);
              }}
              disabled={isSoldOut}
              className={`
                w-full px-3 py-2 rounded-md text-left transition-all
                ${
                  isSelected
                    ? "bg-blue-500 text-white ring-2 ring-blue-300"
                    : isSoldOut
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                }
                border ${isSelected ? "border-blue-500" : "border-gray-200"}
              `}
            >
              <div className="flex justify-between items-center">
                <span className={`${ebGaramond.className} font-medium`}>
                  {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                </span>
                <span
                  className={`${ebGaramond.className} text-xs ${
                    isSoldOut
                      ? "text-red-400"
                      : isSelected
                        ? "text-blue-100"
                        : "text-gray-500"
                  }`}
                >
                  {isSoldOut
                    ? "Sold Out"
                    : `${spotsRemaining} spot${spotsRemaining !== 1 ? "s" : ""}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Participant Selector (shown when slot is selected) */}
      {selectedSlot && availableSpots > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label
            className={`${ebGaramond.className} block text-sm font-bold mb-2 text-gray-700`}
          >
            Participants:
          </label>
          <select
            value={participantCount}
            onChange={handleParticipantChange}
            onClick={(e) => e.stopPropagation()}
            className={`${ebGaramond.className} w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white cursor-pointer`}
          >
            {Array.from({ length: availableSpots }, (_, i) => i + 1).map(
              (num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "participant" : "participants"}
                </option>
              )
            )}
          </select>
          <p className={`${ebGaramond.className} text-xs text-gray-500 mt-1`}>
            Max: {availableSpots}
          </p>
        </div>
      )}

      {/* No available slots message */}
      {timeSlots.length === 0 && (
        <p className={`${ebGaramond.className} text-sm text-gray-500`}>
          No time slots available for this day.
        </p>
      )}
    </div>
  );
}
