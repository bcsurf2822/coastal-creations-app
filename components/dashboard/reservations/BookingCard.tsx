"use client";

import { ReactElement } from "react";
import {
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCalendarEventLine,
  // RiUserLine,
} from "react-icons/ri";
import { Customer } from "./types";

interface BookingCardProps {
  customer: Customer;
}

export default function BookingCard({
  customer,
}: BookingCardProps): ReactElement {
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
              {customer.billingInfo.firstName} {customer.billingInfo.lastName}
            </p>
            {customer.billingInfo.emailAddress && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <RiMailLine className="w-4 h-4 mr-2" />
                <span>{customer.billingInfo.emailAddress}</span>
              </div>
            )}
            {customer.billingInfo.phoneNumber && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <RiPhoneLine className="w-4 h-4 mr-2" />
                <span>{customer.billingInfo.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
              <RiMapPinLine className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                {customer.billingInfo.addressLine1}
                <br />
                {customer.billingInfo.city},{" "}
                {customer.billingInfo.stateProvince}{" "}
                {customer.billingInfo.postalCode}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Booking Details
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500 dark:text-gray-400">
                Total Participants:
              </span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {customer.quantity}
              </span>
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">
                Total Paid:
              </span>{" "}
              <span className="font-medium text-green-600 dark:text-green-400">
                ${customer.total.toFixed(2)}
              </span>
            </p>
            <p>
              <span className="text-gray-500 dark:text-gray-400">
                Booked On:
              </span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(customer.createdAt)}
              </span>
            </p>
            {customer.selectedDates && customer.selectedDates.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Selected Dates:
                </p>
                <div className="space-y-1">
                  {customer.selectedDates.map((dateInfo, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                    >
                      <RiCalendarEventLine className="w-3 h-3 mr-1" />
                      <span>
                        {formatDate(dateInfo.date)} -{" "}
                        {dateInfo.numberOfParticipants} participant
                        {dateInfo.numberOfParticipants !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Participants
          </h4>
          <div className="space-y-3">
            {customer.participants?.map((participant, pIndex) => (
              <div key={pIndex} className="text-sm">
                <p className="text-gray-900 dark:text-white font-medium">
                  {participant.firstName} {participant.lastName}
                </p>
                {participant.selectedOptions &&
                  participant.selectedOptions.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
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

          {/* Global Selected Options (legacy support) */}
          {customer.selectedOptions && customer.selectedOptions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Booking Options:
              </p>
              <div className="flex flex-wrap gap-1">
                {customer.selectedOptions.map((option, oIndex) => (
                  <span
                    key={oIndex}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {option.categoryName}: {option.choiceName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
