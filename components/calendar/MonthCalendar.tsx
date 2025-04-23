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

type EventType = "class" | "workshop" | "event" | "exhibition" | "default";

interface CalendarEvent {
  date: Date;
  title: string;
  time: string;
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

        if (data.events) {
          const transformedEvents = transformEvents(data.events);
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

      // Determine event type based on summary or other properties
      let type: EventType = "default";
      const summary = event.summary.toLowerCase();

      if (summary.includes("paint") || summary.includes("canvas")) {
        type = "class";
      } else if (summary.includes("sip") || summary.includes("create")) {
        type = "event";
      } else if (summary.includes("workshop")) {
        type = "workshop";
      } else if (summary.includes("exhibition")) {
        type = "exhibition";
      } else if (summary.includes("block party")) {
        type = "event";
      }

      return {
        id: event.id,
        date: startDate,
        title: event.summary,
        time: time,
        type: type,
      };
    });
  };

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  // Generate array of years (current year and 2 years before and after)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
          Calendar of Events
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold order-first sm:order-none">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <div className="flex gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={handleMonthChange}
              className="py-2 px-3 border border-gray-300 rounded-md"
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
              className="py-2 px-3 border border-gray-300 rounded-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-bold py-2">
              {day}
            </div>
          ))}
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
          <div className="grid grid-cols-7 gap-1 mb-8">
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div
                key={`empty-start-${index}`}
                className="bg-gray-50 min-h-[100px] border border-gray-200 rounded"
              ></div>
            ))}

            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[100px] p-1 sm:p-2 border ${
                    isToday(day) ? "border-2 border-primary" : "border-gray-200"
                  } rounded flex flex-col overflow-hidden`}
                >
                  <div className="text-right font-medium">
                    {format(day, "d")}
                  </div>
                  <div className="flex flex-col gap-1 flex-grow overflow-y-auto">
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`mt-1 p-1 sm:p-2 rounded text-xs sm:text-sm ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                        <div className="text-xs">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
              <div
                key={`empty-end-${index}`}
                className="bg-gray-50 min-h-[100px] border border-gray-200 rounded"
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
