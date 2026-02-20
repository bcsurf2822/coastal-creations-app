"use client";

import React from "react";
import Image from "next/image";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

interface EventPreviewProps {
  eventTitle: string;
  description?: string;
  image?: string;
  dates?: {
    startDate: string;
    endDate?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringEndDate?: string;
  };
  time?: {
    startTime: string;
    endTime?: string;
  };
  formattedPrice: string;
  isPriceAvailable: boolean;
  originalPrice: string;
  discountInfo: {
    isDiscountAvailable: boolean;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      minParticipants: number;
      description?: string;
    };
  };
  numberOfPeople: number;
}

const PLACEHOLDER_IMAGE = "/assets/images/flowerPainting.jpeg";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return timeString;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const EventPreview: React.FC<EventPreviewProps> = ({
  eventTitle,
  description,
  image,
  dates,
  time,
  formattedPrice,
  isPriceAvailable,
  discountInfo,
  numberOfPeople,
}) => {
  const isDiscountActive = (): boolean => {
    if (!discountInfo.isDiscountAvailable || !discountInfo.discount)
      return false;
    return numberOfPeople >= discountInfo.discount.minParticipants;
  };

  const getDateDisplay = (): string => {
    if (!dates?.startDate) return "";
    if (dates.isRecurring && dates.recurringPattern && dates.recurringEndDate) {
      return `${formatDate(dates.startDate)} to ${formatDate(dates.recurringEndDate)} (${dates.recurringPattern})`;
    }
    if (dates.endDate) {
      return `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`;
    }
    return formatDate(dates.startDate);
  };

  const getTimeDisplay = (): string => {
    if (!time?.startTime) return "";
    const start = formatTime(time.startTime);
    const end = time.endTime ? formatTime(time.endTime) : "";
    return end ? `${start} - ${end}` : start;
  };

  const dateDisplay = getDateDisplay();
  const timeDisplay = getTimeDisplay();

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-5 p-6 sm:p-8">
        {/* Event Image */}
        <div className="relative w-full sm:w-40 h-36 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-sky-50">
          <Image
            src={image || PLACEHOLDER_IMAGE}
            alt={eventTitle}
            fill
            className={`${image ? "object-contain p-1" : "object-contain p-4"}`}
          />
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {eventTitle}
            </h1>
            {isPriceAvailable && (
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                ${formattedPrice}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {dateDisplay && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-100 rounded-md text-xs font-medium text-gray-600">
                <FaCalendarAlt className="text-[var(--color-primary)] text-[0.65rem]" />
                {dateDisplay}
              </span>
            )}
            {timeDisplay && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-100 rounded-md text-xs font-medium text-gray-600">
                <FaClock className="text-[var(--color-primary)] text-[0.65rem]" />
                {timeDisplay}
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {isDiscountActive() && discountInfo.discount?.description && (
            <div className="mt-2 inline-block bg-green-100 text-green-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {discountInfo.discount.description}
            </div>
          )}

          {/* Potential Discount Info */}
          {discountInfo.isDiscountAvailable &&
            !isDiscountActive() &&
            discountInfo.discount && (
              <p className="mt-2 text-xs text-gray-500">
                Save with {discountInfo.discount.minParticipants}+ participants
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
