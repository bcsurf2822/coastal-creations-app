import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import { Client, Environment } from "square/legacy";
import { randomUUID } from "crypto";

const { refundsApi } = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectMongo();
    const { customerId, refundAmount, reason } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (!customer.squarePaymentId) {
      return NextResponse.json(
        { error: "No Square payment ID found for this customer" },
        { status: 400 }
      );
    }

    if (customer.refundStatus === "full") {
      return NextResponse.json(
        { error: "This payment has already been fully refunded" },
        { status: 400 }
      );
    }

    const refundAmountCents = refundAmount
      ? BigInt(Math.round(refundAmount * 100))
      : BigInt(Math.round((customer.total - (customer.refundAmount || 0)) * 100));

    const refundResult = await refundsApi.refundPayment({
      idempotencyKey: randomUUID(),
      paymentId: customer.squarePaymentId,
      amountMoney: {
        amount: refundAmountCents,
        currency: "USD",
      },
      reason: reason || "Customer requested refund",
    });

    if (refundResult.result?.refund) {
      const refundAmountDollars = refundAmount || customer.total - (customer.refundAmount || 0);
      const totalRefundedAmount = (customer.refundAmount || 0) + refundAmountDollars;

      const isFullRefund = totalRefundedAmount >= customer.total;

      customer.refundAmount = totalRefundedAmount;
      customer.refundStatus = isFullRefund ? "full" : "partial";
      customer.refundedAt = new Date();
      await customer.save();

      const refundData = JSON.parse(
        JSON.stringify(refundResult.result.refund, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return NextResponse.json(
        {
          success: true,
          message: "Refund processed successfully",
          data: {
            refund: refundData,
            customer: {
              _id: customer._id,
              refundStatus: customer.refundStatus,
              refundAmount: customer.refundAmount,
              refundedAt: customer.refundedAt,
            },
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Refund failed - no refund object returned" },
        { status: 500 }
      );
    }
  } catch (error) {
    let errorMessage = "Error processing refund";
    let statusCode = 500;

    if (error && typeof error === "object" && "result" in error) {
      const errorObj = error as {
        result?: {
          errors?: Array<{
            code?: string;
            detail?: string;
            category?: string;
          }>;
        };
      };
      if (errorObj.result?.errors && Array.isArray(errorObj.result.errors)) {
        const firstError = errorObj.result.errors[0];
        errorMessage = firstError.detail || firstError.code || errorMessage;

        if (
          firstError.code === "NOT_FOUND" ||
          firstError.code === "PAYMENT_NOT_FOUND"
        ) {
          statusCode = 404;
        } else if (firstError.code === "REFUND_AMOUNT_INVALID") {
          statusCode = 400;
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (customerId) {
      const customer = await Customer.findById(customerId).lean();

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            refundStatus: customer.refundStatus,
            refundAmount: customer.refundAmount,
            refundedAt: customer.refundedAt,
            total: customer.total,
            squarePaymentId: customer.squarePaymentId,
          },
        },
        { status: 200 }
      );
    }

    const customers = await Customer.find({
      refundStatus: { $ne: "none" },
    })
      .populate("event")
      .sort({ refundedAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Refunded customers retrieved successfully",
        data: customers,
        count: customers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[REFUNDS-API-GET] Error retrieving refund data:", error);

    return NextResponse.json(
      {
        error: "Error retrieving refund data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
