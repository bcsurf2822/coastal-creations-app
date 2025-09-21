import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Reservation from "@/lib/models/Reservations";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

function generateDailyAvailability(
  startDate: Date,
  endDate: Date,
  excludeDates: Date[] = [],
  maxParticipantsPerDay: number,
  existingAvailability: { date: Date; currentBookings: number; isAvailable: boolean }[] = []
) {
  const dailyAvailability = [];
  const start = dayjs(startDate).tz(LOCAL_TIMEZONE);
  const end = dayjs(endDate).tz(LOCAL_TIMEZONE);
  const excludeSet = new Set(
    excludeDates.map(date => dayjs(date).tz(LOCAL_TIMEZONE).format('YYYY-MM-DD'))
  );

  const existingBookings = new Map();
  existingAvailability.forEach(avail => {
    const dateKey = dayjs(avail.date).format('YYYY-MM-DD');
    existingBookings.set(dateKey, {
      currentBookings: avail.currentBookings || 0,
      isAvailable: avail.isAvailable !== false,
    });
  });

  let currentDate = start;
  while (currentDate.isBefore(end.add(1, 'day'))) {
    const dateStr = currentDate.format('YYYY-MM-DD');

    if (!excludeSet.has(dateStr)) {
      const existing = existingBookings.get(dateStr);

      dailyAvailability.push({
        date: currentDate.toDate(),
        maxParticipants: maxParticipantsPerDay,
        currentBookings: existing?.currentBookings || 0,
        isAvailable: existing?.isAvailable !== false,
      });
    }

    currentDate = currentDate.add(1, 'day');
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

    console.log("[RESERVATIONS-GET-ID] Fetching reservation:", id);

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    console.log("[RESERVATIONS-GET-ID] Reservation found:", reservation._id);

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

    console.log("[RESERVATIONS-PUT] Updating reservation:", id, "with data:", data);

    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    let updateData = { ...data };

    if (data.dates && (data.dates.startDate || data.dates.endDate || data.maxParticipantsPerDay)) {
      const startDate = new Date(data.dates.startDate || existingReservation.dates.startDate);
      const endDate = data.dates.endDate
        ? new Date(data.dates.endDate)
        : (existingReservation.dates.endDate || startDate);
      const excludeDates = data.dates.excludeDates
        ? data.dates.excludeDates.map((d: string) => new Date(d))
        : existingReservation.dates.excludeDates || [];
      const maxParticipantsPerDay = data.maxParticipantsPerDay ||
        (existingReservation.dailyAvailability.length > 0
          ? existingReservation.dailyAvailability[0].maxParticipants
          : 10);

      const newDailyAvailability = generateDailyAvailability(
        startDate,
        endDate,
        excludeDates,
        maxParticipantsPerDay,
        existingReservation.dailyAvailability
      );

      updateData = {
        ...updateData,
        dates: {
          startDate,
          endDate: data.dates.endDate ? endDate : undefined,
          excludeDates: excludeDates.length > 0 ? excludeDates : undefined,
        },
        dailyAvailability: newDailyAvailability,
      };

      delete updateData.maxParticipantsPerDay;
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedReservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    console.log("[RESERVATIONS-PUT] Reservation updated successfully:", updatedReservation._id);

    return NextResponse.json({ success: true, data: updatedReservation });
  } catch (error) {
    console.error("[RESERVATIONS-PUT] Error updating reservation:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}