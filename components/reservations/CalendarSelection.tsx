"use client";

import { useState, useMemo, ReactElement, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SelectedDate, TimeSlot } from "./types";
import { DayCard } from "./DayCard";
import { BookingSummary } from "./BookingSummary";
import { IReservation } from "@/lib/models/Reservations";
import { EB_Garamond } from "next/font/google";
import { FaQuestionCircle } from "react-icons/fa";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

// Helper function to normalize dates to YYYY-MM-DD strings for comparison
const normalizeDateString = (date: string | Date): string => {
  return dayjs.tz(date, LOCAL_TIMEZONE).format("YYYY-MM-DD");
};

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface CalendarSelectionProps {
  reservation: IReservation;
}

export function CalendarSelection({
  reservation,
}: CalendarSelectionProps): ReactElement {
  const router = useRouter();
  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const startDate = new Date(reservation.dates.startDate);
    return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  });

  // Check if time slots are enabled for this reservation
  const hasTimeSlots = reservation.enableTimeSlots === true;

  // Create map of available dates from dailyAvailability
  const availableDatesMap = useMemo(() => {
    const map = new Map<
      string,
      {
        available: number;
        max: number;
        isAvailable: boolean;
        startTime?: string;
        endTime?: string;
        timeSlots?: TimeSlot[];
      }
    >();
    reservation.dailyAvailability.forEach((day) => {
      const dateKey = normalizeDateString(day.date);
      map.set(dateKey, {
        available: day.maxParticipants - day.currentBookings,
        max: day.maxParticipants,
        isAvailable: day.isAvailable,
        startTime: day.startTime,
        endTime: day.endTime,
        timeSlots: day.timeSlots as TimeSlot[] | undefined,
      });
    });
    return map;
  }, [reservation.dailyAvailability]);

  // Create set of excluded dates
  const excludedDatesSet = useMemo(() => {
    const set = new Set<string>();
    if (reservation.dates.excludeDates) {
      reservation.dates.excludeDates.forEach((date) => {
        const dateKey = normalizeDateString(date);
        set.add(dateKey);
      });
    }
    return set;
  }, [reservation.dates.excludeDates]);

  // Get dates for current month view
  const monthDates = useMemo(() => {
    const dates: Date[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // Only include dates that are in the reservation range
      const reservationStart = new Date(reservation.dates.startDate);
      const reservationEnd = reservation.dates.endDate
        ? new Date(reservation.dates.endDate)
        : reservationStart;

      if (date >= reservationStart && date <= reservationEnd) {
        dates.push(date);
      }
    }

    return dates;
  }, [currentMonth, reservation.dates]);

  const handleDateToggle = (date: Date): void => {
    const dateKey = normalizeDateString(date);

    const existing = selectedDates.find(
      (sd) => normalizeDateString(sd.date) === dateKey
    );

    if (existing) {
      // Deselect
      setSelectedDates(selectedDates.filter((sd) => sd !== existing));
    } else {
      // Select with default 1 participant (no time slot initially if time slots are enabled)
      setSelectedDates([...selectedDates, { date, participants: 1 }]);
    }
  };

  const handleParticipantChange = (date: Date, count: number): void => {
    const dateKey = normalizeDateString(date);

    setSelectedDates(
      selectedDates.map((sd) =>
        normalizeDateString(sd.date) === dateKey
          ? { ...sd, participants: count }
          : sd
      )
    );
  };

  // Handle time slot selection for a specific date
  const handleTimeSlotSelect = useCallback(
    (date: Date, slot: { startTime: string; endTime: string } | null): void => {
      const dateKey = normalizeDateString(date);

      setSelectedDates((prev) =>
        prev.map((sd) => {
          if (normalizeDateString(sd.date) !== dateKey) return sd;

          if (slot) {
            // Set the time slot
            return {
              ...sd,
              timeSlot: { startTime: slot.startTime, endTime: slot.endTime },
            };
          } else {
            // Clear the time slot - destructure and omit timeSlot
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { timeSlot: _removed, ...rest } = sd;
            return rest as SelectedDate;
          }
        })
      );
    },
    []
  );

  const handleContinue = (): void => {
    // Validate that all selected dates have time slots if time slots are enabled
    if (hasTimeSlots) {
      const missingTimeSlots = selectedDates.some((sd) => !sd.timeSlot);
      if (missingTimeSlots) {
        // Show error or prevent continuation
        alert("Please select a time slot for each selected date.");
        return;
      }
    }

    const selectedDatesData = selectedDates.map((sd) => ({
      date: sd.date.toISOString(),
      participants: sd.participants,
      timeSlot: sd.timeSlot, // Include time slot if present
    }));

    const selectedDatesParam = encodeURIComponent(
      JSON.stringify(selectedDatesData)
    );

    // Navigate to payment page with selected dates in query params
    router.push(
      `/reservations/${reservation._id}/payment?selectedDates=${selectedDatesParam}`
    );
  };

  const navigateMonth = (direction: "prev" | "next"): void => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = dayjs().tz(LOCAL_TIMEZONE);
  const todayKey = today.format("YYYY-MM-DD");

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

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

  const formatDateRange = (): string => {
    const startDate = new Date(reservation.dates.startDate);
    const endDate = reservation.dates.endDate
      ? new Date(reservation.dates.endDate)
      : startDate;

    const startFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endFormatted = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return startDate.getTime() === endDate.getTime()
      ? startFormatted
      : `${startFormatted} - ${endFormatted}`;
  };

  // Check if we can navigate to previous/next month
  const canNavigatePrev = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const reservationStart = new Date(reservation.dates.startDate);
    return firstDay > reservationStart;
  }, [currentMonth, reservation.dates.startDate]);

  const canNavigateNext = useMemo(() => {
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const reservationEnd = reservation.dates.endDate
      ? new Date(reservation.dates.endDate)
      : new Date(reservation.dates.startDate);
    return lastDay < reservationEnd;
  }, [currentMonth, reservation.dates]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1
              className={`${ebGaramond.className} text-3xl md:text-4xl font-bold text-primary`}
            >
              {reservation.eventName}
            </h1>
            {/* Help Tooltip */}
            <div className="relative group">
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 transition-colors p-2"
                aria-label="How to book"
              >
                <FaQuestionCircle size={24} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <h3 className={`${ebGaramond.className} text-lg font-bold text-blue-900 mb-2`}>
                  How to Book:
                </h3>
                <ol className={`${ebGaramond.className} text-sm text-gray-700 space-y-1.5 list-decimal list-inside`}>
                  <li>Click on any available date to select it</li>
                  {hasTimeSlots ? (
                    <>
                      <li>Select a time slot from the options</li>
                      <li>Choose number of participants</li>
                    </>
                  ) : (
                    <li>Choose participants from dropdown</li>
                  )}
                  <li>Select additional dates if needed</li>
                  <li>Review in booking summary</li>
                  <li>Click &quot;Continue to Checkout&quot;</li>
                </ol>
              </div>
            </div>
          </div>
          <p className={`${ebGaramond.className} text-gray-600 mb-4 text-base`}>
            {reservation.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
            <div>
              <span
                className={`${ebGaramond.className} font-bold text-gray-700`}
              >
                Date Range:
              </span>
              <p className={`${ebGaramond.className} text-gray-600`}>
                {formatDateRange()}
              </p>
            </div>
            <div>
              <span
                className={`${ebGaramond.className} font-bold text-gray-700`}
              >
                Time:
              </span>
              <p className={`${ebGaramond.className} text-gray-600`}>
                {reservation.timeType === "custom"
                  ? "Custom times per day (see calendar)"
                  : reservation.time.startTime
                    ? `${formatTime(reservation.time.startTime)}${
                        reservation.time.endTime
                          ? ` - ${formatTime(reservation.time.endTime)}`
                          : ""
                      }`
                    : "Time not specified"}
              </p>
            </div>
            <div>
              <span
                className={`${ebGaramond.className} font-bold text-gray-700`}
              >
                Price:
              </span>
              <p className={`${ebGaramond.className} text-gray-600`}>
                ${reservation.pricePerDayPerParticipant.toFixed(2)} per day per
                participant
              </p>
            </div>
          </div>

        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              disabled={!canNavigatePrev}
              className={`${ebGaramond.className} px-4 py-2 rounded-md font-bold transition-colors ${
                canNavigatePrev
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <h2 className={`${ebGaramond.className} text-2xl font-bold`}>
              {formatMonthYear(currentMonth)}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              disabled={!canNavigateNext}
              className={`${ebGaramond.className} px-4 py-2 rounded-md font-bold transition-colors ${
                canNavigateNext
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6 min-w-max pt-2">
              {monthDates.map((date, index) => {
                const dateKey = normalizeDateString(date);
                const isToday = dateKey === todayKey;
                const isExcluded = excludedDatesSet.has(dateKey);
                const availabilityData = availableDatesMap.get(dateKey);
                const isSelected = selectedDates.some(
                  (sd) => normalizeDateString(sd.date) === dateKey
                );
                const selectedDate = selectedDates.find(
                  (sd) => normalizeDateString(sd.date) === dateKey
                );

                const availability = availabilityData
                  ? {
                      current:
                        availabilityData.max - availabilityData.available,
                      max: availabilityData.max,
                    }
                  : { current: 0, max: 0 };

                const isDisabled =
                  !availabilityData ||
                  !availabilityData.isAvailable ||
                  availabilityData.available <= 0;

                return (
                  <DayCard
                    key={index}
                    date={date}
                    isToday={isToday}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    isExcluded={isExcluded}
                    availability={availability}
                    startTime={availabilityData?.startTime}
                    endTime={availabilityData?.endTime}
                    timeSlots={hasTimeSlots ? availabilityData?.timeSlots : undefined}
                    selectedTimeSlot={selectedDate?.timeSlot}
                    onSelect={() => handleDateToggle(date)}
                    participantCount={selectedDate?.participants}
                    onParticipantChange={(count) =>
                      handleParticipantChange(date, count)
                    }
                    onTimeSlotSelect={
                      hasTimeSlots
                        ? (slot) => handleTimeSlotSelect(date, slot)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>

          {monthDates.length === 0 && (
            <div className="text-center py-10">
              <p
                className={`${ebGaramond.className} text-gray-500 font-medium`}
              >
                No available dates in this month. Try navigating to another
                month.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Summary - Fixed Sidebar */}
      <BookingSummary
        selectedDates={selectedDates}
        pricePerDayPerParticipant={reservation.pricePerDayPerParticipant}
        discount={reservation.discount}
        optionsTotal={0}
        onContinue={handleContinue}
      />
    </div>
  );
}
