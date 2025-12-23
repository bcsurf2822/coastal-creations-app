"use client";

import { ReactElement } from "react";
import { DayCardProps } from "./types";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function DayCard({
  date,
  isToday,
  isSelected,
  isDisabled,
  isExcluded,
  availability,
  startTime,
  endTime,
  timeSlots,
  selectedTimeSlot,
  onSelect,
  participantCount = 0,
  onParticipantChange,
  onTimeSlotSelect,
}: DayCardProps): ReactElement {
  const formatDay = (d: Date): string =>
    d.toLocaleDateString("en-US", { weekday: "long" });
  const formatDate = (d: Date): number => d.getDate();
  const formatMonth = (d: Date): string =>
    d.toLocaleDateString("en-US", { month: "short" });

  const formatTime = (time24: string | undefined): string => {
    if (!time24 || time24.trim() === "") return "";
    const parts = time24.split(":");
    if (parts.length !== 2) return "";
    const [hours, minutes] = parts;
    if (!hours || !minutes) return "";
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return "";
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const availableSpots = availability.max - availability.current;
  const isSoldOut = availableSpots <= 0;

  const handleParticipantSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    e.stopPropagation();
    const value = parseInt(e.target.value);
    if (!isNaN(value) && onParticipantChange) {
      onParticipantChange(value);
    }
  };

  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>): void => {
    e.stopPropagation();
  };

  // Determine if we need extra height for time slots
  const hasTimeSlotsToShow = isSelected && timeSlots && timeSlots.length > 0;
  const hasTimeSlots = timeSlots && timeSlots.length > 0;

  return (
    <div
      onClick={!isDisabled && !isExcluded && !isSoldOut ? onSelect : undefined}
      className={`
        min-w-[320px] max-w-[320px]
        ${hasTimeSlotsToShow ? "min-h-[580px]" : hasTimeSlots ? "min-h-[280px]" : "min-h-[320px]"}
        border-2 rounded-xl flex flex-col
        transition-all duration-300
        ${isToday ? "bg-blue-300" : "bg-gray-100"}
        ${isSelected ? "ring-4 ring-blue-400 border-blue-400 shadow-lg" : "border-gray-200"}
        ${
          isDisabled || isExcluded || isSoldOut
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-xl hover:border-blue-300 hover:scale-[1.02] cursor-pointer"
        }
      `}
    >
      {/* Header */}
      <div
        className={`text-center py-4 ${
          isToday ? "bg-blue-300 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <p
          className={`${ebGaramond.className} text-lg font-medium ${
            isToday ? "text-white" : "text-black"
          }`}
        >
          {formatDay(date)}
        </p>
        <p
          className={`${ebGaramond.className} text-sm uppercase tracking-wider ${
            isToday ? "text-white/90" : "text-black/80"
          }`}
        >
          {formatMonth(date)}
        </p>
        <p
          className={`${ebGaramond.className} text-3xl font-bold mt-1 ${
            isToday ? "text-white" : "text-black"
          }`}
        >
          {formatDate(date)}
        </p>
      </div>

      {/* Body */}
      <div className="p-4 bg-white flex-1 flex flex-col">
        <div>
          {/* Show time slot count when time slots are available but not selected */}
          {hasTimeSlots && !isSelected && (
            <>
              <p
                className={`${ebGaramond.className} text-sm text-gray-600 font-medium`}
              >
                Available Time Slots:
              </p>
              <p className={`${ebGaramond.className} text-xl font-bold mt-1`}>
                {timeSlots.filter(s => s.isAvailable && s.maxParticipants - s.currentBookings > 0).length} of {timeSlots.length}
              </p>
              <p className={`${ebGaramond.className} text-xs text-gray-500 mt-1`}>
                Click to select a time
              </p>
            </>
          )}

          {/* Show regular availability when no time slots */}
          {!hasTimeSlots && (
            <>
              <p
                className={`${ebGaramond.className} text-sm text-gray-600 font-medium`}
              >
                Available Spots:
              </p>
              <p className={`${ebGaramond.className} text-xl font-bold mt-1`}>
                {availableSpots} / {availability.max}
              </p>
            </>
          )}

          {/* Display custom time if available (for custom time type without slots) */}
          {startTime && !hasTimeSlots && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p
                className={`${ebGaramond.className} text-sm text-gray-600 font-medium`}
              >
                Time:
              </p>
              <p className={`${ebGaramond.className} text-base font-bold mt-1 text-blue-600`}>
                {formatTime(startTime)}
                {endTime && ` - ${formatTime(endTime)}`}
              </p>
            </div>
          )}

          {isSoldOut && !hasTimeSlots && (
            <p
              className={`${ebGaramond.className} text-red-500 font-bold mt-2`}
            >
              Sold Out
            </p>
          )}
          {isExcluded && (
            <p
              className={`${ebGaramond.className} text-gray-500 font-medium mt-2 text-sm`}
            >
              Not Available
            </p>
          )}
        </div>

        {/* Time Slot Picker (when time slots are enabled) */}
        {isSelected && timeSlots && timeSlots.length > 0 && onTimeSlotSelect && onParticipantChange && (
          <TimeSlotPicker
            timeSlots={timeSlots}
            selectedSlot={selectedTimeSlot}
            onSlotSelect={onTimeSlotSelect}
            participantCount={participantCount}
            onParticipantChange={onParticipantChange}
          />
        )}

        {/* Regular Participant select (when time slots are NOT enabled) */}
        {isSelected && onParticipantChange && !isSoldOut && (!timeSlots || timeSlots.length === 0) && (
          <div className="mt-4">
            <label
              className={`${ebGaramond.className} block text-sm font-bold mb-2 text-gray-700`}
            >
              Participants:
            </label>
            <select
              value={participantCount}
              onChange={handleParticipantSelectChange}
              onClick={handleSelectClick}
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
            <p
              className={`${ebGaramond.className} text-xs text-gray-500 mt-1`}
            >
              Max: {availableSpots}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
