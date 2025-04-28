"use server";
import { randomUUID } from "crypto";
// import {
//   Client,
//   Environment,
//   ApiResponse,
//   CreatePaymentResponse,
// } from "square/legacy";
import { SquareClient, Square } from "square";

// const { paymentsApi } = new Client({
//   // accessToken: process.env.NEXT_PUBLIC_SANDBOX_ACCESS_TOKEN,
//   accessToken: process.env.PRODUCTION_ACCESS_TOKEN,
//   environment: Environment.Production,
// });

const client = new SquareClient({
  token: process.env.PRODUCTION_ACCESS_TOKEN,
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
  }
) {
  try {
    // Extract event info for use in metadata or note
    const eventInfo = billingDetails.eventTitle
      ? `Registration for: ${billingDetails.eventTitle}`
      : "Event registration";

    // New implementation using SquareClient
    const result = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(500),
        currency: "USD",
      },
      billingAddress: {
        addressLine1: billingDetails.addressLine1,
        addressLine2: billingDetails.addressLine2 || "",
        firstName: billingDetails.givenName,
        lastName: billingDetails.familyName,
        country: billingDetails.countryCode as Square.Country,
        postalCode: billingDetails.postalCode,
      },
      locationId: process.env.PRODUCTION_LOCATION_ID,
      referenceId: billingDetails.eventId,
      note: eventInfo,
      autocomplete: true,
    });

    return result;

    // Old implementation
    // const result = await paymentsApi.createPayment({
    //   idempotencyKey: randomUUID(),
    //   sourceId,
    //   referenceId: billingDetails.eventId,
    //   note: eventInfo,
    //   billingAddress: {
    //     addressLine1: billingDetails.addressLine1,
    //     addressLine2: billingDetails.addressLine2 || "",
    //     firstName: billingDetails.givenName,
    //     lastName: billingDetails.familyName,
    //     country: billingDetails.countryCode,
    //     postalCode: billingDetails.postalCode,
    //   },
    //   amountMoney: {
    //     amount: BigInt(500),
    //     currency: "USD",
    //   },
    // });

    // return result;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
