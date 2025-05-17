"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

// Define interface for event details
interface EventDetails {
  _id: string;
  eventName?: string;
  title?: string;
  dates?: {
    startDate?: string;
    recurringEndDate?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
  };
  date?: string;
  time?: { startTime: string; endTime: string; _id: string } | string;
  [key: string]: string | number | boolean | object | undefined;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const receiptUrl = searchParams.get("receiptUrl");
  const eventId = searchParams.get("eventId");

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      fetch(`/api/event/${eventId}`)
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          if (data.success) {
            setEventDetails(data.event);
          }
        })
        .catch((error) => console.error("Error fetching event details:", error))
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  // Helper function to format time object
  const formatTime = (
    time: { startTime: string; endTime: string; _id: string } | string | unknown
  ): string => {
    if (!time) return "";

    // If time is an object with startTime and endTime properties
    if (typeof time === "object" && "startTime" in time && "endTime" in time) {
      return `${time.startTime} - ${time.endTime}`;
    }

    // If time is a string
    if (typeof time === "string") {
      return time;
    }

    // Fallback
    return JSON.stringify(time).replace(/[{}"\\]/g, "");
  };

  // Helper function to format dates for recurring events
  const formatRecurringDates = (event: EventDetails): string => {
    if (!event.dates?.isRecurring || !event.dates.startDate) return "";

    const startDate = new Date(event.dates.startDate);
    let dateInfo = `Starts: ${startDate.toLocaleDateString()}`;

    if (event.dates.recurringEndDate) {
      const endDate = new Date(event.dates.recurringEndDate);
      dateInfo += ` | Ends: ${endDate.toLocaleDateString()}`;
    }

    if (event.dates.recurringPattern) {
      dateInfo += ` | ${event.dates.recurringPattern.charAt(0).toUpperCase() + event.dates.recurringPattern.slice(1)}`;
    }

    return dateInfo;
  };

  return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your payment. Your registration is now complete.
        </p>

        {/* Event Details Section */}
        {eventDetails && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              {eventDetails.eventName || eventDetails.title}
            </h2>
            {eventDetails.time && (
              <p className="text-gray-700 mb-1">
                Time: {formatTime(eventDetails.time)}
              </p>
            )}
            {eventDetails.dates?.isRecurring && (
              <p className="text-gray-700 mb-1">
                {formatRecurringDates(eventDetails)}
              </p>
            )}
            {!eventDetails.dates?.isRecurring && eventDetails.date && (
              <p className="text-gray-700 mb-1">
                Date: {new Date(eventDetails.date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {loading && (
          <p className="text-gray-500 mt-2">Loading event details...</p>
        )}

        {paymentId && (
          <p className="text-sm text-gray-500 mt-4 mb-2">
            Payment ID: <span className="font-mono">{paymentId}</span>
          </p>
        )}
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline block mb-4"
          >
            View Receipt
          </a>
        )}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto p-8 text-center">Loading...</div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
