import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Reservation from "@/lib/models/Reservations";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const LOCAL_TIMEZONE = "America/New_York";

interface CustomTime {
  date: string;
  startTime: string;
  endTime: string;
}

function generateDailyAvailability(
  startDate: Date,
  endDate: Date,
  excludeDates: Date[] = [],
  maxParticipantsPerDay: number,
  timeType: "same" | "custom" = "same",
  customTimes?: CustomTime[]
) {
  const dailyAvailability = [];
  const start = dayjs(startDate).tz(LOCAL_TIMEZONE);
  const end = dayjs(endDate).tz(LOCAL_TIMEZONE);
  const excludeSet = new Set(
    excludeDates.map(date => dayjs(date).tz(LOCAL_TIMEZONE).format('YYYY-MM-DD'))
  );

  // Create a map of custom times by date for quick lookup
  const customTimesMap = new Map<string, CustomTime>();
  if (timeType === "custom" && customTimes) {
    customTimes.forEach(ct => {
      customTimesMap.set(ct.date, ct);
    });
  }

  let currentDate = start;
  while (currentDate.isSameOrBefore(end, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');

    if (!excludeSet.has(dateStr)) {
      const dayEntry: {
        date: Date;
        maxParticipants: number;
        currentBookings: number;
        isAvailable: boolean;
        startTime?: string;
        endTime?: string;
      } = {
        date: currentDate.toDate(),
        maxParticipants: maxParticipantsPerDay,
        currentBookings: 0,
        isAvailable: true,
      };

      // Add custom times if this day has them
      if (timeType === "custom") {
        const customTime = customTimesMap.get(dateStr);
        if (customTime) {
          dayEntry.startTime = customTime.startTime;
          dayEntry.endTime = customTime.endTime;
        }
      }

      dailyAvailability.push(dayEntry);
    }

    currentDate = currentDate.add(1, 'day');
  }

  return dailyAvailability;
}

function isReservationExpired(reservation: { dates: { endDate?: Date; startDate: Date }; time: { endTime?: string } }): boolean {
  const now = new Date();
  const endDate = new Date(reservation.dates.endDate || reservation.dates.startDate);

  if (reservation.time.endTime) {
    const [hours, minutes] = reservation.time.endTime.split(":");
    endDate.setHours(parseInt(hours), parseInt(minutes));
  }

  return now > endDate;
}

async function cleanupExpiredReservations() {
  try {
    const reservations = await Reservation.find({});
    const expiredReservationIds: string[] = [];

    reservations.forEach((reservation) => {
      if (isReservationExpired(reservation)) {
        expiredReservationIds.push(reservation._id.toString());
      }
    });

    if (expiredReservationIds.length > 0) {
      const result = await Reservation.deleteMany({ _id: { $in: expiredReservationIds } });
      return result.deletedCount;
    }

    return 0;
  } catch (error) {
    console.error("[RESERVATIONS-CLEANUP] Error cleaning up expired reservations:", error);
    return 0;
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const data = await request.json();

    console.log("[RESERVATIONS-POST] Creating new reservation with data:", data);

    if (!data.maxParticipantsPerDay) {
      return NextResponse.json(
        { success: false, error: "maxParticipantsPerDay is required" },
        { status: 400 }
      );
    }

    const startDate = new Date(data.dates.startDate);
    const endDate = data.dates.endDate ? new Date(data.dates.endDate) : startDate;
    const excludeDates = data.dates.excludeDates ? data.dates.excludeDates.map((d: string) => new Date(d)) : [];

    const dailyAvailability = generateDailyAvailability(
      startDate,
      endDate,
      excludeDates,
      data.maxParticipantsPerDay,
      data.timeType || "same",
      data.customTimes
    );

    const reservationData = {
      eventName: data.eventName,
      eventType: "reservation",
      description: data.description,
      pricePerDayPerParticipant: data.pricePerDayPerParticipant,
      dates: {
        startDate,
        endDate: data.dates.endDate ? endDate : undefined,
        excludeDates: excludeDates.length > 0 ? excludeDates : undefined,
      },
      timeType: data.timeType || "same",
      time: data.time,
      dailyAvailability,
      options: data.options,
      image: data.image,
      isDiscountAvailable: data.isDiscountAvailable || false,
      discount: data.discount,
    };

    const reservation = await Reservation.create(reservationData);
    console.log("[RESERVATIONS-POST] Reservation created successfully:", reservation._id);

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error) {
    console.error("[RESERVATIONS-POST] Error creating reservation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectMongo();

    console.log("[RESERVATIONS-GET] Fetching reservations");

    await cleanupExpiredReservations();

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const filter: Record<string, string | Date | { $gte?: Date; $lte?: Date }> = { eventType: "reservation" };

    if (eventType && eventType !== "reservation") {
      filter.eventType = eventType;
    }

    if (fromDate || toDate) {
      filter["dates.startDate"] = {};
      if (fromDate) {
        filter["dates.startDate"].$gte = new Date(fromDate);
      }
      if (toDate) {
        filter["dates.startDate"].$lte = new Date(toDate);
      }
    }

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    console.log("[RESERVATIONS-GET] Found reservations:", reservations.length);

    return NextResponse.json({ success: true, data: reservations, total: reservations.length });
  } catch (error) {
    console.error("[RESERVATIONS-GET] Error fetching reservations:", error);
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
        { success: false, error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    console.log("[RESERVATIONS-DELETE] Deleting reservation:", id);

    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    console.log("[RESERVATIONS-DELETE] Reservation deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("[RESERVATIONS-DELETE] Error deleting reservation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60,
};