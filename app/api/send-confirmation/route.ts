import { NextResponse } from "next/server";
import { sendBookingConfirmationEmails } from "@/lib/email/sendBookingConfirmation";

/**
 * Booking confirmation emails. The actual send lives in
 * lib/email/sendBookingConfirmation.ts so the consolidated /api/checkout/booking
 * route and this legacy fire-and-forget endpoint share one implementation.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { customerId, eventId } = await request.json();

    if (!customerId || !eventId) {
      return NextResponse.json(
        { error: "Customer ID and Event ID are required" },
        { status: 400 }
      );
    }

    // Never throws — email failure must not fail an already-completed booking.
    await sendBookingConfirmationEmails(customerId, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEND-CONFIRMATION-POST] Error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending emails" },
      { status: 500 }
    );
  }
}
