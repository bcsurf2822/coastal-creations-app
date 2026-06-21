"use server";
import { getSquareClient } from "@/lib/square/client";
import { SquareError, type Square } from "square";
import { connectMongo } from "@/lib/mongoose";
import PaymentError, { SquareErrorCode } from "@/lib/models/PaymentError";
import {
  resolveBookingCharge,
  type BookingSelectionInput,
} from "@/lib/checkout/resolveBookingCharge";
import { PriceIntegrityError } from "@/lib/checkout/errors";
import { normalizeIdempotencyKey } from "@/lib/checkout/idempotency";

const client = getSquareClient();

/**
 * Legacy-shaped payment result. v44 returns `{ payment }` directly, but the
 * reservation client (components/reservations/PaymentForm.tsx) still reads
 * `result.result?.payment` / `result.result?.errors`. We wrap the v44 response in
 * `{ result }` so the migration stays server-contained and that component is unchanged.
 * (Events now use /api/checkout/booking; submitPayment remains for reservations.)
 */
export interface SubmitPaymentResult {
  result: Square.CreatePaymentResponse;
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
): Promise<SubmitPaymentResult | undefined> {
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

    const response = await client.payments.create({
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
        country: billingDetails.countryCode as Square.Country,
        postalCode: billingDetails.postalCode,
      },
      amountMoney: {
        amount: priceInCents,
        currency: "USD",
      },
    });

    // Wrap in the legacy `{ result }` shape so the client components are unchanged.
    return { result: response };
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

    // v44 Square errors are SquareError instances carrying a structured `errors` array.
    if (error instanceof SquareError) {
      errors = error.errors.map((err) => ({
        code: validateErrorCode(err.code),
        detail: err.detail || "Unknown error occurred",
        field: err.field,
        category: err.category || "UNKNOWN_CATEGORY",
      }));
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
