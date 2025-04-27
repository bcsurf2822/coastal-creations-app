"use server";
import { randomUUID } from "crypto";
import { Client, Environment } from "square/legacy";

const { paymentsApi } = new Client({
  accessToken: process.env.NEXT_PUBLIC_SANDBOX_ACCESS_TOKEN,
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
  }
) {
  try {
    const result = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
      referenceId: "4elkql4m3b5gnkfsgud0abpl9m",
      billingAddress: {
        addressLine1: billingDetails.addressLine1,
        addressLine2: billingDetails.addressLine2 || "",
        firstName: billingDetails.givenName,
        lastName: billingDetails.familyName,
        country: billingDetails.countryCode,
        postalCode: billingDetails.postalCode,
      },
      amountMoney: {
        amount: BigInt(700),
        currency: "USD",
      },
    });

    return result;
  } catch (error) {
    console.log(error);
  }
}
