/**
 * Reservation availability: validation + the booking decrement ops.
 *
 * Extracted from /api/customer so the consolidated /api/checkout/booking route and
 * the legacy route share one implementation of day/time-slot capacity checks and
 * the `$inc` currentBookings updates. Dates are compared on the America/New_York
 * calendar day (the studio's local zone), matching how availability is stored.
 */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

export function normalizeDateString(date: string | Date): string {
  return dayjs.tz(date, LOCAL_TIMEZONE).format("YYYY-MM-DD");
}

export interface SelectedReservationDate {
  date: string | Date;
  numberOfParticipants: number;
  timeSlot?: { startTime: string; endTime: string };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
}

interface DailyAvailability {
  date: Date;
  maxParticipants: number;
  currentBookings: number;
  timeSlots?: TimeSlot[];
}

export interface ReservationDoc {
  _id: unknown;
  enableTimeSlots?: boolean;
  dailyAvailability: DailyAvailability[];
}

/**
 * Validate that every selected date (and time slot, if enabled) has enough spots.
 * Returns an error message string if unavailable, or null when all dates are OK.
 */
export function validateReservationAvailability(
  reservation: ReservationDoc,
  selectedDates: SelectedReservationDate[]
): string | null {
  const hasTimeSlots = reservation.enableTimeSlots === true;

  for (const selectedDate of selectedDates) {
    const dailyAvail = reservation.dailyAvailability.find(
      (day) =>
        normalizeDateString(day.date) === normalizeDateString(selectedDate.date)
    );

    if (!dailyAvail) {
      return `Date ${selectedDate.date} is not available`;
    }

    if (hasTimeSlots && selectedDate.timeSlot) {
      const timeSlot = dailyAvail.timeSlots?.find(
        (slot) =>
          slot.startTime === selectedDate.timeSlot!.startTime &&
          slot.endTime === selectedDate.timeSlot!.endTime
      );
      if (!timeSlot) {
        return `Time slot ${selectedDate.timeSlot.startTime} - ${selectedDate.timeSlot.endTime} is not available`;
      }
      const slotAvailableSpots = timeSlot.maxParticipants - timeSlot.currentBookings;
      if (selectedDate.numberOfParticipants > slotAvailableSpots) {
        return `Not enough spots available in time slot ${selectedDate.timeSlot.startTime} - ${selectedDate.timeSlot.endTime}. Only ${slotAvailableSpots} spots left.`;
      }
    } else {
      const availableSpots = dailyAvail.maxParticipants - dailyAvail.currentBookings;
      if (selectedDate.numberOfParticipants > availableSpots) {
        return `Not enough spots available on ${selectedDate.date}. Only ${availableSpots} spots left.`;
      }
    }
  }

  return null;
}

export interface ReservationBulkOp {
  updateOne: {
    filter: Record<string, unknown>;
    update: { $inc: Record<string, number> };
  };
}

/**
 * Build the bulkWrite `$inc` ops that apply this booking to the reservation's
 * availability (one op per selected date / time slot). The caller runs
 * `Reservation.bulkWrite(ops)` only AFTER a successful charge + saved booking.
 */
export function buildReservationDecrementOps(
  reservation: ReservationDoc,
  eventId: string,
  selectedDates: SelectedReservationDate[]
): ReservationBulkOp[] {
  const hasTimeSlots = reservation.enableTimeSlots === true;
  const bulkOps: ReservationBulkOp[] = [];

  for (const selectedDate of selectedDates) {
    const selectedDateStr = normalizeDateString(selectedDate.date);
    const matchingDayIndex = reservation.dailyAvailability.findIndex(
      (day) => normalizeDateString(day.date) === selectedDateStr
    );
    if (matchingDayIndex === -1) continue;

    const matchingDay = reservation.dailyAvailability[matchingDayIndex];

    if (hasTimeSlots && selectedDate.timeSlot && matchingDay.timeSlots) {
      const slotIndex = matchingDay.timeSlots.findIndex(
        (slot) =>
          slot.startTime === selectedDate.timeSlot!.startTime &&
          slot.endTime === selectedDate.timeSlot!.endTime
      );
      if (slotIndex !== -1) {
        bulkOps.push({
          updateOne: {
            filter: { _id: eventId, "dailyAvailability.date": matchingDay.date },
            update: {
              $inc: {
                [`dailyAvailability.${matchingDayIndex}.timeSlots.${slotIndex}.currentBookings`]:
                  selectedDate.numberOfParticipants,
              },
            },
          },
        });
      }
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: eventId, "dailyAvailability.date": matchingDay.date },
          update: {
            $inc: {
              "dailyAvailability.$.currentBookings": selectedDate.numberOfParticipants,
            },
          },
        },
      });
    }
  }

  return bulkOps;
}
