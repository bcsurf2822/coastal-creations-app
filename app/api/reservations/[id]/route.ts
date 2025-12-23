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

// Time slot type - only 1, 2, or 4 hours allowed
type SlotDurationMinutes = 60 | 120 | 240;

interface TimeSlot {
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
}

// Generate time slots based on operating hours and slot duration
function generateTimeSlots(
  operatingStartTime: string,
  operatingEndTime: string,
  slotDurationMinutes: SlotDurationMinutes,
  maxParticipantsPerSlot: number,
  existingSlots?: TimeSlot[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  if (!operatingStartTime || !operatingEndTime) return slots;

  // Create a map of existing bookings by slot time for preservation
  const existingBookingsMap = new Map<string, { currentBookings: number; isAvailable: boolean }>();
  if (existingSlots) {
    existingSlots.forEach((slot) => {
      existingBookingsMap.set(slot.startTime, {
        currentBookings: slot.currentBookings || 0,
        isAvailable: slot.isAvailable !== false,
      });
    });
  }

  let current = dayjs(`2000-01-01 ${operatingStartTime}`);
  const end = dayjs(`2000-01-01 ${operatingEndTime}`);

  while (current.add(slotDurationMinutes, "minute").isSameOrBefore(end)) {
    const slotEnd = current.add(slotDurationMinutes, "minute");
    const slotStartTime = current.format("HH:mm");
    const existing = existingBookingsMap.get(slotStartTime);

    slots.push({
      startTime: slotStartTime,
      endTime: slotEnd.format("HH:mm"),
      maxParticipants: maxParticipantsPerSlot,
      currentBookings: existing?.currentBookings || 0,
      isAvailable: existing?.isAvailable !== false,
    });
    current = slotEnd;
  }

  return slots;
}

interface TimeSlotConfig {
  enableTimeSlots: boolean;
  slotDurationMinutes?: SlotDurationMinutes;
  maxParticipantsPerSlot?: number;
  operatingStartTime?: string;
  operatingEndTime?: string;
}

interface ExistingDayAvailability {
  date: Date;
  currentBookings: number;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  timeSlots?: TimeSlot[];
}

function generateDailyAvailability(
  startDate: Date,
  endDate: Date,
  excludeDates: Date[] = [],
  maxParticipantsPerDay: number,
  existingAvailability: ExistingDayAvailability[] = [],
  timeType: "same" | "custom" = "same",
  customTimes?: CustomTime[],
  timeSlotConfig?: TimeSlotConfig
) {
  const dailyAvailability = [];
  const start = dayjs(startDate).tz(LOCAL_TIMEZONE);
  const end = dayjs(endDate).tz(LOCAL_TIMEZONE);
  const excludeSet = new Set(
    excludeDates.map((date) =>
      dayjs(date).tz(LOCAL_TIMEZONE).format("YYYY-MM-DD")
    )
  );

  const existingBookings = new Map<string, ExistingDayAvailability>();
  existingAvailability.forEach((avail) => {
    const dateKey = dayjs(avail.date).format("YYYY-MM-DD");
    existingBookings.set(dateKey, avail);
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
        timeSlots?: TimeSlot[];
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

      // Generate time slots if enabled
      if (
        timeSlotConfig?.enableTimeSlots &&
        timeType === "same" &&
        timeSlotConfig.slotDurationMinutes &&
        timeSlotConfig.maxParticipantsPerSlot &&
        timeSlotConfig.operatingStartTime &&
        timeSlotConfig.operatingEndTime
      ) {
        dayEntry.timeSlots = generateTimeSlots(
          timeSlotConfig.operatingStartTime,
          timeSlotConfig.operatingEndTime,
          timeSlotConfig.slotDurationMinutes,
          timeSlotConfig.maxParticipantsPerSlot,
          existing?.timeSlots
        );
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

      // Prepare time slot configuration - always enabled when timeType is "same"
      const enableTimeSlots = timeType === "same";
      const timeSlotConfig: TimeSlotConfig = {
        enableTimeSlots,
        slotDurationMinutes: enableTimeSlots
          ? (data.slotDurationMinutes ?? existingReservation.slotDurationMinutes ?? 60)
          : undefined,
        maxParticipantsPerSlot: enableTimeSlots
          ? (data.maxParticipantsPerSlot ?? existingReservation.maxParticipantsPerSlot ?? 1)
          : undefined,
        operatingStartTime: data.time?.startTime ?? existingReservation.time?.startTime,
        operatingEndTime: data.time?.endTime ?? existingReservation.time?.endTime,
      };

      const newDailyAvailability = generateDailyAvailability(
        startDate,
        endDate,
        excludeDates,
        maxParticipantsPerDay,
        existingReservation.dailyAvailability,
        timeType,
        customTimes,
        timeSlotConfig
      );

      updateData = {
        ...updateData,
        dates: {
          startDate,
          endDate: data.dates.endDate ? endDate : undefined,
          excludeDates: excludeDates.length > 0 ? excludeDates : undefined,
        },
        timeType,
        // Time slot configuration
        enableTimeSlots,
        slotDurationMinutes: enableTimeSlots ? timeSlotConfig.slotDurationMinutes : undefined,
        maxParticipantsPerSlot: enableTimeSlots ? timeSlotConfig.maxParticipantsPerSlot : undefined,
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
