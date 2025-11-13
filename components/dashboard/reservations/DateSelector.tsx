"use client";

import { ReactElement } from "react";
import { RiCalendarEventLine } from "react-icons/ri";
import { Customer, ParticipantForDate } from "./types";

interface DateSelectorProps {
  customers: Customer[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  getParticipantsForDate: (dateStr: string) => ParticipantForDate[];
}

export default function DateSelector({
  customers,
  selectedDate,
  onDateSelect,
  getParticipantsForDate,
}: DateSelectorProps): ReactElement {
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAllUniqueDates = (): string[] => {
    const dates = new Set<string>();
    customers.forEach((customer) => {
      customer.selectedDates?.forEach((dateInfo) => {
        const dateStr = new Date(dateInfo.date).toISOString().split("T")[0];
        dates.add(dateStr);
      });
    });
    return Array.from(dates).sort();
  };

  const uniqueDates = getAllUniqueDates();

  if (uniqueDates.length === 0) {
    return <></>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        View Participants by Date
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDateSelect(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDate === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All Bookings
        </button>
        {uniqueDates.map((dateStr) => {
          const participantsForDate = getParticipantsForDate(dateStr);
          const totalForDate = participantsForDate.reduce(
            (sum, p) => sum + p.numberOfParticipants,
            0
          );
          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDate === dateStr
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <RiCalendarEventLine className="w-4 h-4" />
                <span>{formatDate(dateStr)}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                  {totalForDate}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
