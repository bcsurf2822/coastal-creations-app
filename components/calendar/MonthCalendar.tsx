"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import Link from "next/link";

type EventType = "class" | "workshop" | "event" | "exhibition" | "default";

interface CalendarEvent {
  date: Date;
  title: string;
  time: string;
  endTime?: string;
  type: EventType;
  id: string;
}

// Define API response event type
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
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track which event titles should show sign up buttons
  const [eventsWithSignUp, setEventsWithSignUp] = useState<Set<string>>(
    new Set()
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch calendar events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calendar");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.events) {
          const transformedEvents = transformEvents(data.events);

          // Identify unique event titles and their first occurrences
          const eventTitlesToFirstId = new Map<string, string>();

          // Sort all events by date first to ensure we identify the earliest occurrence
          const allEventsSorted = [...transformedEvents].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );

          // Identify the first occurrence of each unique title
          allEventsSorted.forEach((event) => {
            if (!eventTitlesToFirstId.has(event.title)) {
              eventTitlesToFirstId.set(event.title, event.id);
            }
          });

          // Create a set of event IDs that should show the Sign Up button
          const signUpIds = new Set(eventTitlesToFirstId.values());
          setEventsWithSignUp(signUpIds);
          setCalendarEvents(transformedEvents);
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
  }, [currentMonth]); // Refetch when month changes

  // Transform API events to our format
  const transformEvents = (events: ApiCalendarEvent[]) => {
    return events.map((event) => {
      // Parse the date from the event
      const startDate = event.start.dateTime
        ? parseISO(event.start.dateTime)
        : event.start.date
          ? parseISO(event.start.date)
          : new Date();

      // Format the time
      const time = event.start.dateTime
        ? format(parseISO(event.start.dateTime), "h:mm a")
        : "All Day";

      // Format end time if available
      const endTime = event.end.dateTime
        ? format(parseISO(event.end.dateTime), "h:mm a")
        : "";

      // Set default event type
      const type: EventType = "default";

      return {
        id: event.id,
        date: startDate,
        title: event.summary,
        time: time,
        endTime: endTime,
        type: type,
      };
    });
  };

  const getEventsForDay = (day: Date) => {
    return calendarEvents
      .filter(
        (event) =>
          event.date.getDate() === day.getDate() &&
          event.date.getMonth() === day.getMonth() &&
          event.date.getFullYear() === day.getFullYear()
      )
      .map((event) => {
        // Check if this event should show the Sign Up button
        const showSignUp = eventsWithSignUp.has(event.id);

        return {
          ...event,
          showSignUp,
        };
      });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  // Generate array of years (current year and next year only)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // List of all months for the dropdown
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 sm:py-12 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-3 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
            <button
              onClick={prevMonth}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex space-x-1 sm:space-x-2">
              <select
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
                className="py-1 px-2 sm:py-2 sm:px-3 text-sm sm:text-base border border-gray-300 rounded-md bg-white"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
                className="py-1 px-2 sm:py-2 sm:px-3 text-sm sm:text-base border border-gray-300 rounded-md bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={nextMonth}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1 sm:mb-2 text-xs sm:text-sm">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center font-medium text-gray-500 py-1 sm:py-2 md:py-4 md:text-lg"
              >
                {/* Show shorter day names on small screens */}
                <span className="block sm:hidden">{day.charAt(0)}</span>
                <span className="hidden sm:block">{day}</span>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-8 sm:py-16 md:py-24">
              <p>Loading calendar events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-16 md:py-24">
              <p className="text-red-500">Error loading events: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 text-xs sm:text-sm">
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div
                  key={`empty-start-${index}`}
                  className="aspect-square p-1 sm:p-1 md:p-2 border border-gray-100"
                ></div>
              ))}

              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={day.toString()}
                    className={`aspect-square p-0.5 sm:p-1 md:p-2 border border-gray-100 ${
                      isToday(day) ? "bg-blue-50" : ""
                    } flex flex-col`}
                  >
                    <div
                      className={`text-center font-medium ${
                        isToday(day)
                          ? "bg-primary text-white rounded-full w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 flex items-center justify-center mx-auto"
                          : ""
                      } mb-0.5 sm:mb-1`}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="flex-grow overflow-y-auto">
                      {/* On mobile, just show dots for events */}
                      <div className="flex justify-center md:hidden mt-0.5 sm:mt-1">
                        {hasEvents && (
                          <>
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getEventDotColor(
                                dayEvents[0].type
                              )}`}
                            ></div>
                            {dayEvents.length > 1 && (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400 ml-0.5 sm:ml-1"></div>
                            )}
                          </>
                        )}
                      </div>

                      {/* On desktop, show event details */}
                      <div className="hidden md:flex md:flex-col md:gap-1 md:overflow-y-auto">
                        {dayEvents.slice(0, 2).map((event, idx) => {
                          return (
                            <div
                              key={idx}
                              className={`p-1 rounded text-xs ${getEventTypeColor(
                                event.type
                              )} flex flex-col h-auto`}
                            >
                              <div>
                                <div className="font-medium truncate">
                                  {event.title}
                                </div>
                                <div className="text-xs">
                                  {event.time}
                                  {event.endTime ? ` - ${event.endTime}` : ""}
                                </div>
                              </div>
                              {event.showSignUp && (
                                <div className="flex justify-end mt-1">
                                  <Link
                                    href={`/calendar/${event.id}`}
                                    className="px-2 py-0.5 bg-white text-xs font-medium rounded-full shadow-sm hover:bg-gray-50 transition-all duration-300 border border-gray-300 hover:border-gray-400"
                                  >
                                    Sign Up
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-center text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div
                  key={`empty-end-${index}`}
                  className="aspect-square p-1 md:p-2 border border-gray-100"
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Event list below calendar */}
        <div className="px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 bg-gray-50 border-t">
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-2 sm:mb-4">
            Upcoming Events
          </h3>

          {isLoading ? (
            <p>Loading events...</p>
          ) : error ? (
            <p className="text-red-500">Error loading events</p>
          ) : calendarEvents.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {calendarEvents
                .filter((event) => event.date >= new Date()) // Only show future events
                .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by date
                .slice(0, 5) // Show only 5 events
                .map((event) => {
                  // Check if this event should show the Sign Up button
                  const showSignUp = eventsWithSignUp.has(event.id);

                  return (
                    <div
                      key={event.id}
                      className="flex border-l-4 pl-2 sm:pl-3 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base"
                      style={{ borderColor: getEventBorderColor(event.type) }}
                    >
                      <div className="flex-grow min-w-0">
                        <div className="font-medium truncate mb-1">
                          {event.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs sm:text-xs md:text-sm text-gray-600">
                            {format(event.date, "MMM d")} • {event.time}
                            {event.endTime ? ` - ${event.endTime}` : ""}
                          </div>
                          {showSignUp && (
                            <div>
                              <Link
                                href={`/calendar/${event.id}`}
                                className="px-2 py-0.5 bg-white text-xs font-medium rounded-full shadow-sm hover:bg-gray-50 transition-all duration-300 border border-gray-300 hover:border-gray-400"
                              >
                                Sign Up
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p>No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get event dot color
const getEventDotColor = (type: EventType) => {
  const colors = {
    class: "bg-blue-500",
    workshop: "bg-green-500",
    event: "bg-purple-500",
    exhibition: "bg-orange-500",
    default: "bg-gray-500",
  };
  return colors[type];
};

// Helper function to get event border color
const getEventBorderColor = (type: EventType) => {
  const colors = {
    class: "#3b82f6", // blue-500
    workshop: "#22c55e", // green-500
    event: "#a855f7", // purple-500
    exhibition: "#f97316", // orange-500
    default: "#6b7280", // gray-500
  };
  return colors[type];
};

// Event type color for desktop view
const getEventTypeColor = (type: EventType) => {
  const colors = {
    class: "bg-blue-100 text-blue-800",
    workshop: "bg-green-100 text-green-800",
    event: "bg-purple-100 text-purple-800",
    exhibition: "bg-orange-100 text-orange-800",
    default: "bg-gray-100 text-gray-800",
  };
  return colors[type];
};
