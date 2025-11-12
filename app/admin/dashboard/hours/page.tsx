"use client";

import { ReactElement, useState, useEffect } from "react";
import { RiTimeLine, RiSaveLine } from "react-icons/ri";
import type {
  HoursOfOperation,
  DayOfWeek,
  DaySchedule,
} from "@/types/hours";
import { generateTimeOptions } from "@/types/hours";

const timeOptions = generateTimeOptions();

const daysOfWeek: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const defaultDaySchedule: DaySchedule = {
  isClosed: false,
  hours: {
    open: "9:00 AM",
    close: "5:00 PM",
  },
};

export default function HoursPage(): ReactElement {
  const [hours, setHours] = useState<HoursOfOperation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHours = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/hours");

        if (response.ok) {
          const result = await response.json();
          console.log("[HOURS-PAGE-FETCH] Received result:", result);
          if (result.data) {
            console.log("[HOURS-PAGE-FETCH] Setting hours to:", result.data);
            setHours(result.data);
          } else {
            console.log("[HOURS-PAGE-FETCH] No data, using defaults");
            // Initialize with default hours if none exist
            const defaultHours: HoursOfOperation = {
              monday: defaultDaySchedule,
              tuesday: defaultDaySchedule,
              wednesday: defaultDaySchedule,
              thursday: defaultDaySchedule,
              friday: defaultDaySchedule,
              saturday: defaultDaySchedule,
              sunday: { ...defaultDaySchedule, isClosed: true },
            };
            setHours(defaultHours);
          }
        }
      } catch (error) {
        console.error("[HOURS-PAGE-FETCH] Error fetching hours:", error);
        setError("Failed to load business hours");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHours();
  }, []);

  const handleClosedToggle = (day: DayOfWeek): void => {
    if (!hours) return;

    setHours((prev) => {
      if (!prev) return prev;

      const currentDay = prev[day];
      const newIsClosed = !currentDay.isClosed;

      return {
        ...prev,
        [day]: {
          isClosed: newIsClosed,
          hours: newIsClosed
            ? undefined
            : currentDay.hours || { open: "9:00 AM", close: "5:00 PM" },
        },
      };
    });
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: "open" | "close",
    value: string
  ): void => {
    if (!hours) return;

    setHours((prev) => {
      if (!prev) return prev;

      const currentDay = prev[day];
      const currentHours = currentDay.hours || { open: "9:00 AM", close: "5:00 PM" };

      return {
        ...prev,
        [day]: {
          ...currentDay,
          hours: {
            ...currentHours,
            [field]: value,
          },
        },
      };
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!hours) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log("[HOURS-PAGE-SAVE] Saving hours:", hours);

      const response = await fetch("/api/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });

      if (!response.ok) {
        throw new Error("Failed to save hours");
      }

      const result = await response.json();
      console.log("[HOURS-PAGE-SAVE] Save result:", result);
      setHours(result.data);
      setSuccessMessage("Business hours saved successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("[HOURS-PAGE-SAVE] Error saving hours:", error);
      setError("Failed to save business hours. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Hours
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your studio&apos;s operating hours
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hours) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Hours
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your studio&apos;s operating hours
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 text-center py-10">
            <p className="text-red-500 dark:text-red-400">
              Failed to load business hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Business Hours
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your studio&apos;s operating hours. Allow up to five minutes for the Sanity update to complete.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const daySchedule = hours[day];
                return (
                  <div
                    key={day}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 gap-4"
                  >
                    <div className="flex items-center space-x-4 min-w-[140px]">
                      <RiTimeLine className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDayName(day)}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                      {daySchedule.isClosed ? (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          Closed
                        </span>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px]">
                              Open:
                            </label>
                            <select
                              value={daySchedule.hours?.open || "9:00 AM"}
                              onChange={(e) =>
                                handleTimeChange(day, "open", e.target.value)
                              }
                              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span className="hidden sm:inline text-gray-500 dark:text-gray-400">
                            -
                          </span>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px]">
                              Close:
                            </label>
                            <select
                              value={daySchedule.hours?.close || "5:00 PM"}
                              onChange={(e) =>
                                handleTimeChange(day, "close", e.target.value)
                              }
                              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={daySchedule.isClosed}
                        onChange={() => handleClosedToggle(day)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Closed
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <RiSaveLine className="w-4 h-4" />
                    <span>Save Hours</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
