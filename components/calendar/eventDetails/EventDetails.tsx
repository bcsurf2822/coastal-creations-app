"use client";

import { useState, useEffect, use } from "react";
import { parseISO, format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Description,
  Settings,
} from "@mui/icons-material";

interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: {
    name: string;
    _id: string;
  }[];
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

interface EventTime {
  startTime: string;
  endTime: string;
  _id: string;
}

interface EventData {
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
}

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Helper function to format time from 24-hour to 12-hour format
const formatTime = (time: string): string => {
  if (!time) return "Time unavailable";

  try {
    // Parse the time string (assuming format like "14:30" or "14:30:00")
    const [hours, minutes] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing fails
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${period}`;
  } catch {
    return time; // Return original if any error occurs
  }
};

export default function EventDetails({
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
  const [eventPictures, setEventPictures] = useState<SanityDocument[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/event/${eventId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.error || "Event not found");
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

  useEffect(() => {
    const fetchEventPictures = async () => {
      try {
        const response = await fetch("/api/eventPictures");
        if (!response.ok) {
          throw new Error("Failed to fetch event pictures");
        }
        const data = await response.json();
        setEventPictures(data);
      } catch {
        // Optionally handle error
      }
    };
    fetchEventPictures();
  }, []);

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
  const formattedStartDate = eventData.dates?.startDate
    ? format(parseISO(eventData.dates.startDate), "EEEE, MMMM d, yyyy")
    : "Item unavailable";

  const formattedEndDate = eventData.dates?.recurringEndDate
    ? format(parseISO(eventData.dates.recurringEndDate), "EEEE, MMMM d, yyyy")
    : "Not applicable";

  // Find a matching event picture for an event
  const findMatchingEventPicture = (eventName: string) => {
    if (!eventPictures || eventPictures.length === 0) return null;
    const eventNameLower = eventName.toLowerCase();
    return eventPictures.find((picture) => {
      if (!picture.title) return false;
      const titleLower = picture.title.toLowerCase();
      return eventNameLower.includes(titleLower);
    });
  };

  // Find the matching image for this event
  const matchingPicture = findMatchingEventPicture(eventData.eventName);
  const imageUrl = matchingPicture?.image
    ? urlFor(matchingPicture.image)?.width(800).height(600).url()
    : null;

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card
          elevation={8}
          className="overflow-hidden rounded-2xl shadow-2xl bg-white"
        >
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Main Content */}
              <div className={`${imageUrl ? "lg:w-2/3" : "w-full"} p-6 lg:p-8`}>
                <Typography
                  variant="h3"
                  component="h1"
                  className="font-bold text-gray-800 mb-6 text-2xl lg:text-3xl"
                >
                  {eventData.eventName || "Item unavailable"}
                </Typography>

                {/* Event Details Grid */}
                <div className="grid gap-6 mb-8">
                  {/* Date & Time Section */}
                  <Paper elevation={2} className="p-4 rounded-xl bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CalendarToday className="text-blue-600" />
                        <div>
                          <Typography
                            variant="body1"
                            className="font-semibold text-gray-800"
                          >
                            {formattedStartDate}
                          </Typography>
                        </div>
                      </div>

                      {eventData.dates?.isRecurring && (
                        <div className="ml-8 pl-4 border-l-2 border-blue-200">
                          <Typography variant="body2" className="text-gray-600">
                            <span className="font-medium">Recurring </span>{" "}
                            {eventData.dates.recurringPattern || "Weekly"}
                            {eventData.dates.recurringEndDate &&
                              ` until ${formattedEndDate}`}
                          </Typography>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <AccessTime className="text-blue-600" />
                        <div>
                          <Typography
                            variant="body1"
                            className="font-semibold text-gray-800"
                          >
                            {formatTime(eventData.time?.startTime || "")}
                            {eventData.time?.endTime &&
                              ` - ${formatTime(eventData.time.endTime)}`}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Paper>

                  {/* Description Section */}
                  {eventData.description && (
                    <Paper elevation={2} className="p-4 rounded-xl bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Description className="text-blue-600 mt-1" />
                        <div className="flex-1">
                          <Typography
                            variant="body1"
                            className="text-gray-700 whitespace-pre-line leading-relaxed"
                          >
                            {eventData.description}
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  )}

                  {/* Price Section */}
                  {eventData.price !== undefined && (
                    <Paper elevation={2} className="p-4 rounded-xl bg-green-50">
                      <div className="flex items-center gap-3">
                        <div>
                          <Typography
                            variant="h5"
                            className="font-bold text-green-700"
                          >
                            ${eventData.price}
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  )}

                  {/* Options Section */}
                  {eventData.options && eventData.options.length > 0 && (
                    <Paper elevation={2} className="p-4 rounded-xl bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Settings className="text-blue-600 mt-1" />
                        <div className="flex-1">
                          <Typography
                            variant="subtitle2"
                            className="text-gray-600 font-medium mb-3"
                          >
                            Available Options
                          </Typography>
                          <div className="space-y-4">
                            {eventData.options.map((option, index) => (
                              <div key={option._id}>
                                <Typography
                                  variant="subtitle1"
                                  className="font-semibold text-gray-800 mb-1"
                                >
                                  {option.categoryName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  className="text-gray-600 mb-2"
                                >
                                  {option.categoryDescription}
                                </Typography>
                                <div className="ml-4 space-y-1">
                                  {option.choices.map((choice) => (
                                    <Typography
                                      key={choice._id}
                                      variant="body2"
                                      className="text-gray-700 flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                      {choice.name}
                                    </Typography>
                                  ))}
                                </div>
                                {index < eventData.options.length - 1 && (
                                  <Divider className="mt-3" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Paper>
                  )}
                </div>

                {/* Registration Button */}
                <Button
                  component={Link}
                  href={`/payments?eventId=${encodeURIComponent(
                    eventData._id
                  )}&eventTitle=${encodeURIComponent(eventData.eventName)}${
                    eventData.price !== undefined
                      ? `&price=${encodeURIComponent(eventData.price)}`
                      : ""
                  }`}
                  variant="contained"
                  size="large"
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Register for this Event
                </Button>
              </div>

              {/* Image Section */}
              {imageUrl && (
                <div className="lg:w-1/3 p-6 lg:p-8 flex items-start justify-center">
                  <div className="w-full max-w-sm">
                    <Paper
                      elevation={4}
                      className="rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={eventData.eventName}
                        className="w-full h-64 lg:h-80 object-cover"
                        width={400}
                        height={320}
                      />
                    </Paper>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
