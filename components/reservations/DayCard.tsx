"use client";

import { ReactElement } from "react";
import { DayCardProps } from "./types";
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
  onSelect,
  participantCount = 0,
  onParticipantChange,
}: DayCardProps): ReactElement {
  const formatDay = (d: Date): string =>
    d.toLocaleDateString("en-US", { weekday: "long" });
  const formatDate = (d: Date): number => d.getDate();
  const formatMonth = (d: Date): string =>
    d.toLocaleDateString("en-US", { month: "short" });

  const formatTime = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const availableSpots = availability.max - availability.current;
  const isSoldOut = availableSpots <= 0;

  const handleParticipantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e.stopPropagation();
    const value = parseInt(e.target.value);
    if (!isNaN(value) && onParticipantChange) {
      const validValue = Math.max(1, Math.min(value, availableSpots));
      onParticipantChange(validValue);
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>): void => {
    e.stopPropagation();
  };

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled || isExcluded || isSoldOut}
      className={`
        min-w-[240px] max-w-[240px] h-[380px]
        border-2 rounded-lg flex flex-col
        transition-all duration-300
        ${isToday ? "bg-blue-300" : "bg-gray-100"}
        ${isSelected ? "ring-4 ring-blue-500 border-blue-500" : "border-gray-200"}
        ${isDisabled || isExcluded || isSoldOut ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg cursor-pointer"}
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
      <div className="p-5 bg-white flex-1 flex flex-col justify-between">
        <div>
          <p
            className={`${ebGaramond.className} text-sm text-gray-600 font-medium`}
          >
            Available Spots:
          </p>
          <p className={`${ebGaramond.className} text-xl font-bold mt-1`}>
            {availableSpots} / {availability.max}
          </p>

          {/* Display custom time if available */}
          {startTime && (
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

          {isSoldOut && (
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

        {/* Participant input if selected */}
        {isSelected && onParticipantChange && !isSoldOut && (
          <div className="mt-4">
            <label
              className={`${ebGaramond.className} block text-sm font-bold mb-2 text-gray-700`}
            >
              Participants:
            </label>
            <input
              type="number"
              min="1"
              max={availableSpots}
              value={participantCount}
              onChange={handleParticipantInputChange}
              onClick={handleInputClick}
              className={`${ebGaramond.className} w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
            />
            <p
              className={`${ebGaramond.className} text-xs text-gray-500 mt-1`}
            >
              Max: {availableSpots}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}
