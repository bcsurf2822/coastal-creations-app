import { google } from "googleapis";
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const CALENDAR_ID = process.env.CALENDAR_ID;

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// ---------------------

export async function GET() {
  try {


    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });


    try {
      const authClient = await auth.getClient();
 

      // 2. Create the Google Calendar API client
      const calendar = google.calendar({
        version: "v3",
        auth: authClient as OAuth2Client,
      });



      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: new Date().toISOString(), // Start from the current time
        maxResults: 500, // Fetch up to 15 events
        singleEvents: true, // Expand recurring events
        orderBy: "startTime", // Order by start time
      });


      const events = response.data.items || []; // Ensure events is always an array

      // 4. Return the events successfully
      return NextResponse.json({ events }, { status: 200 });
    } catch (authError) {
      console.error("Authentication error:", authError);
      console.error(
        "Auth error stack:",
        authError instanceof Error ? authError.stack : "No stack trace"
      );

      if (authError instanceof Error && "response" in authError) {
        // @ts-expect-error - For capturing API-specific error details
        console.error("API Error details:", authError.response?.data);
      }

      throw authError; // Rethrow to be caught by outer try/catch
    }
  } catch (e) {
    // 5. Handle errors with enhanced logging
    console.error("Calendar API Error:", e);
    console.error(
      "Error stack trace:",
      e instanceof Error ? e.stack : "No stack trace"
    );

    // Check for specific Google API error types
    if (e instanceof Error) {
      console.error("Error name:", e.name);
      console.error("Error message:", e.message);

      // Try to extract more details if it's a Google API error
      if ("response" in e) {
        // @ts-expect-error - For capturing API-specific error details
        console.error("Response status:", e.response?.status);
        // @ts-expect-error - For capturing API-specific error details
        const responseData = e.response?.data || {};
        console.error("Response data:", JSON.stringify(responseData, null, 2));
      }
    }

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events.",
        details: e instanceof Error ? e.message : String(e),
        errorType: e instanceof Error ? e.name : "Unknown",
      },
      { status: 500 }
    );
  }
}
