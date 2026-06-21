/**
 * Server-side authoritative booking charge resolution.
 *
 * Recomputes the booking total from the database (never trusting a client-supplied
 * price), validates any applied gift card against Square's REAL balance, and returns
 * the amount to put on the card. Shared by the legacy `submitPayment` server action
 * and the consolidated `/api/checkout/booking` route so the two can never diverge.
 *
 * See ecommerce/09-checkout-price-integrity.md.
 */
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import PrivateEvent from "@/lib/models/PrivateEvent";
import Reservation from "@/lib/models/Reservations";
import { giftCardService } from "@/lib/square/gift-cards";
import {
  computeEventChargeCents,
  computePrivateEventChargeCents,
  computeReservationChargeCents,
  type SelectedOption,
  type BookingParticipant,
} from "@/lib/checkout/eventPricing";
import { PriceIntegrityError } from "@/lib/checkout/errors";

/**
 * The customer's booking selection — the ONLY price-determining inputs we accept.
 * The charge is recomputed from the DB document for these, never from a client total.
 */
export interface BookingSelectionInput {
  eventId: string;
  eventType?: "Event" | "PrivateEvent" | "Reservation";
  quantity?: number;
  isSigningUpForSelf?: boolean;
  selectedOptions?: SelectedOption[];
  participants?: BookingParticipant[];
  selectedDates?: Array<{ numberOfParticipants?: number; participants?: number }>;
  /** Optional gift card the customer applied — validated against Square below. */
  giftCard?: { giftCardId: string; amountCents: number };
}

export interface ResolvedCharge {
  totalCents: number;
  giftCardAppliedCents: number;
  chargeCents: number;
}

export async function resolveBookingCharge(
  booking: BookingSelectionInput
): Promise<ResolvedCharge> {
  await connectMongo();

  const quantity = booking.quantity ?? 0;
  let totalCents: number;

  if (booking.eventType === "Reservation") {
    const reservation = await Reservation.findById(booking.eventId);
    if (!reservation) throw new PriceIntegrityError("Reservation not found");
    totalCents = computeReservationChargeCents(reservation, {
      selectedDates: booking.selectedDates ?? [],
      participants: booking.participants,
    });
  } else if (booking.eventType === "PrivateEvent") {
    const privateEvent = await PrivateEvent.findById(booking.eventId);
    if (!privateEvent) throw new PriceIntegrityError("Private event not found");
    totalCents = computePrivateEventChargeCents(privateEvent, {
      quantity,
      isSigningUpForSelf: booking.isSigningUpForSelf,
      selectedOptions: booking.selectedOptions,
      participants: booking.participants,
    });
  } else {
    const event = await Event.findById(booking.eventId);
    if (!event) throw new PriceIntegrityError("Event not found");
    totalCents = computeEventChargeCents(event, {
      quantity,
      isSigningUpForSelf: booking.isSigningUpForSelf,
      selectedOptions: booking.selectedOptions,
      participants: booking.participants,
    });
  }

  // Validate the applied gift card against Square's REAL balance. An invalid,
  // inactive, or insufficient card simply applies $0 (customer pays full on card)
  // — a tampered "amountCents" can never reduce the charge below the real balance.
  let giftCardAppliedCents = 0;
  if (booking.giftCard && booking.giftCard.amountCents > 0) {
    try {
      const card = await giftCardService.getById(booking.giftCard.giftCardId);
      const available =
        card && card.state === "ACTIVE" ? card.balanceMoney.amount : 0;
      giftCardAppliedCents = Math.max(
        0,
        Math.min(booking.giftCard.amountCents, available, totalCents)
      );
    } catch (giftCardError) {
      console.error(
        "[RESOLVE-BOOKING-CHARGE] Gift card validation failed (applying $0):",
        giftCardError
      );
    }
  }

  return {
    totalCents,
    giftCardAppliedCents,
    chargeCents: Math.max(0, totalCents - giftCardAppliedCents),
  };
}
