"use client";

import { useState, useEffect } from "react";
import { IEvent } from "@/lib/models/Event";

interface Event {
  id: string;
  name: string;
}

export default function EventContainer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events/get-events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Debug: log response status and text before parsing
        console.log("API Response Status:", response.status);
        const responseText = await response.text();

        // Log the first few characters to diagnose without exposing credentials
        console.log(
          "API Response Text (first 50 chars):",
          responseText.substring(0, 50)
        );

        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error("API returned invalid JSON response");
        }

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch events");
        }

        // Check if result.events exists, otherwise try to use result directly
        const eventsData = result.events || result;

        if (!Array.isArray(eventsData)) {
          throw new Error("API did not return an array of events");
        }

        // Transform the API data to match our Event interface
        const transformedEvents = eventsData.map((event: IEvent) => ({
          id: event._id,
          name: event.eventName,
        }));

        setEvents(transformedEvents);
        console.log("Events loaded successfully:", transformedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(typeof error === "string" ? error : (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    // Applying Tailwind classes for styling
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h2 className="text-xl text-gray-800 mb-4">Upcoming Events</h2>

      {isLoading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No upcoming events.</p>
      ) : (
        <ul className="list-none p-0 m-0">
          {events.map((event) => (
            <li
              key={event.id}
              className="bg-gray-200 p-4 mb-3 rounded flex items-center"
            >
              <span className="text-gray-800">{event.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const config = {
  maxDuration: 60, // Maximum execution time in seconds (default is 10s)
};
