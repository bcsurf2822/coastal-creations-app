import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Reservation from "@/lib/models/Reservations";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
  existingAvailability: {
    date: Date;
    currentBookings: number;
    isAvailable: boolean;
    startTime?: string;
    endTime?: string;
  }[] = [],
  timeType: "same" | "custom" = "same",
  customTimes?: CustomTime[]
) {
  const dailyAvailability = [];
  const start = dayjs(startDate).tz(LOCAL_TIMEZONE);
  const end = dayjs(endDate).tz(LOCAL_TIMEZONE);
  const excludeSet = new Set(
    excludeDates.map((date) =>
      dayjs(date).tz(LOCAL_TIMEZONE).format("YYYY-MM-DD")
    )
  );

  const existingBookings = new Map();
  existingAvailability.forEach((avail) => {
    const dateKey = dayjs(avail.date).format("YYYY-MM-DD");
    existingBookings.set(dateKey, {
      currentBookings: avail.currentBookings || 0,
      isAvailable: avail.isAvailable !== false,
      startTime: avail.startTime,
      endTime: avail.endTime,
    });
  });

  // Create a map of custom times by date for quick lookup
  const customTimesMap = new Map<string, CustomTime>();
  if (timeType === "custom" && customTimes) {
    customTimes.forEach((ct) => {
      customTimesMap.set(ct.date, ct);
    });
  }

  let currentDate = start;
  while (currentDate.isBefore(end.add(1, "day"))) {
    const dateStr = currentDate.format("YYYY-MM-DD");

    if (!excludeSet.has(dateStr)) {
      const existing = existingBookings.get(dateStr);

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
        currentBookings: existing?.currentBookings || 0,
        isAvailable: existing?.isAvailable !== false,
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

    currentDate = currentDate.add(1, "day");
  }

  return dailyAvailability;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error("[RESERVATIONS-GET-ID] Error fetching reservation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reservation ID is required" },
        { status: 400 }
      );
    }
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    let updateData = { ...data };

    if (
      data.dates &&
      (data.dates.startDate || data.dates.endDate || data.maxParticipantsPerDay)
    ) {
      const startDate = dayjs
        .tz(data.dates.startDate || existingReservation.dates.startDate, LOCAL_TIMEZONE)
        .startOf("day")
        .toDate();
      const endDate = data.dates.endDate
        ? dayjs.tz(data.dates.endDate, LOCAL_TIMEZONE).startOf("day").toDate()
        : existingReservation.dates.endDate || startDate;
      const excludeDates = data.dates.excludeDates
        ? data.dates.excludeDates.map((d: string) =>
            dayjs.tz(d, LOCAL_TIMEZONE).startOf("day").toDate()
          )
        : existingReservation.dates.excludeDates || [];
      const maxParticipantsPerDay =
        data.maxParticipantsPerDay ||
        (existingReservation.dailyAvailability.length > 0
          ? existingReservation.dailyAvailability[0].maxParticipants
          : 10);

      const timeType = data.timeType || existingReservation.timeType || "same";
      const customTimes = data.customTimes || undefined;

      const newDailyAvailability = generateDailyAvailability(
        startDate,
        endDate,
        excludeDates,
        maxParticipantsPerDay,
        existingReservation.dailyAvailability,
        timeType,
        customTimes
      );

      updateData = {
        ...updateData,
        dates: {
          startDate,
          endDate: data.dates.endDate ? endDate : undefined,
          excludeDates: excludeDates.length > 0 ? excludeDates : undefined,
        },
        timeType,
        dailyAvailability: newDailyAvailability,
      };

      delete updateData.maxParticipantsPerDay;
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedReservation });
  } catch (error) {
    console.error("[RESERVATIONS-PUT] Error updating reservation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
