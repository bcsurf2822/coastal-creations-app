"use server";
import {
  Client,
  Environment,
  ApiResponse,
  CreatePaymentResponse,
} from "square/legacy";
import { connectMongo } from "@/lib/mongoose";
import PaymentError, { SquareErrorCode } from "@/lib/models/PaymentError";
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
import { normalizeIdempotencyKey } from "@/lib/checkout/idempotency";

const { paymentsApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

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

interface ResolvedCharge {
  totalCents: number;
  giftCardAppliedCents: number;
  chargeCents: number;
}

/**
 * Recomputes the authoritative booking total from the database, validates any
 * applied gift card against Square's real balance, and returns the amount to put
 * on the card. Throws PriceIntegrityError if the booking can't be priced.
 */
async function resolveBookingCharge(
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
        "[ACTIONS-resolveBookingCharge] Gift card validation failed (applying $0):",
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

export async function submitPayment(
  sourceId: string,
  billingDetails: {
    addressLine1: string;
    addressLine2?: string;
    givenName: string;
    familyName: string;
    countryCode: string;
    city: string;
    state: string;
    postalCode: string;
    email?: string;
    phoneNumber?: string;
    eventId?: string;
    eventTitle?: string;
    eventPrice?: string;
    squareCustomerId?: string;
  },
  booking?: BookingSelectionInput,
  idempotencyKey?: string
): Promise<ApiResponse<CreatePaymentResponse> | undefined> {
  try {
    // PRICE INTEGRITY: the charge is recomputed server-side from the DB. The
    // client-supplied `eventPrice` is no longer trusted. A booking selection is
    // required so we know what to price. See ecommerce/09-checkout-price-integrity.md.
    if (!booking?.eventId) {
      console.error("[ACTIONS-submitPayment] Missing booking selection — refusing to charge");
      return undefined;
    }

    const { chargeCents } = await resolveBookingCharge(booking);

    // Nothing to charge on the card (e.g. a gift card covers it, or free) — the
    // card flow should not have been invoked; do not call Square with amount 0.
    if (chargeCents <= 0) {
      console.error("[ACTIONS-submitPayment] Computed card charge is 0 — refusing to charge");
      return undefined;
    }

    // Extract event info for use in metadata or note
    const eventInfo = billingDetails.eventTitle
      ? `Event: ${billingDetails.eventTitle}`
      : "Event registration";

    // Add contact information to the note if available
    const contactInfo = [];
    if (billingDetails.email) {
      contactInfo.push(`Email: ${billingDetails.email}`);
    }
    if (billingDetails.phoneNumber) {
      contactInfo.push(`Phone: ${billingDetails.phoneNumber}`);
    }

    const note = [eventInfo, ...contactInfo].join(" | ");

    const priceInCents = BigInt(chargeCents);

    const result = await paymentsApi.createPayment({
      idempotencyKey: normalizeIdempotencyKey(idempotencyKey),
      sourceId,
      referenceId: billingDetails.eventId,
      note,
      // Link payment to Square customer profile for Dashboard visibility
      customerId: billingDetails.squareCustomerId,
      billingAddress: {
        addressLine1: billingDetails.addressLine1,
        addressLine2: billingDetails.addressLine2 || "",
        firstName: billingDetails.givenName,
        lastName: billingDetails.familyName,
        country: billingDetails.countryCode,
        postalCode: billingDetails.postalCode,
      },
      amountMoney: {
        amount: priceInCents,
        currency: "USD",
      },
    });

    // console.log(
    //   "Payment processing result:",
    //   result.statusCode,
    //   result.result?.payment?.status
    // );
    return result;
  } catch (error) {
    // A price-integrity rejection means we refused to charge BEFORE hitting Square
    // (booking unpriceable / not found). Not a Square payment failure — don't log
    // it as one; the caller treats undefined as a failed payment.
    if (error instanceof PriceIntegrityError) {
      console.error("[ACTIONS-submitPayment] Price integrity rejection:", error.message);
      return undefined;
    }

    console.error("Payment processing error:", error);

    // Log payment error to MongoDB
    await logPaymentError(error, sourceId, billingDetails);

    return undefined;
  }
}

// Helper function to log payment errors to MongoDB
async function logPaymentError(
  error: unknown,
  sourceId: string,
  billingDetails: {
    addressLine1: string;
    addressLine2?: string;
    givenName: string;
    familyName: string;
    countryCode: string;
    city: string;
    state: string;
    postalCode: string;
    email?: string;
    phoneNumber?: string;
    eventId?: string;
    eventTitle?: string;
    eventPrice?: string;
  }
) {
  try {
    await connectMongo();

    // Extract error information from Square API error response
    let errors: Array<{
      code: SquareErrorCode;
      detail: string;
      field?: string;
      category: string;
    }> = [];
    const rawErrorResponse = error;

    // Helper function to validate and convert error code
    const validateErrorCode = (code?: string): SquareErrorCode => {
      if (
        code &&
        Object.values(SquareErrorCode).includes(code as SquareErrorCode)
      ) {
        return code as SquareErrorCode;
      }
      // Default to INTERNAL_SERVER_ERROR for unknown codes
      return SquareErrorCode.INTERNAL_SERVER_ERROR;
    };

    // Check if it's a Square API error with the expected structure
    if (error && typeof error === "object" && "result" in error) {
      const errorObj = error as {
        result?: {
          errors?: Array<{
            code?: string;
            detail?: string;
            field?: string;
            category?: string;
          }>;
        };
      };
      if (errorObj.result?.errors && Array.isArray(errorObj.result.errors)) {
        errors = errorObj.result.errors.map((err) => ({
          code: validateErrorCode(err.code),
          detail: err.detail || "Unknown error occurred",
          field: err.field,
          category: err.category || "UNKNOWN_CATEGORY",
        }));
      }
    } else if (error && typeof error === "object" && "errors" in error) {
      // Handle direct errors array
      const errorObj = error as {
        errors?: Array<{
          code?: string;
          detail?: string;
          field?: string;
          category?: string;
        }>;
      };
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        errors = errorObj.errors.map((err) => ({
          code: validateErrorCode(err.code),
          detail: err.detail || "Unknown error occurred",
          field: err.field,
          category: err.category || "UNKNOWN_CATEGORY",
        }));
      }
    } else {
      // Handle generic errors - use INTERNAL_SERVER_ERROR for non-Square errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during payment processing";
      errors = [
        {
          code: SquareErrorCode.INTERNAL_SERVER_ERROR,
          detail: errorMessage,
          category: "UNKNOWN_CATEGORY",
        },
      ];
    }

    // Create payment error log
    const paymentError = new PaymentError({
      eventId: billingDetails.eventId,
      eventTitle: billingDetails.eventTitle,
      customerEmail: billingDetails.email,
      customerPhone: billingDetails.phoneNumber,
      customerName: `${billingDetails.givenName} ${billingDetails.familyName}`,
      paymentAmount: billingDetails.eventPrice
        ? parseFloat(billingDetails.eventPrice)
        : undefined,
      sourceId,
      paymentErrors: errors,
      rawErrorResponse,
      attemptedAt: new Date(),
    });

    await paymentError.save();
    // console.log("Payment error logged to database:", paymentError._id);
  } catch (logError) {
    console.error("Failed to log payment error to database:", logError);
  }
}
