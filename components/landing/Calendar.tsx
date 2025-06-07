"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Define the event interface
interface CalendarEvent {
  _id: string;
  eventName: string;
  eventType: "class" | "camp" | "workshop";
  description: string;
  price: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurringEndDate?: string;
    excludeDates?: string[];
    specificDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  image?: string;
}

export default function Calendar() {
  const [dates, setDates] = useState<Date[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // Set today's date string for comparison
    setToday(new Date().toDateString());

    // Get today's date and create an array of the next 5 days
    const currentDate = new Date();
    const nextFiveDays = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      return date;
    });
    setDates(nextFiveDays);

    // Fetch events
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
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
      const eventDate = event.dates.startDate
        ? new Date(event.dates.startDate)
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

  // Format event time from time.startTime string
  const formatEventTime = (startTime: string) => {
    try {
      // If startTime is in HH:MM format, convert to 12-hour format
      if (startTime.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
      }
      return startTime;
    } catch {
      return "All Day";
    }
  };

  // Render placeholder while client-side dates are being calculated
  if (!today) {
    return (
      <section className="py-20 md:py-28">
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
                Loading calendar...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 ">
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
                  const isToday = today === date.toDateString();

                  return (
                    <div
                      key={index}
                      className="workshop-day border border-gray-200 rounded-lg overflow-hidden min-w-[240px] shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div
                        className={`text-center py-4 ${isToday ? "bg-blue-300 text-white" : "bg-gray-200 text-black"}`}
                      >
                        <p
                          className={`text-lg font-medium mt-2 ${isToday ? "text-white" : "text-black"}`}
                        >
                          {formatDay(date)}
                        </p>
                        <p
                          className={`text-sm uppercase tracking-wider ${isToday ? "text-white/90" : "text-black/80"}`}
                        >
                          {formatMonth(date)}
                        </p>
                        <p
                          className={`text-3xl font-bold mt-1 ${isToday ? "text-white" : "text-black"}`}
                        >
                          {formatDate(date)}
                        </p>
                      </div>
                      <div className="p-5 bg-white">
                        {dayEvents.length > 0 ? (
                          dayEvents.map((event, idx) => (
                            <div
                              key={event._id || idx}
                              className={`${
                                idx !== 0
                                  ? "border-t border-gray-100 pt-4 mt-4"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-col items-start mb-2">
                                <p className="font-medium text-primary text-left">
                                  {event.eventName}
                                </p>
                                <p className="text-xs bg-blue-100 text-secondary px-2 py-1 rounded-full mt-1 font-medium">
                                  {event.time.startTime
                                    ? formatEventTime(event.time.startTime)
                                    : "All Day"}
                                </p>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Link
                                  href={`/calendar/${event._id}`}
                                  className="text-xs font-bold px-3 py-1.5 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  Sign Up
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-gray-500 min-h-[120px] flex flex-col items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
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
              href="/calendar"
              className="inline-block bg-blue-500 text-white hover:bg-blue-600 font-bold px-8 py-3 rounded-md transition duration-300 shadow-md hover:shadow-lg"
            >
              View Full Calendar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
