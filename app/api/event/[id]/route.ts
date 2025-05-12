import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const id = params.id;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60,
};
