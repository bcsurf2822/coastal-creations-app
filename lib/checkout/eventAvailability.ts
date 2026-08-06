/**
 * Event capacity: the server-side check the Reservation booking path already
 * had (see reservationAvailability.ts) but the Event/PrivateEvent path never
 * did — `numberOfParticipants` was enforced only as a client-side "Sold Out"
 * badge (EventCard.tsx), never re-checked when the booking is actually saved.
 *
 * Default cap of 20 when `numberOfParticipants` is unset matches EventCard's
 * existing display fallback (`event.numberOfParticipants || 20`) — parity
 * with current user-facing behavior, not a new policy.
 */
import Customer from "@/lib/models/Customer";

const DEFAULT_CAPACITY = 20;

/**
 * Sum of `quantity` across existing bookings for an event — the same
 * definition EventsContainer.tsx uses client-side to compute
 * `eventParticipantCounts` (no refundStatus filter), kept consistent here.
 */
export async function getEventParticipantCount(
  eventId: string
): Promise<number> {
  const bookings = await Customer.find({ event: eventId })
    .select("quantity")
    .lean();

  return bookings.reduce((sum, booking) => sum + (booking.quantity || 0), 0);
}

/**
 * Validate that `requestedQuantity` more participants still fit under the
 * event's cap. Returns an error message string if not, or null when OK.
 */
export function validateEventCapacity(
  currentCount: number,
  requestedQuantity: number,
  numberOfParticipants: number | undefined
): string | null {
  const cap = numberOfParticipants || DEFAULT_CAPACITY;
  const availableSpots = cap - currentCount;

  if (requestedQuantity > availableSpots) {
    return availableSpots > 0
      ? `Not enough spots available. Only ${availableSpots} spot${availableSpots === 1 ? "" : "s"} left.`
      : `This event is sold out.`;
  }

  return null;
}
