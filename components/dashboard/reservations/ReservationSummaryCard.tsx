"use client";

import { ReactElement } from "react";
import { RiCalendarEventLine, RiTimeLine } from "react-icons/ri";
import { Reservation, Customer } from "./types";

interface ReservationSummaryCardProps {
  reservation: Reservation;
  customers: Customer[];
}

export default function ReservationSummaryCard({
  reservation,
  customers,
}: ReservationSummaryCardProps): ReactElement {
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString || timeString.trim() === "") return "N/A";

    const timeParts = timeString.split(":");
    if (timeParts.length !== 2) return "N/A";

    const [hoursStr, minutes] = timeParts;
    if (!hoursStr || !minutes) return "N/A";

    const hours = parseInt(hoursStr, 10);
    if (isNaN(hours)) return "N/A";

    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes} ${ampm}`;
  };

  const getTotalParticipants = (): number => {
    return customers.reduce((total, customer) => total + customer.quantity, 0);
  };

  const getTotalRevenue = (): number => {
    return customers.reduce((total, customer) => total + customer.total, 0);
  };

  const getMaxParticipants = (): number => {
    if (!reservation.dailyAvailability) return 0;
    if (reservation.dailyAvailability.length === 0)
      return reservation.maxParticipantsPerDay || 0;
    return reservation.dailyAvailability[0].maxParticipants;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
            {reservation.eventName}
          </h3>
          {reservation.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {reservation.description}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Schedule
          </p>
          <div className="flex items-center text-gray-900 dark:text-white">
            <RiCalendarEventLine className="w-4 h-4 mr-2" />
            <span>
              {formatDate(reservation.dates?.startDate)} -{" "}
              {formatDate(reservation.dates?.endDate)}
            </span>
          </div>
          {reservation.time?.startTime && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
              <RiTimeLine className="w-4 h-4 mr-2" />
              <span>{formatTime(reservation.time.startTime)}</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Participants
          </p>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTotalParticipants()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            of {getMaxParticipants()} max per day
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Revenue
          </p>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${getTotalRevenue().toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {customers.length} booking{customers.length !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${reservation.pricePerDayPerParticipant}/day/participant
          </p>
        </div>
      </div>
    </div>
  );
}
