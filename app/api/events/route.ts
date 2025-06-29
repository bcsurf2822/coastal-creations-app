import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";

// Helper function to check if an event has passed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEventPast(event: any): boolean {
  const now = new Date();

  // For recurring events, check if the recurring end date has passed
  if (event.dates.isRecurring && event.dates.recurringEndDate) {
    const recurringEndDate = new Date(event.dates.recurringEndDate);
    // Add the end time to get the full end datetime
    const [hours, minutes] = event.time.endTime.split(":");
    recurringEndDate.setHours(parseInt(hours), parseInt(minutes));
    return now > recurringEndDate;
  }

  // For single events, check if the event date + end time has passed
  const eventDate = new Date(event.dates.startDate);
  const [hours, minutes] = event.time.endTime.split(":");
  eventDate.setHours(parseInt(hours), parseInt(minutes));

  return now > eventDate;
}

// Function to clean up past events
async function cleanupPastEvents() {
  try {
    const events = await Event.find({});
    const pastEventIds: string[] = [];

    events.forEach((event) => {
      if (isEventPast(event)) {
        pastEventIds.push(event._id.toString());
      }
    });

    if (pastEventIds.length > 0) {
      const result = await Event.deleteMany({ _id: { $in: pastEventIds } });
  
      return result.deletedCount;
    }

    return 0;
  } catch (error) {
    console.error("Error cleaning up past events:", error);
    return 0;
  }
}

export async function POST(request: Request) {
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

export async function GET() {
  try {
    await connectMongo();

    // Clean up past events before fetching current ones
    await cleanupPastEvents();

    const events = await Event.find({}).sort({ createdAt: -1 });
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

export const config = {
  maxDuration: 60, // Maximum execution time in seconds (default is 10s)
};
