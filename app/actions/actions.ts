"use server";
import { randomUUID } from "crypto";
import {
  Client,
  Environment,
  ApiResponse,
  CreatePaymentResponse,
} from "square/legacy";
import { connectMongo } from "@/lib/mongoose";
import PaymentError, { SquareErrorCode } from "@/lib/models/PaymentError";

const { paymentsApi } = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

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
  }
): Promise<ApiResponse<CreatePaymentResponse> | undefined> {
  try {
    // Check if price is provided
    if (!billingDetails.eventPrice) {
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

    // Convert price from dollars to cents (multiply by 100)
    const priceInCents = BigInt(
      Math.round(parseFloat(billingDetails.eventPrice) * 100)
    );

    const result = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
      referenceId: billingDetails.eventId,
      note,
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
