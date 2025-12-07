import { NextRequest, NextResponse } from "next/server";
import { squareCustomerService } from "@/lib/square/customers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/square/customers/[id]
 * Retrieve a single customer by Square ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await squareCustomerService.getCustomer(id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer retrieved successfully",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-CUSTOMERS-API-GET-ID] Error:", error);

    return NextResponse.json(
      {
        error: "Error retrieving customer",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/square/customers/[id]
 * Update customer details
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { firstName, lastName, email, phone, address } = data;

    const customer = await squareCustomerService.updateCustomer(id, {
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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer updated successfully",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-CUSTOMERS-API-PUT] Error:", error);

    let errorMessage = "Error updating customer";
    let statusCode = 500;

    if (error && typeof error === "object" && "result" in error) {
      const errorObj = error as {
        result?: {
          errors?: Array<{ detail?: string; code?: string }>;
        };
      };
      if (errorObj.result?.errors && Array.isArray(errorObj.result.errors)) {
        const firstError = errorObj.result.errors[0];
        errorMessage = firstError.detail || firstError.code || errorMessage;
        if (firstError.code === "NOT_FOUND") {
          statusCode = 404;
        }
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/square/customers/[id]
 * Delete a customer (soft delete in Square)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const deleted = await squareCustomerService.deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete customer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-CUSTOMERS-API-DELETE] Error:", error);

    return NextResponse.json(
      {
        error: "Error deleting customer",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
