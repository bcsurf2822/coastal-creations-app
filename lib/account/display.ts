/**
 * Presentation helpers for the customer account area (Overview / Orders /
 * Bookings). Centralized so every surface labels a booking or an order the same
 * way — name, date(s), whether the event has already happened, and a one-line
 * item summary for orders.
 */
import type { ICustomer } from "@/lib/models/Customer";

interface PopulatedEvent {
  eventName?: string;
  title?: string;
  dates?: {
    startDate?: string | Date;
    endDate?: string | Date;
    recurringEndDate?: string | Date;
  };
}

function asPopulated(event: ICustomer["event"]): PopulatedEvent | null {
  return event && typeof event === "object"
    ? (event as PopulatedEvent)
    : null;
}

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Event/class name, falling back to the stored snapshot, then a generic label. */
export function bookingEventName(booking: ICustomer): string {
  const event = asPopulated(booking.event);
  return (
    event?.eventName ??
    event?.title ??
    booking.eventSnapshot?.name ??
    "Booking"
  );
}

export function bookingTypeLabel(type: ICustomer["eventType"]): string {
  if (type === "PrivateEvent") return "Private event";
  if (type === "Reservation") return "Reservation";
  return "Class / event";
}

/** Human-readable date(s): reservation days, else the event's start date, else "—". */
export function bookingDates(booking: ICustomer): string {
  if (booking.selectedDates && booking.selectedDates.length > 0) {
    return booking.selectedDates
      .map((entry) => new Date(entry.date).toLocaleDateString())
      .join(", ");
  }
  const start =
    asPopulated(booking.event)?.dates?.startDate ??
    booking.eventSnapshot?.startDate;
  const d = toDate(start);
  return d ? d.toLocaleDateString() : "—";
}

/**
 * The last date this booking covers — the reservation's final day, or the
 * event's recurring-end / end / start date (snapshot start as a last resort).
 * Null when no date is known.
 */
export function bookingEndDate(booking: ICustomer): Date | null {
  if (booking.selectedDates && booking.selectedDates.length > 0) {
    const times = booking.selectedDates
      .map((entry) => toDate(entry.date)?.getTime())
      .filter((t): t is number => typeof t === "number");
    return times.length ? new Date(Math.max(...times)) : null;
  }
  const dates = asPopulated(booking.event)?.dates;
  return (
    toDate(dates?.recurringEndDate) ??
    toDate(dates?.endDate) ??
    toDate(dates?.startDate) ??
    toDate(booking.eventSnapshot?.startDate)
  );
}

/**
 * True once the booked event/day is in the past. Refund *requests* are for
 * cancelling an upcoming booking, so they're disallowed after this is true.
 * Unknown dates return false (don't block a legitimate cancellation).
 */
export function isBookingPast(
  booking: ICustomer,
  now: Date = new Date()
): boolean {
  const end = bookingEndDate(booking);
  return end !== null && end.getTime() < now.getTime();
}

export interface OrderItemLike {
  name: string;
  quantity: number;
}

/** "Sea Glass Kit", "2× Sticker", or "Sea Glass Kit +2 more" for multi-item orders. */
export function summarizeOrderItems(items: OrderItemLike[]): string {
  if (!items || items.length === 0) return "";
  const [first, ...rest] = items;
  const firstLabel =
    first.quantity > 1 ? `${first.quantity}× ${first.name}` : first.name;
  return rest.length === 0 ? firstLabel : `${firstLabel} +${rest.length} more`;
}
