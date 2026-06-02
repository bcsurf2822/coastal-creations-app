"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { FaCheck, FaCalendarAlt, FaClock, FaRegEnvelope } from "react-icons/fa";

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

const formatClockTime = (value: string): string => {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return value;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes ?? "00"} ${ampm}`;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const receiptUrl = searchParams.get("receiptUrl");
  const eventId = searchParams.get("eventId");
  const firstName = searchParams.get("firstName");
  const eventTitle = searchParams.get("eventTitle");
  const email = searchParams.get("email");
  const last4 = searchParams.get("last4");
  const cardBrand = searchParams.get("cardBrand");
  const paymentMethod = searchParams.get("paymentMethod");
  const totalPrice = searchParams.get("totalPrice");
  const amount = searchParams.get("amount");

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      fetch(`/api/event/${eventId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setEventDetails(data.event);
          }
        })
        .catch((error) => console.error("Error fetching event details:", error))
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const formatTime = (
    time: { startTime: string; endTime: string; _id: string } | string | unknown
  ): string => {
    if (!time) return "";
    if (typeof time === "object" && "startTime" in time && "endTime" in time) {
      const t = time as { startTime: string; endTime: string };
      const start = formatClockTime(t.startTime);
      const end = formatClockTime(t.endTime);
      return end ? `${start} - ${end}` : start;
    }
    if (typeof time === "string") return time;
    return JSON.stringify(time).replace(/[{}"\\]/g, "");
  };

  const formatRecurringDates = (event: EventDetails): string => {
    if (!event.dates?.isRecurring || !event.dates.startDate) return "";
    const startDate = new Date(event.dates.startDate);
    let dateInfo = `Starts ${startDate.toLocaleDateString()}`;
    if (event.dates.recurringEndDate) {
      const endDate = new Date(event.dates.recurringEndDate);
      dateInfo += ` · Ends ${endDate.toLocaleDateString()}`;
    }
    if (event.dates.recurringPattern) {
      dateInfo += ` · ${event.dates.recurringPattern.charAt(0).toUpperCase() + event.dates.recurringPattern.slice(1)}`;
    }
    return dateInfo;
  };

  const displayTitle = eventDetails?.eventName || eventDetails?.title || eventTitle;
  const displayAmount =
    totalPrice || (amount ? (parseInt(amount, 10) / 100).toFixed(2) : null);
  const dateLine = eventDetails?.dates?.isRecurring
    ? formatRecurringDates(eventDetails)
    : eventDetails?.date
      ? new Date(eventDetails.date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
  const timeLine = eventDetails?.time ? formatTime(eventDetails.time) : "";
  const paidWith =
    paymentMethod === "gift_card"
      ? "Gift card"
      : paymentMethod === "free"
        ? "No payment required"
        : last4
          ? `${cardBrand ? cardBrand : "Card"} ending in ${last4}`
          : null;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 ring-8 ring-green-50 mb-5">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <FaCheck className="text-white text-2xl" />
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
            {firstName ? `Thank you, ${firstName}!` : "Payment Successful!"}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your registration is confirmed and your spot is secured.
            {email ? (
              <>
                {" "}
                A confirmation email is on its way to{" "}
                <span className="font-medium text-gray-800">{email}</span>.
              </>
            ) : null}
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-sky-100 overflow-hidden">
          {displayTitle && (
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-5">
              <p className="text-sky-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Booking Confirmed
              </p>
              <h2 className="text-white text-xl font-bold leading-tight">
                {displayTitle}
              </h2>
            </div>
          )}

          <div className="px-6 py-5 space-y-4">
            {(dateLine || timeLine) && (
              <div className="flex flex-wrap gap-2">
                {dateLine && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-lg text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="text-[var(--color-primary)] text-xs" />
                    {dateLine}
                  </span>
                )}
                {timeLine && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-lg text-sm font-medium text-gray-700">
                    <FaClock className="text-[var(--color-primary)] text-xs" />
                    {timeLine}
                  </span>
                )}
              </div>
            )}
            {loading && (
              <p className="text-gray-400 text-sm">Loading event details…</p>
            )}

            <dl className="divide-y divide-gray-100">
              {displayAmount && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-sm text-gray-500">Amount paid</dt>
                  <dd className="text-base font-bold text-gray-900">
                    ${displayAmount}
                  </dd>
                </div>
              )}
              {paidWith && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-sm text-gray-500">Paid with</dt>
                  <dd className="text-sm font-medium text-gray-800">
                    {paidWith}
                  </dd>
                </div>
              )}
              {paymentId && (
                <div className="flex items-center justify-between py-2.5 gap-4">
                  <dt className="text-sm text-gray-500">Confirmation #</dt>
                  <dd className="text-xs font-mono text-gray-600 truncate">
                    {paymentId}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {receiptUrl && (
            <div className="px-6 pb-5">
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-2.5 border border-sky-200 text-[var(--color-secondary)] font-semibold rounded-lg hover:bg-sky-50 transition-colors"
              >
                View Square Receipt
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 text-center px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/events/classes-workshops"
            className="flex-1 text-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse More Classes
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <FaRegEnvelope className="text-gray-300" />
          Questions? Reply to your confirmation email and we&apos;ll help.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto p-8 text-center text-gray-500">
          Loading…
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
