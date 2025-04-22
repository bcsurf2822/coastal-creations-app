"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

// Define the event interface
interface CalendarEvent {
  id: string;
  summary: string;
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
}

export default function Calendar() {
  const [dates, setDates] = useState<Date[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get today's date and create an array of the next 5 days
    const today = new Date();
    const nextFiveDays = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    setDates(nextFiveDays);

    // Fetch calendar events
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calendar");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      // Get the event date
      const eventDate = event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start.date
        ? new Date(event.start.date)
        : null;

      if (!eventDate) return false;

      // Check if the event is on the current day
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Format event time from dateTime string
  const formatEventTime = (dateTimeStr: string) => {
    try {
      const date = parseISO(dateTimeStr);
      return format(date, "h:mm a");
    } catch {
      return "All Day";
    }
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-secondary uppercase tracking-widest text-sm font-medium mb-3">
              Plan Your Visit
            </h4>
            <h3 className="serif text-4xl font-bold text-primary mb-4">
              Upcoming Workshops
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our calendar to find the perfect class or workshop for your
              creative journey.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p>Loading calendar events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading events: {error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex space-x-6 min-w-max pb-4">
                {dates.map((date, index) => {
                  const dayEvents = getEventsForDay(date);

                  return (
                    <div
                      key={index}
                      className="workshop-day border border-gray-200 rounded-lg overflow-hidden min-w-[220px] shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="bg-primary text-black text-center py-4">
                        <p className="text-lg font-medium mt-2 text-black">
                          {formatDay(date)}
                        </p>
                        <p className="text-sm uppercase tracking-wider text-black/80">
                          {formatMonth(date)}
                        </p>
                        <p className="text-3xl font-bold mt-1 text-black">
                          {formatDate(date)}
                        </p>
                      </div>
                      <div className="p-5 bg-white">
                        {dayEvents.length > 0 ? (
                          dayEvents.map((event, idx) => (
                            <div
                              key={event.id || idx}
                              className={`${
                                idx !== 0
                                  ? "border-t border-gray-100 pt-4 mt-4"
                                  : ""
                              } ${
                                idx !== dayEvents.length - 1
                                  ? "border-b border-gray-100 pb-4 mb-4"
                                  : ""
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-primary">
                                  {event.summary}
                                </p>
                                <p className="text-xs bg-blue-100 text-secondary px-2 py-1 rounded-full">
                                  {event.start.dateTime
                                    ? formatEventTime(event.start.dateTime)
                                    : "All Day"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-gray-500">
                            <p>No events scheduled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/classes"
              className="inline-block bg-primary text-black hover:bg-primary/90 font-medium px-8 py-3 rounded-md transition duration-300 shadow-md hover:shadow-lg"
            >
              View Full Calendar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
