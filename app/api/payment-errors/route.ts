import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import PaymentError from "@/lib/models/PaymentError";

export async function GET(request: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventId = searchParams.get("eventId");
    const customerEmail = searchParams.get("customerEmail");

    // Build query filter
    const filter: Record<string, string> = {};
    if (eventId) filter.eventId = eventId;
    if (customerEmail) filter.customerEmail = customerEmail;

    const paymentErrors = await PaymentError.find(filter)
      .sort({ attemptedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      paymentErrors,
      count: paymentErrors.length,
    });
  } catch (error) {
    console.error("Error fetching payment errors:", error);
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
        { success: false, error: "Payment error ID is required" },
        { status: 400 }
      );
    }

    const deletedError = await PaymentError.findByIdAndDelete(id);

    if (!deletedError) {
      return NextResponse.json(
        { success: false, error: "Payment error not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment error deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
