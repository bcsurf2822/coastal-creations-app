"use client";

import { useState, useEffect, use } from "react";
import { parseISO, format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ApiCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
  htmlLink?: string;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  price?: string;
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime?: string;
}

// Helper function to extract price and description from the formatted string
const extractJsonFromDescription = (
  description?: string
): { price?: string; description?: string } => {
  if (!description) return {};

  try {
    console.log("Raw description:", description);

    // Clean the description by removing HTML tags
    const textContent = description.replace(/<[^>]*>/g, " ").trim();
    console.log("Cleaned description:", textContent);

    // First try to extract using JSON-like format with quotes
    const priceJsonMatch = textContent.match(
      /["']price["']\s*:\s*["']([^"']+)["']/i
    );
    const descJsonMatch = textContent.match(
      /["']description["']\s*:\s*["']([^"']+)["']/i
    );

    // Then try to extract using simpler "key: value" format
    const priceSimpleMatch = textContent.match(/price\s*:\s*([^\n,]+)/i);
    const descSimpleMatch = textContent.match(/description\s*:\s*([^\n]+)/i);

    // Use the matches in order of preference
    const priceMatch = priceJsonMatch || priceSimpleMatch;
    const descMatch = descJsonMatch || descSimpleMatch;

    console.log("Price match:", priceMatch?.[1]);
    console.log("Description match:", descMatch?.[1]);

    // Build return object
    const result: { price?: string; description?: string } = {};

    if (priceMatch?.[1]) {
      result.price = priceMatch[1].trim();
    }

    if (descMatch?.[1]) {
      result.description = descMatch[1].trim();
    } else if (!priceMatch) {
      // If no price and no description found, use the whole text as description
      result.description = textContent;
    }

    console.log("Extracted result:", result);
    return result;
  } catch (error) {
    console.error("Error parsing description:", error);
    return { description };
  }
};

export default function EventPage({
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

      console.log(`Looking for event with ID: ${eventId}`);

      try {
        const response = await fetch("/api/calendar");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log("All events:", data.events);

        if (data.events) {
          console.log(
            "Event IDs from API:",
            data.events.map((e: ApiCalendarEvent) => e.id)
          );

          const foundEvent = data.events.find(
            (e: ApiCalendarEvent) => e.id === eventId
          );

          console.log("Found event:", foundEvent);

          if (foundEvent) {
            // Extract price and description from JSON in the description field
            const { price, description: extractedDescription } =
              extractJsonFromDescription(foundEvent.description);

            // Transform the event to a simpler format
            const transformedEvent = {
              id: foundEvent.id,
              title: foundEvent.summary,
              description: extractedDescription,
              price: price,
              startDate: foundEvent.start.dateTime
                ? parseISO(foundEvent.start.dateTime)
                : foundEvent.start.date
                ? parseISO(foundEvent.start.date)
                : new Date(),
              endDate: foundEvent.end.dateTime
                ? parseISO(foundEvent.end.dateTime)
                : foundEvent.end.date
                ? parseISO(foundEvent.end.date)
                : undefined,
              startTime: foundEvent.start.dateTime
                ? format(parseISO(foundEvent.start.dateTime), "h:mm a")
                : "All Day",
              endTime: foundEvent.end.dateTime
                ? format(parseISO(foundEvent.end.dateTime), "h:mm a")
                : undefined,
            };

            setEvent(transformedEvent);
          } else {
            throw new Error("Event not found");
          }
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

  return (
    <div className="min-h-screen p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-full p-4 bg-primary text-white">
          <span className="inline-block px-2 py-1 rounded bg-white/20 text-sm font-medium">
            Event
          </span>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{eventData.title}</h1>

          <div className="mb-6">
            <p className="text-lg mb-2">
              <span className="font-medium">Date:</span>{" "}
              {format(eventData.startDate, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-lg mb-2">
              <span className="font-medium">Time:</span> {eventData.startTime}{" "}
              {eventData.endTime ? `- ${eventData.endTime}` : ""}
            </p>
          </div>

          {eventData.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{eventData.description}</p>
            </div>
          )}

          {eventData.price && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Price</h2>
              <p className="text-lg font-medium">${eventData.price}</p>
            </div>
          )}

          <Link
            href={`/payments?eventId=${encodeURIComponent(
              eventData.id
            )}&eventTitle=${encodeURIComponent(eventData.title)}${
              eventData.price
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
