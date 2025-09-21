import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import PrivateEvent from "@/lib/models/PrivateEvent";

export async function POST(request: Request) {
  try {
    await connectMongo();
    const data = await request.json();
    const privateEvent = await PrivateEvent.create(data);
    return NextResponse.json({ success: true, privateEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating private event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongo();
    const privateEvents = await PrivateEvent.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, privateEvents });
  } catch (error) {
    console.error("Error fetching private events:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Private event ID is required" },
        { status: 400 }
      );
    }

    const updatedPrivateEvent = await PrivateEvent.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPrivateEvent) {
      return NextResponse.json(
        { success: false, error: "Private event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      privateEvent: updatedPrivateEvent,
    });
  } catch (error) {
    console.error("Error updating private event:", error);
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
        { success: false, error: "Private event ID is required" },
        { status: 400 }
      );
    }

    const deletedPrivateEvent = await PrivateEvent.findByIdAndDelete(id);

    if (!deletedPrivateEvent) {
      return NextResponse.json(
        { success: false, error: "Private event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Private event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting private event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60, // Maximum execution time in seconds (default is 10s)
};
