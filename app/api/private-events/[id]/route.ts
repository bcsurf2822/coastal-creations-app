import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import PrivateEvent from "@/lib/models/PrivateEvent";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Private event ID is required" },
        { status: 400 }
      );
    }

    const privateEvent = await PrivateEvent.findById(id);

    if (!privateEvent) {
      return NextResponse.json(
        { success: false, error: "Private event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      privateEvent,
    });
  } catch (error) {
    console.error("[PRIVATE-EVENT-GET] Error fetching private event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60,
};