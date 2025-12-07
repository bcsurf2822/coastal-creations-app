import { NextRequest, NextResponse } from "next/server";
import {
  squareCustomerService,
  CreateSquareCustomerInput,
} from "@/lib/square/customers";

/**
 * POST /api/square/customers
 * Create or find an existing customer in Square Customer Directory
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();

    const { firstName, lastName, email, phone, address } = data;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or phone is required for customer lookup" },
        { status: 400 }
      );
    }

    const input: CreateSquareCustomerInput = {
      firstName,
      lastName,
      email,
      phone,
      address: address
        ? {
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state || address.stateProvince,
            postalCode: address.postalCode,
            country: address.country || "US",
          }
        : undefined,
    };

    const result = await squareCustomerService.findOrCreateCustomer(input);

    return NextResponse.json(
      {
        success: true,
        message: result.isNew
          ? "Customer created successfully"
          : "Existing customer found",
        data: {
          customerId: result.customerId,
          isNew: result.isNew,
          customer: result.customer,
        },
      },
      { status: result.isNew ? 201 : 200 }
    );
  } catch (error) {
    console.error("[SQUARE-CUSTOMERS-API-POST] Error:", error);

    let errorMessage = "Error creating/finding customer";
    if (error && typeof error === "object" && "result" in error) {
      const errorObj = error as {
        result?: {
          errors?: Array<{ detail?: string; code?: string }>;
        };
      };
      if (errorObj.result?.errors && Array.isArray(errorObj.result.errors)) {
        const firstError = errorObj.result.errors[0];
        errorMessage = firstError.detail || firstError.code || errorMessage;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/square/customers
 * Search for customers by email or phone
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or phone query parameter is required" },
        { status: 400 }
      );
    }

    let customer = null;

    if (email) {
      customer = await squareCustomerService.searchByEmail(email);
    }

    if (!customer && phone) {
      customer = await squareCustomerService.searchByPhone(phone);
    }

    if (!customer) {
      return NextResponse.json(
        {
          success: true,
          message: "No customer found",
          data: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer found",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-CUSTOMERS-API-GET] Error:", error);

    return NextResponse.json(
      {
        error: "Error searching for customer",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
