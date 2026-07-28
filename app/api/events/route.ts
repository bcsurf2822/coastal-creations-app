import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

// Function to clean up past events using database-side filtering.
// Compares against start-of-today (conservative: events linger ~24h max
// past their end time, but avoids loading the entire collection into memory).
async function cleanupPastEvents(): Promise<number> {
  try {
    const todayStart = dayjs().tz(LOCAL_TIMEZONE).startOf("day").toDate();

    const result = await Event.deleteMany({
      $or: [
        // Recurring events whose recurring end date has passed
        {
          "dates.isRecurring": true,
          "dates.recurringEndDate": { $lt: todayStart },
        },
        // Non-recurring events whose start date has passed
        {
          "dates.isRecurring": { $ne: true },
          "dates.startDate": { $lt: todayStart },
        },
      ],
    });

    if (result.deletedCount > 0) {
      console.log(`[EVENTS-CLEANUP] Deleted ${result.deletedCount} past events`);
    }
    return result.deletedCount || 0;
  } catch (error) {
    console.error("[EVENTS-CLEANUP] Error cleaning up past events:", error);
    return 0;
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const data = await request.json();

    // For artist events, ensure optional fields are handled properly
    if (data.eventType === "artist") {
      // Remove price if undefined or null for artist events
      if (data.price === undefined || data.price === null) {
        delete data.price;
      }
      // Ensure recurring is false for artist events
      if (data.dates) {
        data.dates.isRecurring = false;
        delete data.dates.recurringPattern;
        delete data.dates.recurringEndDate;
      }
      // Remove options for artist events
      delete data.options;
    }

    const event = await Event.create(data);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    console.error("Error details:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectMongo();

    // Clean up past events before fetching current ones
    await cleanupPastEvents();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("type");

    // Build filter object
    const filter: { eventType?: string } = {};
    if (eventType) {
      filter.eventType = eventType;
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const maxDuration = 60; // Maximum execution time in seconds (default is 10s)
