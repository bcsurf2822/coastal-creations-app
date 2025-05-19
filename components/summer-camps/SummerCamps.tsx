"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import {
  FaCampground,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";
import Link from "next/link";

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: string;
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

const SummerCamps = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter for camps
  const campEvents = events.filter((event) => event.eventType === "camp");

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2 flex items-center justify-center gap-2 text-blue-700">
        <FaCampground className="inline-block text-green-600" /> Summer Camps
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Spend your Summer Creating at Coastal Creations!
      </p>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin text-3xl text-blue-400 mr-2">
            <FaCampground />
          </span>
          <span className="text-lg text-gray-500">Loading camps...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      ) : campEvents.length === 0 ? (
        <div className="text-center text-gray-500">No summer camps found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campEvents.map((event) => (
            <Card
              key={event._id}
              className="shadow-xl border border-blue-100 hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-green-50"
            >
              {event.image && (
                <CardMedia
                  component="img"
                  height="180"
                  image={event.image}
                  alt={event.eventName}
                  className="object-cover"
                />
              )}
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="font-bold"
                  >
                    {event.eventName}
                  </Typography>
                </div>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="mb-3"
                >
                  {event.description}
                </Typography>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaCalendarAlt />
                    <span>
                      {formatDate(event.dates.startDate)}
                      {event.dates.endDate &&
                        ` - ${formatDate(event.dates.endDate)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaClock />
                    <span>
                      {formatTime(event.time.startTime)}
                      {event.time.endTime &&
                        ` - ${formatTime(event.time.endTime)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <FaDollarSign />
                    <span className="font-semibold">
                      {event.price ? `${event.price}` : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link
                      href={`/calendar/${event._id}`}
                      className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-sm"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummerCamps;
