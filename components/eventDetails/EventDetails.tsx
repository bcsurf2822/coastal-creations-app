"use client";

import { useState, useEffect, use } from "react";
import { parseISO, format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: {
    name: string;
    _id: string;
  }[];
  _id: string;
}

interface EventDates {
  startDate: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  excludeDates: string[];
  specificDates: string[];
  _id: string;
}

interface EventTime {
  startTime: string;
  endTime: string;
  _id: string;
}

interface EventData {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  dates: EventDates;
  time: EventTime;
  options: EventOption[];
  createdAt: string;
  updatedAt: string;
}

export default function EventDetails({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Unwrap params with React.use() as recommended by Next.js
  const unwrappedParams = use(params);
  const { eventId } = unwrappedParams;

  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/event/${eventId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.error || "Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Show a Not Found page if an event is explicitly not found after loading
  if (!isLoading && (error === "Event not found" || !event)) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  // At this point, we know event is not null due to the notFound check
  const eventData = event!;
  const formattedStartDate = eventData.dates?.startDate
    ? format(parseISO(eventData.dates.startDate), "EEEE, MMMM d, yyyy")
    : "Item unavailable";

  const formattedEndDate = eventData.dates?.recurringEndDate
    ? format(parseISO(eventData.dates.recurringEndDate), "EEEE, MMMM d, yyyy")
    : "Not applicable";

  return (
    <div className="min-h-screen p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-full p-4 bg-primary text-white">
          <span className="inline-block px-2 py-1 rounded bg-white/20 text-sm font-medium">
            {eventData.eventType || "Event"}
          </span>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">
            {eventData.eventName || "Item unavailable"}
          </h1>

          <div className="mb-6">
            <p className="text-lg mb-2">
              <span className="font-medium">Date:</span> {formattedStartDate}
            </p>
            {eventData.dates?.isRecurring && (
              <div>
                <p className="text-lg mb-2">
                  <span className="font-medium">Recurring:</span>{" "}
                  {eventData.dates.recurringPattern || "Weekly"}
                  {eventData.dates.recurringEndDate &&
                    ` until ${formattedEndDate}`}
                </p>
              </div>
            )}
            <p className="text-lg mb-2">
              <span className="font-medium">Time:</span>{" "}
              {eventData.time?.startTime || "Item unavailable"}
              {eventData.time?.endTime ? ` - ${eventData.time.endTime}` : ""}
            </p>
          </div>

          {eventData.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{eventData.description}</p>
            </div>
          )}

          {eventData.price !== undefined && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Price</h2>
              <p className="text-lg font-medium">${eventData.price}</p>
            </div>
          )}

          {eventData.options && eventData.options.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Options</h2>
              {eventData.options.map((option) => (
                <div key={option._id} className="mb-4">
                  <h3 className="text-lg font-medium">{option.categoryName}</h3>
                  <p className="mb-2">{option.categoryDescription}</p>
                  <div className="ml-4">
                    {option.choices.map((choice) => (
                      <p key={choice._id} className="mb-1">
                        • {choice.name}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/payments?eventId=${encodeURIComponent(
              eventData._id
            )}&eventTitle=${encodeURIComponent(eventData.eventName)}${
              eventData.price !== undefined
                ? `&price=${encodeURIComponent(eventData.price)}`
                : ""
            }`}
            className="px-6 py-3 bg-primary text-black font-medium rounded-md hover:bg-blue-400 hover:text-white transition-colors border-2 border-black cursor-pointer inline-block"
          >
            Register for this event
          </Link>
        </div>
      </div>
    </div>
  );
}
