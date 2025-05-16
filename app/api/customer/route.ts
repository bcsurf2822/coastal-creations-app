import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.event || !body.quantity || !body.billingInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if billingInfo has either email or phone
    if (!body.billingInfo.emailAddress && !body.billingInfo.phoneNumber) {
      return NextResponse.json(
        { error: "Either email address or phone number is required" },
        { status: 400 }
      );
    }

    // Verify the event exists
    const event = await Event.findById(body.event);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate participants data if not signing up for self
    const isSigningUpForSelf =
      body.isSigningUpForSelf !== undefined ? body.isSigningUpForSelf : true;
    if (
      !isSigningUpForSelf &&
      (!body.participants || body.participants.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Participant information is required when not signing up for self",
        },
        { status: 400 }
      );
    }

    // Validate participant count matches quantity for non-self registrations
    if (
      !isSigningUpForSelf &&
      body.participants &&
      body.participants.length !== body.quantity
    ) {
      return NextResponse.json(
        { error: "Number of participants must match the quantity" },
        { status: 400 }
      );
    }

    // Create a new customer
    const customer = new Customer({
      event: body.event,
      quantity: body.quantity,
      total: body.total || body.quantity * event.price, // Calculate if not provided
      isSigningUpForSelf: isSigningUpForSelf,
      participants: body.participants || [],
      selectedOptions: body.selectedOptions || [],
      billingInfo: {
        firstName: body.billingInfo.firstName,
        lastName: body.billingInfo.lastName,
        addressLine1: body.billingInfo.addressLine1,
        addressLine2: body.billingInfo.addressLine2,
        city: body.billingInfo.city,
        stateProvince: body.billingInfo.stateProvince,
        postalCode: body.billingInfo.postalCode,
        country: body.billingInfo.country,
        emailAddress: body.billingInfo.emailAddress,
        phoneNumber: body.billingInfo.phoneNumber,
      },
    });

    // Save the customer to the database
    await customer.save();

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating customer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export const config = {
  maxDuration: 60, // Maximum execution time in seconds (default is 10s)
};
