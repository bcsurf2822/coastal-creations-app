"use server";
import { randomUUID } from "crypto";
import {
  Client,
  Environment,
  ApiResponse,
  CreatePaymentResponse,
} from "square/legacy";

const { paymentsApi } = new Client({
  accessToken: process.env.PRODUCTION_ACCESS_TOKEN,
  // environment: Environment.Production,
  environment: Environment.Sandbox,
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

    console.log(
      "Payment processing result:",
      result.statusCode,
      result.result?.payment?.status
    );
    return result;
  } catch (error) {
    console.log("Payment processing error:", error);
    return undefined;
  }
}
