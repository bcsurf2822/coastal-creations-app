"use client";
import { useState, useEffect } from "react";

// Define the type for calendar events
interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime: string;
    timeZone?: string;
  };
  end?: {
    dateTime: string;
    timeZone?: string;
  };
}

function TestCalendarFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // This function will run once when the component mounts
  useEffect(() => {
    const fetchAndLogEvents = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to fetch events from /api/calendar");

      try {
        const response = await fetch("/api/calendar");

        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          // Try to get more details from the error response body
          let errorDetails = `HTTP error! Status: ${response.status}`;
          try {
            const errData = await response.json();
            errorDetails = errData.error || errData.message || errorDetails;
          } catch (parseError) {
            // Ignore if response body isn't JSON or is empty
            console.warn("Could not parse error response body:", parseError);
          }
          throw new Error(errorDetails);
        }

        const data = await response.json();

        // Log the results
        console.log("Successfully fetched data:", data);

        // Store events in state if they exist
        if (data.events) {
          console.log("Events array:", data.events);
          setEvents(data.events);
        }

        setIsLoading(false);
      } catch (err) {
        // Log any error during the fetch process
        console.error("Error during fetch:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    };

    fetchAndLogEvents(); // Call the function
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div>
      <h2>Calendar Events</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!isLoading && !error && events.length === 0 && <p>No events found.</p>}
      {events.length > 0 && (
        <div className="events-list">
          {events.map((event, index) => (
            <div
              key={event.id || index}
              className="event-card"
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            >
              <h3>{event.summary || "Untitled Event"}</h3>
              {event.description && (
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              )}
              <p>
                <strong>Start:</strong>{" "}
                {event.start?.dateTime
                  ? new Date(event.start.dateTime).toLocaleString()
                  : "No date specified"}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {event.end?.dateTime
                  ? new Date(event.end.dateTime).toLocaleString()
                  : "No date specified"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestCalendarFetch;
