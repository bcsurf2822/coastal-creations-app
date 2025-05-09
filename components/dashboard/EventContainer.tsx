// components/EventContainer.tsx
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

        const result = await response.json();

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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/events/delete-event?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete event");
      }

      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      console.log(`Deleted event with id: ${id}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

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
              className="bg-gray-200 p-4 mb-3 rounded flex justify-between items-center"
            >
              <span className="flex-grow mr-3 text-gray-800">{event.name}</span>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-300 ease-in-out cursor-pointer flex-shrink-0"
                onClick={() => handleDelete(event.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
