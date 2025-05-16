import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Parse the request body
    const data = await request.json();

    // Extract and validate required fields
    const {
      event: eventId,
      quantity,
      isSigningUpForSelf,
      participants,
      selectedOptions,
      billingInfo,
    } = data;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Calculate total based on event price and quantity
    const total = event.price * quantity;

    // Create a new customer record
    const customer = new Customer({
      event: eventId,
      quantity,
      total,
      isSigningUpForSelf,
      participants: participants || [],
      selectedOptions: selectedOptions || [],
      billingInfo,
    });

    // Save the customer to the database
    const savedCustomer = await customer.save();

    // Return success response with the created customer
    return NextResponse.json(
      {
        success: true,
        message: "Customer registration successful",
        data: savedCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering customer:", error);

    // Handle validation errors separately
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors: Record<string, string> = {};

      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Error registering customer",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
