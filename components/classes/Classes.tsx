"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

// Define TypeScript interfaces for the event data
interface EventTime {
  startTime: string;
  endTime: string;
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

interface OptionChoice {
  name: string;
  _id: string;
}

interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: OptionChoice[];
  _id: string;
}

interface Event {
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
  __v: number;
}

export default function Classes() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        // console.log(data);
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

  // Group events by name and organize dates
  const filterEvents = (events: Event[]): Event[] => {
    if (filter === "all") return events;

    return events.filter((event) => {
      const eventType = event.eventType.toLowerCase();
      return eventType.includes(filter.toLowerCase());
    });
  };

  // Format dates in a readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate date information for the event
  const getDateInfo = (event: Event): string => {
    const { dates } = event;

    if (dates.isRecurring && dates.recurringPattern && dates.recurringEndDate) {
      return `${formatDate(dates.startDate)} to ${formatDate(dates.recurringEndDate)} (${dates.recurringPattern})`;
    } else {
      return formatDate(dates.startDate);
    }
  };

  // Toggle the accordion state
  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Get filtered events
  const filteredEvents = filterEvents(events);

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8">Our Classes</h1>

      <div className="text-center max-w-3xl mx-auto mb-8">
        <p className="text-lg mb-6">
          We offer a variety of classes, workshops, and camps for all ages and
          skill levels. Click on the links below to learn more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-center group">
            <div className="w-full">
              <motion.button
                onClick={() => toggleAccordion("class")}
                className="flex flex-col items-center w-full cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4"
                  initial={{ backgroundColor: "#dbeafe" }}
                  whileHover={{
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#bfdbfe",
                  }}
                >
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
                </motion.div>
                <motion.span
                  className="text-white font-medium py-2 px-6 rounded-lg w-full text-center"
                  style={{ backgroundColor: "#3b82f6" }}
                  whileHover={{
                    backgroundColor: "#2563eb",
                    y: -2,
                  }}
                >
                  Classes
                </motion.span>
              </motion.button>
              {openAccordion === "class" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center"
                >
                  <p>
                    Join our regular art classes! Our instructors will guide you
                    through developing your skills in a supportive environment.
                  </p>
                  <motion.button
                    onClick={() => setFilter("class")}
                    className="mt-3 px-4 py-1 text-white rounded-md cursor-pointer"
                    style={{ backgroundColor: "#3b82f6" }}
                    whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Events
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-full">
              <motion.button
                onClick={() => toggleAccordion("camp")}
                className="flex flex-col items-center w-full cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
                  style={{ backgroundColor: "#dcfce7" }}
                  whileHover={{
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#bbf7d0",
                  }}
                >
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
                </motion.div>
                <motion.span
                  className="text-white font-medium py-2 px-6 rounded-lg w-full text-center"
                  style={{ backgroundColor: "#22c55e" }}
                  whileHover={{
                    backgroundColor: "#16a34a",
                    y: -2,
                  }}
                >
                  Camps
                </motion.span>
              </motion.button>
              {openAccordion === "camp" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center"
                >
                  <p>
                    Our camps provide immersive art experiences for children and
                    teens. Each day is filled with creative activities,
                    skill-building, and fun!
                  </p>
                  <motion.button
                    onClick={() => setFilter("camp")}
                    className="mt-3 px-4 py-1 text-white rounded-md cursor-pointer"
                    style={{ backgroundColor: "#22c55e" }}
                    whileHover={{ scale: 1.05, backgroundColor: "#16a34a" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Events
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-full">
              <motion.button
                onClick={() => toggleAccordion("workshop")}
                className="flex flex-col items-center w-full cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
                  style={{ backgroundColor: "#f3e8ff" }}
                  whileHover={{
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#e9d5ff",
                  }}
                >
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
                </motion.div>
                <motion.span
                  className="text-white font-medium py-2 px-6 rounded-lg w-full text-center"
                  style={{ backgroundColor: "#a855f7" }}
                  whileHover={{
                    backgroundColor: "#9333ea",
                    y: -2,
                  }}
                >
                  Workshops
                </motion.span>
              </motion.button>
              {openAccordion === "workshop" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 text-center"
                >
                  <p>
                    Our specialized workshops focus on specific art techniques
                    and skills. Perfect for anyone looking to learn something
                    new or improve existing abilities.
                  </p>
                  <motion.button
                    onClick={() => setFilter("workshop")}
                    className="mt-3 px-4 py-1 text-white rounded-md cursor-pointer"
                    style={{ backgroundColor: "#a855f7" }}
                    whileHover={{ scale: 1.05, backgroundColor: "#9333ea" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Events
                  </motion.button>
                </motion.div>
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
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <motion.button
              onClick={() => setFilter("all")}
              className={`px-5 py-2.5 rounded-lg font-medium cursor-pointer ${
                filter === "all" ? "text-white shadow-lg" : "text-gray-700"
              }`}
              style={{
                backgroundColor: filter === "all" ? "#3b82f6" : "#f3f4f6",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: filter === "all" ? "#2563eb" : "#e5e7eb",
              }}
              whileTap={{ scale: 0.95 }}
            >
              All Events
            </motion.button>
            <motion.button
              onClick={() => setFilter("class")}
              className={`px-5 py-2.5 rounded-lg font-medium cursor-pointer ${
                filter === "class" ? "text-white shadow-lg" : "text-gray-700"
              }`}
              style={{
                backgroundColor: filter === "class" ? "#3b82f6" : "#f3f4f6",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: filter === "class" ? "#2563eb" : "#e5e7eb",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Classes
            </motion.button>
            <motion.button
              onClick={() => setFilter("camp")}
              className={`px-5 py-2.5 rounded-lg font-medium cursor-pointer ${
                filter === "camp" ? "text-white shadow-lg" : "text-gray-700"
              }`}
              style={{
                backgroundColor: filter === "camp" ? "#22c55e" : "#f3f4f6",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: filter === "camp" ? "#16a34a" : "#e5e7eb",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Camps
            </motion.button>
            <motion.button
              onClick={() => setFilter("workshop")}
              className={`px-5 py-2.5 rounded-lg font-medium cursor-pointer ${
                filter === "workshop" ? "text-white shadow-lg" : "text-gray-700"
              }`}
              style={{
                backgroundColor: filter === "workshop" ? "#a855f7" : "#f3f4f6",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: filter === "workshop" ? "#9333ea" : "#e5e7eb",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Workshops
            </motion.button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <motion.div
              className="h-12 w-12 border-b-2 border-blue-500 mx-auto rounded-full"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                ease: "linear",
                repeat: Infinity,
              }}
            ></motion.div>
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
              <motion.div
                key={event._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  y: -2,
                }}
              >
                <h3 className="text-xl font-medium">{event.eventName}</h3>

                <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                  <div className="text-gray-600">
                    <span className="font-medium">Date: </span>
                    {getDateInfo(event)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Time: </span>
                    {formatTime(event.time.startTime)} -{" "}
                    {formatTime(event.time.endTime)}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="font-medium">Description: </span>
                  <span className="text-gray-700">{event.description}</span>
                </div>
                <div className="mt-1">
                  <span className="font-medium">Price: </span>
                  <span className="text-gray-700">${event.price}</span>
                </div>

                {event.options.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Options: </span>
                    {event.options.map((option) => (
                      <div key={option._id} className="ml-2 mt-1">
                        <span className="text-gray-700">
                          {option.categoryName}:{" "}
                        </span>
                        <span className="text-gray-600">
                          {option.choices
                            .map((choice) => choice.name)
                            .join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/calendar/${event._id}`}
                      className="inline-block px-4 py-2 bg-primary text-black font-medium rounded-md hover:bg-blue-400 hover:text-white transition-colors border-2 border-black"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
