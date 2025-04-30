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
  environment: Environment.Production,
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
    eventId?: string;
    eventTitle?: string;
    eventPrice?: string;
  }
): Promise<ApiResponse<CreatePaymentResponse> | undefined> {
  try {
    console.log("Payment Environment:", Environment.Production);
    // Extract event info for use in metadata or note
    const eventInfo = billingDetails.eventTitle
      ? `Registration for: ${billingDetails.eventTitle}`
      : "Event registration";

    // Convert price from dollars to cents (multiply by 100)
    const priceInCents = billingDetails.eventPrice
      ? BigInt(Math.round(parseFloat(billingDetails.eventPrice) * 100))
      : BigInt(500); // Default to $5.00 if no price provided

    console.log(`Processing payment: $${billingDetails.eventPrice || "5.00"}`);

    const result = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
      referenceId: billingDetails.eventId,
      note: eventInfo,
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

    return result;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
