"use client";

import { useState, useEffect } from "react";
import { IEvent } from "@/lib/models/Event";

interface Event {
  id: string;
  name: string;
  description?: string;
  eventType?: string;
  price?: number;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
    }>;
  }>;
}

export default function EventContainer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events", {
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
          description: event.description,
          eventType: event.eventType,
          price: event.price,
          startDate: event.dates?.startDate,
          endDate: event.dates?.endDate,
          startTime: event.time?.startTime,
          endTime: event.time?.endTime,
          options: event.options,
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event);
  };

  // Format date function
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A";

    // Handle various time formats (HH:MM, HH:MM:SS, etc.)
    const timeParts = timeString.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h2 className="text-xl text-gray-800 mb-4">Upcoming Events</h2>

      {isLoading ? (
        <p className="text-gray-600">Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No upcoming events.</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-100 p-3 rounded-md max-h-48 overflow-y-auto">
            <ul className="list-none p-0 m-0 divide-y divide-gray-200">
              {events.map((event) => (
                <li
                  key={event.id}
                  className={`py-2 px-3 cursor-pointer transition-colors duration-200 hover:bg-gray-200 ${
                    selectedEvent?.id === event.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {event.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedEvent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 animate-fadeIn">
              <h3 className="text-lg font-semibold text-blue-600 mb-3">
                {selectedEvent.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Details</h4>
                  <p className="text-gray-600 mb-2">
                    {selectedEvent.description || "No description available"}
                  </p>

                  <div className="mt-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {selectedEvent.eventType || "Event"}
                    </span>
                    {selectedEvent.price !== undefined && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
                        ${selectedEvent.price}
                      </span>
                    )}
                  </div>

                  {selectedEvent.options &&
                    selectedEvent.options.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-1">
                          Options
                        </h4>
                        {selectedEvent.options.map((option, index) => (
                          <div
                            key={index}
                            className="mb-2 border-l-2 border-blue-200 pl-2"
                          >
                            <p className="font-medium text-sm text-gray-700">
                              {option.categoryName}
                            </p>
                            {option.categoryDescription && (
                              <p className="text-xs text-gray-500 mb-1">
                                {option.categoryDescription}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {option.choices.map((choice, choiceIndex) => (
                                <span
                                  key={choiceIndex}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                >
                                  {choice.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Schedule</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Start:</span>{" "}
                      {formatDate(selectedEvent.startDate)}
                    </p>
                    {selectedEvent.endDate && (
                      <p>
                        <span className="text-gray-500">End:</span>{" "}
                        {formatDate(selectedEvent.endDate)}
                      </p>
                    )}
                    {selectedEvent.startTime && (
                      <p>
                        <span className="text-gray-500">Time:</span>{" "}
                        {formatTime(selectedEvent.startTime)}
                        {selectedEvent.endTime
                          ? ` - ${formatTime(selectedEvent.endTime)}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="text-sm text-red-600 hover:text-red-800 hover:cursor-pointer"
                  onClick={async () => {
                    if (
                      confirm("Are you sure you want to delete this event?")
                    ) {
                      try {
                        const response = await fetch(
                          `/api/events?id=${selectedEvent.id}`,
                          {
                            method: "DELETE",
                          }
                        );

                        if (response.ok) {
                          // Remove from state
                          setEvents(
                            events.filter((e) => e.id !== selectedEvent.id)
                          );
                          setSelectedEvent(null);
                        } else {
                          alert("Failed to delete event");
                        }
                      } catch (error) {
                        console.error("Error deleting event:", error);
                        alert("Error deleting event");
                      }
                    }
                  }}
                >
                  Delete Event
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
