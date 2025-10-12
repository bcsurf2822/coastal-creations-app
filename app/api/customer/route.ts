import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import PrivateEvent from "@/lib/models/PrivateEvent";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const data = await request.json();

    const {
      event: eventId,
      eventType = "Event",
      quantity,
      total,
      isSigningUpForSelf,
      participants,
      selectedOptions,
      billingInfo,
      squarePaymentId,
      squareCustomerId,
    } = data;

    console.log(
      `[CUSTOMER-API-POST] Received eventType: ${eventType}, eventId: ${eventId}, total: ${total}`
    );

    let event;
    if (eventType === "PrivateEvent") {
      event = await PrivateEvent.findById(eventId);
    } else {
      event = await Event.findById(eventId);
    }

    if (!event) {
      return NextResponse.json(
        {
          error: `${eventType === "PrivateEvent" ? "Private event" : "Event"} not found`,
        },
        { status: 404 }
      );
    }

    const customerTotal =
      total !== undefined ? total : (event.price || 0) * quantity;

    console.log(
      `[CUSTOMER-API-POST] Using total: ${customerTotal} (provided: ${total}, calculated: ${(event.price || 0) * quantity})`
    );

    const customer = new Customer({
      event: eventId,
      eventType,
      quantity,
      total: customerTotal,
      isSigningUpForSelf,
      participants: participants || [],
      selectedOptions: selectedOptions || [],
      billingInfo,
      squarePaymentId,
      squareCustomerId,
      refundStatus: "none",
    });

    const savedCustomer = await customer.save();

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

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors: Record<string, string> = {};

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
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const eventType = searchParams.get("eventType");

    const query: { event?: string; eventType?: string } = {};
    if (eventId) {
      query.event = eventId;
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const customers = await Customer.find(query)
      .populate("event")
      .sort({ createdAt: -1 });

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

    return NextResponse.json(
      {
        error: "Error retrieving customers",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
