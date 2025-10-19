import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import PrivateEvent from "@/lib/models/PrivateEvent";
import Reservation from "@/lib/models/Reservations";
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
      selectedDates,
      billingInfo,
      squarePaymentId,
      squareCustomerId,
    } = data;

    console.log(
      `[CUSTOMER-API-POST] Received eventType: ${eventType}, eventId: ${eventId}, total: ${total}`
    );

    // Handle Reservation eventType
    if (eventType === "Reservation") {
      console.log("[CUSTOMER-API-POST] Processing Reservation booking");

      // 1. Validate reservation exists
      const reservation = await Reservation.findById(eventId);
      if (!reservation) {
        console.error("[CUSTOMER-API-POST] Reservation not found:", eventId);
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      // 2. Validate selectedDates provided
      if (
        !selectedDates ||
        !Array.isArray(selectedDates) ||
        selectedDates.length === 0
      ) {
        console.error(
          "[CUSTOMER-API-POST] selectedDates is required for Reservation"
        );
        return NextResponse.json(
          { error: "selectedDates is required for reservation bookings" },
          { status: 400 }
        );
      }

      console.log(
        "[CUSTOMER-API-POST] Validating availability for",
        selectedDates.length,
        "dates"
      );

      // 3. Validate availability for each selected date
      for (const selectedDate of selectedDates) {
        const dailyAvail = reservation.dailyAvailability.find(
          (day: {
            date: Date;
            maxParticipants: number;
            currentBookings: number;
          }) =>
            new Date(day.date).toISOString().split("T")[0] ===
            new Date(selectedDate.date).toISOString().split("T")[0]
        );

        if (!dailyAvail) {
          console.error(
            "[CUSTOMER-API-POST] Date not available:",
            selectedDate.date
          );
          return NextResponse.json(
            { error: `Date ${selectedDate.date} is not available` },
            { status: 400 }
          );
        }

        const availableSpots =
          dailyAvail.maxParticipants - dailyAvail.currentBookings;
        if (selectedDate.numberOfParticipants > availableSpots) {
          console.error(
            `[CUSTOMER-API-POST] Not enough spots on ${selectedDate.date}. Requested: ${selectedDate.numberOfParticipants}, Available: ${availableSpots}`
          );
          return NextResponse.json(
            {
              error: `Not enough spots available on ${selectedDate.date}. Only ${availableSpots} spots left.`,
            },
            { status: 400 }
          );
        }
      }

      console.log(
        "[CUSTOMER-API-POST] Availability validated, creating customer booking"
      );

      // 4. Create customer booking
      const customer = new Customer({
        event: eventId,
        eventType,
        selectedDates,
        quantity,
        total,
        isSigningUpForSelf,
        participants: participants || [],
        selectedOptions: selectedOptions || [],
        billingInfo,
        squarePaymentId,
        squareCustomerId,
        refundStatus: "none",
      });

      const savedCustomer = await customer.save();
      console.log("[CUSTOMER-API-POST] Customer created:", savedCustomer._id);

      // 5. Update availability atomically for each date
      console.log(
        "[CUSTOMER-API-POST] Updating availability for",
        selectedDates.length,
        "dates"
      );
      for (const selectedDate of selectedDates) {
        // Normalize both dates to YYYY-MM-DD for comparison
        const selectedDateStr = new Date(selectedDate.date)
          .toISOString()
          .split("T")[0];
        console.log(
          `[CUSTOMER-API-POST] Looking for date: ${selectedDateStr} in dailyAvailability`
        );

        // Find the reservation to get the exact date object from dailyAvailability
        const reservation = await Reservation.findById(eventId);
        const matchingDay = reservation?.dailyAvailability.find(
          (day: { date: Date }) => {
            const dayDateStr = new Date(day.date).toISOString().split("T")[0];
            return dayDateStr === selectedDateStr;
          }
        );

        if (!matchingDay) {
          console.error(
            `[CUSTOMER-API-POST] Could not find matching date in dailyAvailability for ${selectedDateStr}`
          );
          continue;
        }

        // Use the exact date object from dailyAvailability for the update
        const updateResult = await Reservation.findOneAndUpdate(
          {
            _id: eventId,
            "dailyAvailability.date": matchingDay.date,
          },
          {
            $inc: {
              "dailyAvailability.$.currentBookings":
                selectedDate.numberOfParticipants,
            },
          },
          { new: true }
        );

        if (!updateResult) {
          console.error(
            "[CUSTOMER-API-POST] Failed to update availability for date:",
            selectedDate.date
          );
        } else {
          console.log(
            `[CUSTOMER-API-POST] Updated availability for ${selectedDateStr}: +${selectedDate.numberOfParticipants} bookings`
          );
        }
      }

      console.log(
        "[CUSTOMER-API-POST] Reservation booking completed successfully"
      );

      return NextResponse.json(
        {
          success: true,
          message: "Reservation booking successful",
          data: savedCustomer,
        },
        { status: 201 }
      );
    }

    // Handle Event and PrivateEvent eventTypes (existing logic)
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
    console.error("[CUSTOMER-API-POST] Error registering customer:", error);

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
