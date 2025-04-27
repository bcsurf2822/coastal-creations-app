import { Client, Environment } from "square/legacy";
import { NextRequest, NextResponse } from "next/server";

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { givenName, familyName, emailAddress } = await req.json();

    const customersApi = client.customersApi;
    const response = await customersApi.createCustomer({
      givenName,
      familyName,
      emailAddress,
    });

    return NextResponse.json({
      success: true,
      customer: response.result.customer,
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
