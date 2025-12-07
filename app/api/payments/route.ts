/**
 * Payments API Route
 * POST: Process payment with optional gift card redemption (split payment)
 */
import { NextResponse } from "next/server";
import { Client, Environment } from "square/legacy";
import { randomUUID } from "crypto";
import { giftCardService } from "@/lib/square/gift-cards";

const squareClient = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const { paymentsApi } = squareClient;

interface SplitPaymentRequest {
  // Gift card payment (optional)
  giftCard?: {
    giftCardId: string;
    amountToRedeem: number; // In cents
  };
  // Card payment (required if there's a remaining balance)
  sourceId?: string;
  amountMoney: {
    amount: number; // In cents
    currency: string;
  };
  // Order reference
  referenceId?: string;
  note?: string;
  customerId?: string;
  billingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    firstName?: string;
    lastName?: string;
    country?: string;
    postalCode?: string;
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: SplitPaymentRequest = await request.json();

    const results: {
      giftCardRedemption: { amountRedeemed: number; newBalance: number } | null;
      cardPayment: { paymentId: string; status: string; receiptUrl?: string } | null;
      totalPaid: number;
    } = {
      giftCardRedemption: null,
      cardPayment: null,
      totalPaid: 0,
    };

    // Step 1: Redeem gift card if provided
    if (body.giftCard && body.giftCard.amountToRedeem > 0) {
      console.log(
        "[API-PAYMENTS-POST] Redeeming gift card:",
        body.giftCard.giftCardId,
        "Amount:",
        body.giftCard.amountToRedeem
      );

      try {
        const redemption = await giftCardService.redeem(
          body.giftCard.giftCardId,
          body.giftCard.amountToRedeem,
          body.referenceId || `order-${Date.now()}`
        );

        results.giftCardRedemption = {
          amountRedeemed: body.giftCard.amountToRedeem,
          newBalance: redemption.newBalance,
        };
        results.totalPaid += body.giftCard.amountToRedeem;

        console.log(
          "[API-PAYMENTS-POST] Gift card redeemed successfully. New balance:",
          redemption.newBalance
        );
      } catch (giftCardError) {
        console.error("[API-PAYMENTS-POST] Gift card redemption failed:", giftCardError);
        return NextResponse.json(
          { error: "Gift card redemption failed", details: String(giftCardError) },
          { status: 400 }
        );
      }
    }

    // Step 2: Process card payment if there's a remaining amount and we have a source
    const remainingAmount = body.amountMoney.amount - (body.giftCard?.amountToRedeem || 0);

    if (remainingAmount > 0) {
      if (!body.sourceId) {
        return NextResponse.json(
          { error: "Payment source (card token) is required for the remaining balance" },
          { status: 400 }
        );
      }

      console.log(
        "[API-PAYMENTS-POST] Processing card payment for remaining amount:",
        remainingAmount
      );

      try {
        const paymentResult = await paymentsApi.createPayment({
          idempotencyKey: randomUUID(),
          sourceId: body.sourceId,
          amountMoney: {
            amount: BigInt(remainingAmount),
            currency: body.amountMoney.currency || "USD",
          },
          referenceId: body.referenceId,
          note: body.note,
          customerId: body.customerId,
          billingAddress: body.billingAddress
            ? {
                addressLine1: body.billingAddress.addressLine1,
                addressLine2: body.billingAddress.addressLine2,
                firstName: body.billingAddress.firstName,
                lastName: body.billingAddress.lastName,
                country: body.billingAddress.country,
                postalCode: body.billingAddress.postalCode,
              }
            : undefined,
        });

        const payment = paymentResult.result.payment;

        if (payment?.status === "COMPLETED") {
          results.cardPayment = {
            paymentId: payment.id || "",
            status: payment.status,
            receiptUrl: payment.receiptUrl || undefined,
          };
          results.totalPaid += remainingAmount;

          console.log("[API-PAYMENTS-POST] Card payment completed:", payment.id);
        } else {
          console.error("[API-PAYMENTS-POST] Card payment not completed:", payment?.status);
          return NextResponse.json(
            {
              error: "Card payment was not completed",
              status: payment?.status,
              giftCardRedemption: results.giftCardRedemption, // Return this so caller knows gift card was redeemed
            },
            { status: 400 }
          );
        }
      } catch (paymentError) {
        console.error("[API-PAYMENTS-POST] Card payment failed:", paymentError);
        return NextResponse.json(
          {
            error: "Card payment failed",
            details: String(paymentError),
            giftCardRedemption: results.giftCardRedemption, // Return this so caller knows gift card was redeemed
          },
          { status: 400 }
        );
      }
    } else if (body.giftCard && body.giftCard.amountToRedeem >= body.amountMoney.amount) {
      // Gift card covers the full amount - no card payment needed
      console.log("[API-PAYMENTS-POST] Gift card covered full amount, no card payment needed");
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[API-PAYMENTS-POST] Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
