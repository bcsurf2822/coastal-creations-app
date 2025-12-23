"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { createEventSlug } from "@/lib/utils/slugify";
import { usePageContent, useEvents, useCustomers } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Define the event interface
interface CalendarEvent {
  _id: string;
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist";
  description: string;
  price: number;
  numberOfParticipants?: number;
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
  const [today, setToday] = useState<string | null>(null);

  // React Query hooks
  const { content } = usePageContent();
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents();
  const { data: customersData } = useCustomers();

  // Cast events to CalendarEvent type for compatibility
  const events = (eventsData || []) as unknown as CalendarEvent[];
  const isLoading = eventsLoading;
  const error = eventsError?.message || null;

  // Calculate participant counts from customers data
  const eventParticipantCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (customersData && Array.isArray(customersData)) {
      customersData.forEach((customer) => {
        // Handle both populated and unpopulated event references
        const eventId =
          typeof customer.event === "object"
            ? (customer.event as { _id?: string })?._id
            : customer.event;

        if (eventId) {
          counts[eventId] = (counts[eventId] || 0) + customer.quantity;
        }
      });
    }

    return counts;
  }, [customersData]);

  // Convert PortableText to plain text
  const subtitle = content?.homepage?.upcomingWorkshops?.subtitle
    ? portableTextToPlainText(content.homepage.upcomingWorkshops.subtitle)
    : DEFAULT_TEXT.homepage.upcomingWorkshops.subtitle;

  useEffect(() => {
    // Set today's date string for comparison
    setToday(new Date().toDateString());

    // Get today's date and create an array of the next 7 days
    const currentDate = new Date();
    const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      return date;
    });
    setDates(nextSevenDays);
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
        return `${displayHours}:${minutes
          .toString()
          .padStart(2, "0")} ${period}`;
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
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h4 className="text-secondary uppercase tracking-widest text-sm font-medium mb-3">
                Plan Your Visit
              </h4>
              <h3 className="serif text-4xl font-bold text-primary mb-4">
                Upcoming Workshops
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto font-bold">
                Loading calendar...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 pb-40 md:pt-28 md:pb-64 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-[1600px] mx-auto z-10 relative">
          <div className="text-center mb-12">
            <h4
              className={`${ebGaramond.className} text-secondary uppercase tracking-widest text-sm font-medium mb-3`}
            >
              {content?.homepage?.upcomingWorkshops?.label ||
                DEFAULT_TEXT.homepage.upcomingWorkshops.label}
            </h4>
            <h3
              className={`${ebGaramond.className} text-4xl md:text-5xl font-bold text-primary mb-4`}
            >
              {content?.homepage?.upcomingWorkshops?.title ||
                DEFAULT_TEXT.homepage.upcomingWorkshops.title}
            </h3>
            <p
              className={`${ebGaramond.className} text-gray-600 max-w-2xl mx-auto font-bold text-lg leading-relaxed`}
            >
              {subtitle}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p
                className={`${ebGaramond.className} font-bold text-xl text-primary/70`}
              >
                Loading calendar events...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className={`${ebGaramond.className} text-red-500 font-bold`}>
                Error loading events: {error}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-6">
                {dates.map((date, index) => {
                  const dayEvents = getEventsForDay(date);
                  const isToday = today === date.toDateString();

                  return (
                    <div
                      key={index}
                      className={`workshop-day rounded-2xl overflow-hidden flex flex-col h-[400px] transition-all duration-500 hover:-translate-y-2
                        ${
                          isToday
                            ? "shadow-xl ring-2 ring-primary/20 scale-[1.02] z-10"
                            : "shadow-lg hover:shadow-2xl bg-white"
                        }`}
                    >
                      {/* Date Header */}
                      <div
                        className={`text-center py-4 px-2 relative overflow-hidden
                          ${
                            isToday
                              ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                              : "bg-gray-50 text-primary border-b border-gray-100"
                          }`}
                      >
                        <p
                          className={`${
                            ebGaramond.className
                          } text-lg font-medium leading-none ${
                            isToday ? "text-white" : "text-primary/70"
                          }`}
                        >
                          {formatDay(date)}
                        </p>
                        <p
                          className={`${
                            ebGaramond.className
                          } text-4xl font-bold mt-1 leading-tight ${
                            isToday ? "text-white" : "text-primary"
                          }`}
                        >
                          {formatDate(date)}
                        </p>
                        <p
                          className={`${
                            ebGaramond.className
                          } text-xs uppercase tracking-widest mt-1 ${
                            isToday ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {formatMonth(date)}
                        </p>
                      </div>

                      {/* Events Container */}
                      <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                        {dayEvents.length > 0 ? (
                          <div className="flex flex-col space-y-4">
                            {dayEvents.map((event, idx) => (
                              <div
                                key={event._id || idx}
                                className={`flex flex-col ${
                                  idx !== 0
                                    ? "pt-4 border-t border-dashed border-gray-100"
                                    : ""
                                }`}
                              >
                                <div className="flex flex-col items-start mb-2 text-sm">
                                  <p
                                    className={`${ebGaramond.className} font-bold text-primary text-left text-base leading-snug line-clamp-2`}
                                  >
                                    {event.eventName}
                                  </p>

                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <span
                                      className={`${ebGaramond.className} text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-100`}
                                    >
                                      {event.time.startTime
                                        ? formatEventTime(event.time.startTime)
                                        : "All Day"}
                                    </span>

                                    {/* Show participant count only if signups > 5 */}
                                    {(eventParticipantCounts[event._id] || 0) >
                                      5 && (
                                      <span
                                        className={`${ebGaramond.className} text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-semibold border border-green-100`}
                                      >
                                        {eventParticipantCounts[event._id] || 0}{" "}
                                        / {event.numberOfParticipants || 20}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {event.eventType !== "artist" && (
                                  <div className="mt-1">
                                    {(eventParticipantCounts[event._id] || 0) >=
                                    (event.numberOfParticipants || 20) ? (
                                      <div
                                        className={`${ebGaramond.className} w-full text-center text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed`}
                                      >
                                        Sold Out
                                      </div>
                                    ) : (
                                      <Link
                                        href={`/calendar/${createEventSlug(
                                          event.eventName,
                                          event._id
                                        )}`}
                                        className={`${ebGaramond.className} block w-full text-center text-xs font-bold px-3 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-all duration-300 hover:shadow-md`}
                                      >
                                        Sign Up
                                      </Link>
                                    )}
                                  </div>
                                )}

                                {event.eventType === "artist" && (
                                  <div className="mt-1">
                                    <span
                                      className={`${ebGaramond.className} block w-full text-center text-xs font-bold px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg`}
                                    >
                                      Live Demo
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 min-h-[100px]">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-300"
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
                            </div>
                            <p
                              className={`${ebGaramond.className} text-sm font-medium`}
                            >
                              No events
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-12 relative z-20">
            <Link
              href="/calendar"
              className={`${ebGaramond.className} inline-flex items-center gap-2 bg-secondary text-white hover:bg-primary-dark font-bold px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1`}
            >
              <span>View Full Calendar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center">
        <img
          src="/assets/svg/upcoming_workshops/upcoming_workshops.svg"
          alt="Decorative element"
          className="w-[40rem] md:w-[50rem] lg:w-[60rem] h-auto object-contain"
        />
      </div>
    </section>
  );
}
