/**
 * Booking Checkout API (consolidated, server-orchestrated).
 *
 * One atomic POST for event / private-event / reservation registration — mirrors
 * /api/store/checkout. Replaces the fragile client-side orchestration (submitPayment
 * action → /api/customer → /api/send-confirmation) where a successful charge could
 * be followed by a failed booking write, leaving a charge with no record.
 *
 * Flow:
 *   1. PRICE INTEGRITY: recompute the charge server-side from the DB (resolveBookingCharge);
 *      a client-supplied price is never trusted.
 *   2. Reservations: validate day/time-slot availability BEFORE charging.
 *   3. Link/create the Square customer (non-fatal).
 *   4. Charge Square for the card portion (skipped when free or fully gift-card-covered).
 *   5. Redeem the applied gift card.
 *   6. Create the Customer booking record; decrement reservation availability.
 *   7. Send the confirmation email (Event only; non-fatal).
 *
 * Contact is name + email + phone only — Square needs no billing address to charge
 * (the card form collects the postal code for AVS); address is a store-only concern.
 */
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Reservation from "@/lib/models/Reservations";
import { getSquareClient } from "@/lib/square/client";
import { squareCustomerService } from "@/lib/square/customers";
import { squareCardService } from "@/lib/square/cards";
import { resolveUserSquareCustomerId } from "@/lib/square/userCustomer";
import { getSessionUser } from "@/lib/auth/guards";
import { giftCardService } from "@/lib/square/gift-cards";
import { resolveBookingCharge } from "@/lib/checkout/resolveBookingCharge";
import { PriceIntegrityError } from "@/lib/checkout/errors";
import { normalizeIdempotencyKey } from "@/lib/checkout/idempotency";
import { sendBookingConfirmationEmails } from "@/lib/email/sendBookingConfirmation";
import {
  validateReservationAvailability,
  buildReservationDecrementOps,
  type SelectedReservationDate,
  type ReservationDoc,
} from "@/lib/checkout/reservationAvailability";

interface SelectedOption {
  categoryName: string;
  choiceName: string;
}

interface BookingCheckoutRequest {
  paymentToken?: string;
  idempotencyKey?: string;
  /** SCA verification token from tokenize (new-card path). */
  verificationToken?: string;
  /** Charge a saved card on file instead of a new nonce (signed-in users only). */
  savedCardId?: string;
  /** Save the new card on file after charging (signed-in users only). */
  saveCard?: boolean;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  booking: {
    eventId: string;
    eventType?: "Event" | "PrivateEvent" | "Reservation";
    quantity?: number;
    isSigningUpForSelf?: boolean;
    selectedOptions?: SelectedOption[];
    participants?: Array<{
      firstName: string;
      lastName: string;
      selectedOptions?: SelectedOption[];
    }>;
    selectedDates?: SelectedReservationDate[];
    giftCard?: { giftCardId: string; amountCents: number };
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as BookingCheckoutRequest;
    const { paymentToken, contact, booking } = body;

    if (!booking?.eventId) {
      return NextResponse.json(
        { error: "Missing booking selection" },
        { status: 400 }
      );
    }
    if (!contact?.firstName || !contact?.lastName || !contact?.email || !contact?.phone) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone are required" },
        { status: 400 }
      );
    }

    await connectMongo();
    const eventType = booking.eventType ?? "Event";

    // Signed-in user (null for guests) — needed for saved cards / save-on-file.
    const sessionUser = await getSessionUser();

    // 1. PRICE INTEGRITY — authoritative charge recomputed from the DB.
    const { totalCents, giftCardAppliedCents, chargeCents } =
      await resolveBookingCharge(booking);

    // 2. Reservation availability — validate BEFORE charging (no charge on failure).
    let reservation: ReservationDoc | null = null;
    if (eventType === "Reservation") {
      if (!booking.selectedDates?.length) {
        return NextResponse.json(
          { error: "selectedDates is required for reservation bookings" },
          { status: 400 }
        );
      }
      reservation = (await Reservation.findById(
        booking.eventId
      )) as unknown as ReservationDoc | null;
      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }
      const availabilityError = validateReservationAvailability(
        reservation,
        booking.selectedDates
      );
      if (availabilityError) {
        return NextResponse.json({ error: availabilityError }, { status: 400 });
      }
    }

    // 3. Link/create the Square customer (non-fatal — never fail a paid booking).
    let squareCustomerId: string | undefined;
    try {
      const result = await squareCustomerService.findOrCreateCustomer({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email.toLowerCase(),
        phone: contact.phone,
      });
      squareCustomerId = result.customerId;
    } catch (squareError) {
      console.error(
        "[API-CHECKOUT-BOOKING-POST] Square customer link failed (non-fatal):",
        squareError
      );
    }

    // Cards on file live on the signed-in user's Square customer. Resolve it when a
    // saved card is being used or a new card is being saved.
    let accountCustomerId: string | null = null;
    if (sessionUser && (body.savedCardId || body.saveCard)) {
      accountCustomerId = await resolveUserSquareCustomerId(sessionUser, {
        createIfMissing: Boolean(body.saveCard),
      });
    }

    // A saved card must belong to THIS user's customer — otherwise reject.
    if (body.savedCardId) {
      if (!sessionUser || !accountCustomerId) {
        return NextResponse.json(
          { error: "Sign in to use a saved card" },
          { status: 401 }
        );
      }
      const owned = await squareCardService.getCard(body.savedCardId);
      if (!owned || owned.customerId !== accountCustomerId) {
        return NextResponse.json({ error: "Saved card not found" }, { status: 404 });
      }
    }

    // 4. Charge the card portion (skipped when free or fully gift-card-covered).
    let squarePaymentId: string;
    if (chargeCents > 0) {
      const usingSavedCard = Boolean(body.savedCardId);
      if (!usingSavedCard && !paymentToken) {
        return NextResponse.json(
          { error: "Payment information is required" },
          { status: 400 }
        );
      }
      const client = getSquareClient();
      // Saved card charges under its owning (account) customer; a new card uses the
      // booking's email-resolved customer.
      const chargeCustomerId = usingSavedCard
        ? accountCustomerId ?? undefined
        : squareCustomerId;
      const paymentResult = await client.payments.create({
        idempotencyKey: normalizeIdempotencyKey(body.idempotencyKey),
        sourceId: body.savedCardId ?? (paymentToken as string),
        ...(body.verificationToken
          ? { verificationToken: body.verificationToken }
          : {}),
        amountMoney: { amount: BigInt(chargeCents), currency: "USD" },
        referenceId: booking.eventId,
        customerId: chargeCustomerId,
        buyerEmailAddress: contact.email,
        note: "Coastal Creations Studio — booking",
      });
      const payment = paymentResult.payment;
      if (payment?.status !== "COMPLETED") {
        console.error(
          "[API-CHECKOUT-BOOKING-POST] Square payment not completed:",
          payment?.status
        );
        return NextResponse.json(
          { error: "Payment was not completed", status: payment?.status },
          { status: 400 }
        );
      }
      squarePaymentId = payment.id ?? "";

      // Save the new card on file after a successful charge (opt-in, signed-in).
      // The PAYMENT id is a valid card source — the one-time nonce is already spent.
      if (body.saveCard && !usingSavedCard && accountCustomerId && payment.id) {
        try {
          await squareCardService.createCard({
            sourceId: payment.id,
            customerId: accountCustomerId,
            cardholderName: `${contact.firstName} ${contact.lastName}`.trim(),
            referenceId: sessionUser?.id,
          });
        } catch (saveError) {
          console.error(
            "[API-CHECKOUT-BOOKING-POST] Save card on file failed (non-fatal):",
            saveError
          );
        }
      }
    } else {
      squarePaymentId =
        giftCardAppliedCents > 0
          ? `GIFTCARD-${booking.giftCard?.giftCardId ?? ""}`
          : "FREE-EVENT";
    }

    // 5. Redeem the applied gift card. For a gift-card-ONLY order this is the payment,
    // so a failure must block the booking; for a partial (card already charged) it's
    // non-fatal (the balance can be reconciled manually).
    if (giftCardAppliedCents > 0 && booking.giftCard) {
      try {
        await giftCardService.redeem(
          booking.giftCard.giftCardId,
          giftCardAppliedCents,
          booking.eventId
        );
      } catch (giftCardError) {
        console.error(
          "[API-CHECKOUT-BOOKING-POST] Gift card redemption failed:",
          giftCardError
        );
        if (chargeCents === 0) {
          return NextResponse.json(
            { error: "Gift card could not be redeemed. No charge was made." },
            { status: 400 }
          );
        }
      }
    }

    // 6. Create the booking record. `total` is the authoritative full booking value
    // (server-recomputed); a tampered client total can never reach here.
    const customer = await Customer.create({
      event: booking.eventId,
      eventType,
      selectedDates: booking.selectedDates,
      quantity: booking.quantity ?? 1,
      total: totalCents / 100,
      isSigningUpForSelf: booking.isSigningUpForSelf ?? true,
      participants: booking.participants ?? [],
      selectedOptions: booking.selectedOptions ?? [],
      billingInfo: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        emailAddress: contact.email,
        phoneNumber: contact.phone,
      },
      squarePaymentId,
      squareCustomerId,
      refundStatus: "none",
    });

    // Decrement reservation availability after the booking is saved.
    if (eventType === "Reservation" && reservation && booking.selectedDates) {
      const ops = buildReservationDecrementOps(
        reservation,
        booking.eventId,
        booking.selectedDates
      );
      if (ops.length > 0) {
        await Reservation.bulkWrite(
          ops as Parameters<typeof Reservation.bulkWrite>[0]
        );
      }
    }

    // 7. Confirmation email (Event only; never fails the booking).
    await sendBookingConfirmationEmails(customer._id.toString(), booking.eventId);

    return NextResponse.json({
      success: true,
      customerId: customer._id.toString(),
      squarePaymentId,
      total: totalCents / 100,
      status: "COMPLETED",
    });
  } catch (error) {
    if (error instanceof PriceIntegrityError) {
      console.warn(
        "[API-CHECKOUT-BOOKING-POST] Price integrity rejection:",
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[API-CHECKOUT-BOOKING-POST] Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
