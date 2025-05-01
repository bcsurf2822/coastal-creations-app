"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

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

    // Get lowercase summary to check for camp events
    const summary = event.summary?.toLowerCase() || "";
    const isCampEvent = summary.includes("camp");

    // For camp events, check if we already have an event with this summary
    if (isCampEvent) {
      const existingIndex = acc.findIndex((e) => e.summary === event.summary);
      if (existingIndex === -1) {
        // If no event with this name exists yet, add it
        acc.push(event);
      }
    } else {
      // For non-camp events, always add them
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

  // Parse description to extract description and price
  const parseEventDetails = (
    description?: string
  ): { description: string; price: string } => {
    const result = { description: "", price: "" };

    if (!description) return result;

    // Check for "description:" in the text
    const descMatch = description.match(/description:\s*(.*?)(?:\n|$)/i);
    if (descMatch && descMatch[1]) {
      result.description = descMatch[1].trim();
    } else {
      // If no "description:" tag, use the whole text as description
      result.description = description.trim();
    }

    // Check for "price:" in the text
    const priceMatch = description.match(/price:\s*(.*?)(?:\n|$)/i);
    if (priceMatch && priceMatch[1]) {
      result.price = priceMatch[1].trim();
    }

    return result;
  };

  // Toggle the accordion state
  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Our Classes</h1>

        <div className="text-center max-w-3xl mx-auto mb-8">
          <p className="text-lg mb-6">
            We offer a variety of classes, workshops, and camps for all ages and
            skill levels. Click on the links below to learn more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center group">
              <div className="w-full">
                <button
                  onClick={() => toggleAccordion("paint")}
                  className="flex flex-col items-center w-full transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4 transition-all duration-300 group-hover:shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-blue-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                      />
                    </svg>
                  </div>
                  <span className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full text-center">
                    Paint Night
                  </span>
                </button>
                {openAccordion === "paint" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center transition-all duration-300 animate-fadeIn">
                    <p>
                      Join us for a fun evening of painting! Our instructors
                      will guide you through creating a beautiful piece of art
                      while you enjoy a relaxing atmosphere.
                    </p>
                    <button
                      onClick={() => setFilter("paint")}
                      className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      View Events
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-full">
                <button
                  onClick={() => toggleAccordion("camp")}
                  className="flex flex-col items-center w-full transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4 transition-all duration-300 group-hover:shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                      />
                    </svg>
                  </div>
                  <span className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full text-center">
                    Camps
                  </span>
                </button>
                {openAccordion === "camp" && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center transition-all duration-300 animate-fadeIn">
                    <p>
                      Our camps provide immersive art experiences for children
                      and teens. Each day is filled with creative activities,
                      skill-building, and fun!
                    </p>
                    <button
                      onClick={() => setFilter("camp")}
                      className="mt-3 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                    >
                      View Events
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-full">
                <button
                  onClick={() => toggleAccordion("workshop")}
                  className="flex flex-col items-center w-full transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full mb-4 transition-all duration-300 group-hover:shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-purple-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                      />
                    </svg>
                  </div>
                  <span className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full text-center">
                    Workshops
                  </span>
                </button>
                {openAccordion === "workshop" && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 text-center transition-all duration-300 animate-fadeIn">
                    <p>
                      Our specialized workshops focus on specific art techniques
                      and skills. Perfect for anyone looking to learn something
                      new or improve existing abilities.
                    </p>
                    <button
                      onClick={() => setFilter("workshop")}
                      className="mt-3 px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors cursor-pointer"
                    >
                      View Events
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                  {/* Extract and display description and price */}
                  {(() => {
                    const { description, price } = parseEventDetails(
                      event.description
                    );
                    return (
                      <>
                        <div className="mt-2">
                          <span className="font-medium">Description: </span>
                          <span className="text-gray-700">{description}</span>
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">Price: </span>
                          <span className="text-gray-700">
                            {price ? `$${price}` : "TBA"}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                  <div className="mt-4">
                    <Link
                      href={`/calendar/${event.id}`}
                      className="inline-block px-4 py-2 bg-primary text-black font-medium rounded-md hover:bg-blue-400 hover:text-white transition-colors border-2 border-black"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
