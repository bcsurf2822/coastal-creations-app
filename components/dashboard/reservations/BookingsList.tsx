"use client";

import { ReactElement } from "react";
import { RiUserLine } from "react-icons/ri";
import { Customer, ParticipantForDate } from "./types";
import BookingCard from "./BookingCard";
import DateFilteredBookingCard from "./DateFilteredBookingCard";

interface BookingsListProps {
  customers: Customer[];
  selectedDate: string | null;
  getParticipantsForDate: (dateStr: string) => ParticipantForDate[];
}

export default function BookingsList({
  customers,
  selectedDate,
  getParticipantsForDate,
}: BookingsListProps): ReactElement {
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderFilteredView = (): ReactElement => {
    if (!selectedDate) return <></>;

    const participantsForDate = getParticipantsForDate(selectedDate);

    if (participantsForDate.length === 0) {
      return (
        <div className="text-center py-12">
          <RiUserLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No participants for this date
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {participantsForDate.map((entry, index) => (
          <DateFilteredBookingCard key={index} entry={entry} />
        ))}
      </div>
    );
  };

  const renderAllBookingsView = (): ReactElement => {
    if (customers.length === 0) {
      return (
        <div className="text-center py-12">
          <RiUserLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {customers.map((customer) => (
          <BookingCard key={customer._id} customer={customer} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedDate
            ? `Participants on ${formatDate(selectedDate)}`
            : `Bookings (${customers.length})`}
        </h3>
      </div>

      <div className="p-5">
        {selectedDate ? renderFilteredView() : renderAllBookingsView()}
      </div>
    </div>
  );
}
