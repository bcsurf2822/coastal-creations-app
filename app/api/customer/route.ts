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
      total,
      isSigningUpForSelf,
      participants,
      selectedOptions,
      billingInfo,
    } = data;

    // Log the received total for debugging
    console.log(`[CUSTOMER-API-POST] Received total: ${total}, type: ${typeof total}`);

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Use the provided total, or calculate it if not provided
    const customerTotal = total !== undefined ? total : (event.price || 0) * quantity;

    console.log(`[CUSTOMER-API-POST] Using total: ${customerTotal} (provided: ${total}, calculated: ${(event.price || 0) * quantity})`);

    // Create a new customer record
    const customer = new Customer({
      event: eventId,
      quantity,
      total: customerTotal,
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

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // Build query filter
    let query = {};
    if (eventId) {
      query = { event: eventId };
    }

    // Retrieve customers from the database with optional filtering
    const customers = await Customer.find(query).populate("event").sort({ createdAt: -1 });

    // Return success response with customers
    return NextResponse.json(
      {
        success: true,
        message: eventId 
          ? `Customers for event ${eventId} retrieved successfully`
          : "Customers retrieved successfully",
        data: customers,
        count: customers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving customers:", error);

    // Generic error response
    return NextResponse.json(
      {
        error: "Error retrieving customers",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
