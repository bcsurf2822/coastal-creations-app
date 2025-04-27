"use server";
import { randomUUID } from "crypto";
import { Client, Environment } from "square/legacy";

const { paymentsApi } = new Client({
  accessToken: process.env.NEXT_PUBLIC_SANDBOX_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

export async function submitPayment(sourceId: string) {
  try {
    const result = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
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
