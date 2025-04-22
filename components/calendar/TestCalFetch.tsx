"use client";
import { useState, useEffect } from "react";

function TestCalendarFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // *** THIS IS WHERE THE RESULTS ARE LOGGED ***
        console.log("Successfully fetched data:", data);
        // Specifically log the events array if it exists
        if (data.events) {
          console.log("Events array:", data.events);
        }
        // ********************************************

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
      <h2>Testing Calendar API Fetch</h2>
      {isLoading && <p>Loading... Check the browser console.</p>}
      {error && (
        <p style={{ color: "red" }}>
          Error: {error}. Check the browser console and terminal logs.
        </p>
      )}
      {!isLoading && !error && (
        <p>
          Fetch attempt complete. Check the browser console for logged results
          or errors.
        </p>
      )}
    </div>
  );
}

export default TestCalendarFetch;
