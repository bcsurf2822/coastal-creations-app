import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Birthday from "@/lib/models/Birthday";

export async function POST(request: Request) {
  try {
    await connectMongo();
    const data = await request.json();
    const birthday = await Birthday.create(data);
    return NextResponse.json({ success: true, birthday }, { status: 201 });
  } catch (error) {
    console.error("Error creating birthday party:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongo();
    const birthdays = await Birthday.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, birthdays });
  } catch (error) {
    console.error("Error fetching birthday parties:", error);
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
        { success: false, error: "Birthday party ID is required" },
        { status: 400 }
      );
    }

    const updatedBirthday = await Birthday.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedBirthday) {
      return NextResponse.json(
        { success: false, error: "Birthday party not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      birthday: updatedBirthday,
    });
  } catch (error) {
    console.error("Error updating birthday party:", error);
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
        { success: false, error: "Birthday party ID is required" },
        { status: 400 }
      );
    }

    const deletedBirthday = await Birthday.findByIdAndDelete(id);

    if (!deletedBirthday) {
      return NextResponse.json(
        { success: false, error: "Birthday party not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Birthday party deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting birthday party:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60, // Maximum execution time in seconds (default is 10s)
};
