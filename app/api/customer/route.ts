import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import PrivateEvent from "@/lib/models/PrivateEvent";
import Reservation from "@/lib/models/Reservations";
import { squareCustomerService } from "@/lib/square/customers";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

// Helper function to normalize dates to YYYY-MM-DD strings for comparison
const normalizeDateString = (date: string | Date): string => {
  return dayjs.tz(date, LOCAL_TIMEZONE).format("YYYY-MM-DD");
};

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
      squareCustomerId: providedSquareCustomerId,
    } = data;

    // Create or find Square customer if not already provided
    let squareCustomerId = providedSquareCustomerId;
    if (!squareCustomerId && billingInfo) {
      try {
        const squareResult = await squareCustomerService.findOrCreateCustomer({
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: billingInfo.emailAddress,
          phone: billingInfo.phoneNumber,
          address: billingInfo.addressLine1
            ? {
                addressLine1: billingInfo.addressLine1,
                addressLine2: billingInfo.addressLine2,
                city: billingInfo.city,
                state: billingInfo.stateProvince,
                postalCode: billingInfo.postalCode,
                country: billingInfo.country || "US",
              }
            : undefined,
        });
        squareCustomerId = squareResult.customerId;
        console.log(
          `[CUSTOMER-API-POST] Square customer ${squareResult.isNew ? "created" : "found"}: ${squareCustomerId}`
        );
      } catch (squareError) {
        // Log but don't fail - Square customer creation is not critical for booking
        console.error(
          "[CUSTOMER-API-POST] Failed to create/find Square customer:",
          squareError
        );
      }
    }

    if (eventType === "Reservation") {
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

      // 3. Validate availability for each selected date
      const hasTimeSlots = reservation.enableTimeSlots === true;

      for (const selectedDate of selectedDates) {
        const dailyAvail = reservation.dailyAvailability.find(
          (day: {
            date: Date;
            maxParticipants: number;
            currentBookings: number;
            timeSlots?: Array<{
              startTime: string;
              endTime: string;
              maxParticipants: number;
              currentBookings: number;
              isAvailable: boolean;
            }>;
          }) =>
            normalizeDateString(day.date) === normalizeDateString(selectedDate.date)
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

        // Time slot validation if time slots are enabled
        if (hasTimeSlots && selectedDate.timeSlot) {
          const timeSlot = dailyAvail.timeSlots?.find(
            (slot: { startTime: string; endTime: string }) =>
              slot.startTime === selectedDate.timeSlot.startTime &&
              slot.endTime === selectedDate.timeSlot.endTime
          );

          if (!timeSlot) {
            console.error(
              "[CUSTOMER-API-POST] Time slot not found:",
              selectedDate.timeSlot
            );
            return NextResponse.json(
              {
                error: `Time slot ${selectedDate.timeSlot.startTime} - ${selectedDate.timeSlot.endTime} is not available`,
              },
              { status: 400 }
            );
          }

          const slotAvailableSpots =
            timeSlot.maxParticipants - timeSlot.currentBookings;
          if (selectedDate.numberOfParticipants > slotAvailableSpots) {
            console.error(
              `[CUSTOMER-API-POST] Not enough spots in time slot. Requested: ${selectedDate.numberOfParticipants}, Available: ${slotAvailableSpots}`
            );
            return NextResponse.json(
              {
                error: `Not enough spots available in time slot ${selectedDate.timeSlot.startTime} - ${selectedDate.timeSlot.endTime}. Only ${slotAvailableSpots} spots left.`,
              },
              { status: 400 }
            );
          }
        } else {
          // Regular day-level validation (no time slots)
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
      }

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

      // 5. Update availability with a single bulkWrite (instead of N queries per date)
      const bulkOps: Parameters<typeof Reservation.bulkWrite>[0] = [];

      for (const selectedDate of selectedDates) {
        const selectedDateStr = normalizeDateString(selectedDate.date);

        const matchingDayIndex = reservation.dailyAvailability.findIndex(
          (day: { date: Date }) =>
            normalizeDateString(day.date) === selectedDateStr
        );

        if (matchingDayIndex === -1) {
          console.error(
            `[CUSTOMER-API-POST] Could not find matching date in dailyAvailability for ${selectedDateStr}`
          );
          continue;
        }

        const matchingDay = reservation.dailyAvailability[matchingDayIndex];

        if (hasTimeSlots && selectedDate.timeSlot && matchingDay.timeSlots) {
          const slotIndex = matchingDay.timeSlots.findIndex(
            (slot: { startTime: string; endTime: string }) =>
              slot.startTime === selectedDate.timeSlot.startTime &&
              slot.endTime === selectedDate.timeSlot.endTime
          );

          if (slotIndex !== -1) {
            bulkOps.push({
              updateOne: {
                filter: {
                  _id: eventId,
                  "dailyAvailability.date": matchingDay.date,
                },
                update: {
                  $inc: {
                    [`dailyAvailability.${matchingDayIndex}.timeSlots.${slotIndex}.currentBookings`]:
                      selectedDate.numberOfParticipants,
                  },
                },
              },
            });
          } else {
            console.error(
              "[CUSTOMER-API-POST] Time slot not found for update:",
              selectedDate.timeSlot
            );
          }
        } else {
          bulkOps.push({
            updateOne: {
              filter: {
                _id: eventId,
                "dailyAvailability.date": matchingDay.date,
              },
              update: {
                $inc: {
                  "dailyAvailability.$.currentBookings":
                    selectedDate.numberOfParticipants,
                },
              },
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        const bulkResult = await Reservation.bulkWrite(bulkOps);
        console.log(
          `[CUSTOMER-API-POST] Bulk updated ${bulkResult.modifiedCount} availability records`
        );
      }

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
