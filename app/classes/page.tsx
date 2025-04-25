"use client";

import { useState, useEffect } from "react";

// Define TypeScript interfaces for the event data
interface EventDateTime {
  dateTime: string;
  timeZone: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: EventDateTime;
  end?: EventDateTime;
}

export default function Classes() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/calendar");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err: unknown) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events by type and keep only the first occurrence of events with the same name
  const filteredEvents = events.reduce<CalendarEvent[]>((acc, event) => {
    // First, check if the event matches the filter
    if (filter !== "all") {
      const summary = event.summary?.toLowerCase() || "";
      if (!summary.includes(filter.toLowerCase())) {
        return acc; // Skip this event if it doesn't match the filter
      }
    }

    // Check if we already have an event with this summary
    const existingIndex = acc.findIndex((e) => e.summary === event.summary);

    if (existingIndex === -1) {
      // If no event with this name exists yet, add it
      acc.push(event);
    }

    return acc;
  }, []);

  const formatDate = (dateTimeString?: string): string => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Our Classes</h1>

        <div className="w-full mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Upcoming Classes & Events
          </h2>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("camp")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "camp" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                Camps
              </button>
              <button
                onClick={() => setFilter("workshop")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "workshop"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Workshops
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
              <p>Error loading events: {error}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p>
                No {filter !== "all" ? filter : ""} events currently scheduled.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="text-xl font-medium">{event.summary}</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                    <div className="text-gray-600">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(event.start?.dateTime)}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Time:</span>{" "}
                      {formatTime(event.start?.dateTime)} -{" "}
                      {formatTime(event.end?.dateTime)}
                    </div>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-gray-700">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="mb-4">Contact us for availability!</p>
          <a
            href="/contact"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Book Now
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
