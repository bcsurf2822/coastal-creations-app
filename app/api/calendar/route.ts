// File: app/api/getCalendarEvents/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

const CALENDAR_ID = "ashley@coastalcreationsstudio.com";
// *********************

// Scopes needed to read calendar data
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// ---------------------

export async function GET() {
  try {
    // 1. Authenticate using the Service Account credentials
    // Reads the GOOGLE_APPLICATION_CREDENTIALS environment variable automatically
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      // Optional: Explicitly specify credentials path if needed, but env var is standard
      // keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    const authClient = await auth.getClient();

    // 2. Create the Google Calendar API client
    const calendar = google.calendar({ version: "v3", auth: authClient });

    // 3. Fetch upcoming events from the specified calendar
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date().toISOString(), // Start from the current time
      maxResults: 15, // Fetch up to 15 events
      singleEvents: true, // Expand recurring events
      orderBy: "startTime", // Order by start time
    });

    const events = response.data.items || []; // Ensure events is always an array

    // 4. Return the events successfully
    return NextResponse.json({ events }, { status: 200 });
  } catch (e) {
    // 5. Handle errors

    // Log the detailed error server-side (won't be sent to client)
    // console.error(error);

    // Return a generic error response to the client
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events.",
        // Optionally include non-sensitive error details
        // details: error.message
      },
      { status: 500 }
    );
  }
}
