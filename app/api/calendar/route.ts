import { google } from "googleapis";
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const CALENDAR_ID = "ashley@coastalcreationsstudio.com";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// ---------------------

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();

    // 2. Create the Google Calendar API client
    const calendar = google.calendar({
      version: "v3",
      auth: authClient as OAuth2Client,
    });

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
    console.error("Calendar API Error:", e);

    // Return a generic error response to the client
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events.",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
