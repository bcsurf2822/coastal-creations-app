"use client";

import { ReactElement } from "react";
import { RiMailLine, RiPhoneLine, RiUserLine } from "react-icons/ri";
import { ParticipantForDate } from "./types";

interface DateFilteredBookingCardProps {
  entry: ParticipantForDate;
}

export default function DateFilteredBookingCard({
  entry,
}: DateFilteredBookingCardProps): ReactElement {
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Contact Information
          </h4>
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {entry.customer.billingInfo.firstName}{" "}
              {entry.customer.billingInfo.lastName}
            </p>
            {entry.customer.billingInfo.emailAddress && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <RiMailLine className="w-4 h-4 mr-2" />
                <span>{entry.customer.billingInfo.emailAddress}</span>
              </div>
            )}
            {entry.customer.billingInfo.phoneNumber && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <RiPhoneLine className="w-4 h-4 mr-2" />
                <span>{entry.customer.billingInfo.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Info */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Date Details
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500 dark:text-gray-400">
                Participants on this date:
              </span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.numberOfParticipants}
              </span>
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">
                Booked On:
              </span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(entry.customer.createdAt)}
              </span>
            </p>
          </div>
        </div>

        {/* Participants for this date */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Participants
          </h4>
          <div className="space-y-3">
            {entry.customer.participants
              .slice(0, entry.numberOfParticipants)
              .map((participant, pIndex) => (
                <div key={pIndex} className="text-sm">
                  <p className="text-gray-900 dark:text-white flex items-center font-medium">
                    <RiUserLine className="w-4 h-4 mr-2 text-gray-400" />
                    {participant.firstName} {participant.lastName}
                  </p>
                  {participant.selectedOptions &&
                    participant.selectedOptions.length > 0 && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {participant.selectedOptions.map((option, oIndex) => (
                          <p
                            key={oIndex}
                            className="text-xs text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">
                              {option.categoryName}:
                            </span>{" "}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {option.choiceName}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
