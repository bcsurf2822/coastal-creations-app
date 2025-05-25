"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

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
  const [error, setError] = useState<string | null>(null);
  const [eventPictures, setEventPictures] = useState<SanityDocument[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        console.log("Fetched events data:", data);

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

  // Fetch event pictures
  useEffect(() => {
    const fetchEventPictures = async () => {
      try {
        const response = await fetch("/api/eventPictures");

        if (!response.ok) {
          throw new Error("Failed to fetch event pictures");
        }

        const data = await response.json();
        console.log("Fetched event pictures data:", data);
        setEventPictures(data);
      } catch (err) {
        console.error("Error fetching event pictures:", err);
      }
    };

    fetchEventPictures();
  }, []);

  // Find a matching event picture for an event
  const findMatchingEventPicture = (eventName: string) => {
    if (!eventPictures || eventPictures.length === 0) return null;

    // Convert event name to lowercase for case-insensitive matching
    const eventNameLower = eventName.toLowerCase();

    // Find a picture where the title is included in the event name
    return eventPictures.find((picture) => {
      if (!picture.title) return false;
      const titleLower = picture.title.toLowerCase();
      return eventNameLower.includes(titleLower);
    });
  };

  // Filter events to only show classes and workshops (exclude camps)
  const filteredEvents = events.filter((event) => {
    const eventType = event.eventType.toLowerCase();
    return eventType.includes("class") || eventType.includes("workshop");
  });

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

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8">
        Our Classes & Workshops
      </h1>

      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-lg mb-6">
          We offer a variety of classes and workshops for all ages and skill
          levels. From beginner-friendly sessions to advanced techniques,
          there&apos;s something for everyone to explore their creativity.
        </p>
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-6">
          Upcoming Classes & Workshops
        </h2>

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
            <p>No classes or workshops currently scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => {
              // Find a matching picture for this event
              const matchingPicture = findMatchingEventPicture(event.eventName);
              const imageUrl = matchingPicture?.image
                ? urlFor(matchingPicture.image)?.width(800).height(600).url()
                : null;

              return (
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
                  <div className="flex flex-col md:flex-row">
                    <div className={imageUrl ? "md:w-2/3" : "w-full"}>
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
                        <span className="text-gray-700">
                          {event.description}
                        </span>
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
                    </div>
                    {imageUrl && (
                      <div className="md:w-1/3 mb-4 md:mb-0 md:ml-4 mt-4 md:mt-0">
                        <Image
                          src={imageUrl}
                          alt={event.eventName}
                          className="rounded-lg object-cover w-full h-48"
                          width={300}
                          height={200}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
