import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Event from "@/lib/models/Event";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const event = await Event.create(data);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
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
