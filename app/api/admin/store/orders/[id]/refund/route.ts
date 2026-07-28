import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareError } from "square";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import Order, { type IOrderItem } from "@/lib/models/Order";
import { getSquareClient } from "@/lib/square/client";
import { formatCents } from "@/lib/utils/moneyHelpers";
import { sendRefundConfirmation } from "@/lib/email/sendRefundConfirmation";

const client = getSquareClient();

interface RefundItemRequest {
  squareVariationId: string;
  quantity: number;
}

interface RefundBody {
  items?: RefundItemRequest[];
  reason?: string;
}

/**
 * Issue an item-level refund against a store order.
 *
 * Per-item only — shipping is never refunded. Orders paid (even partly) with a
 * gift card are blocked here and must be refunded manually in Square, because
 * Square's refundPayment can only refund the card payment.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await connectMongo();
    const { id } = await params;
    const body = (await request.json()) as RefundBody;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- Guards ---
    if (order.giftCard?.giftCardId) {
      return NextResponse.json(
        {
          error:
            "This order used a gift card. Refund it manually in Square — gift-card refunds can't be automated here.",
        },
        { status: 400 }
      );
    }
    if (!order.square?.paymentId) {
      return NextResponse.json(
        { error: "No Square payment ID found for this order" },
        { status: 400 }
      );
    }
    if (order.refundStatus === "full") {
      return NextResponse.json(
        { error: "This order has already been fully refunded" },
        { status: 400 }
      );
    }

    const requested = body.items ?? [];
    if (requested.length === 0) {
      return NextResponse.json(
        { error: "Select at least one item to refund" },
        { status: 400 }
      );
    }

    // --- Validate requested items against the order, compute refund amount ---
    let refundCents = 0;
    const refundedLines: Array<{
      squareVariationId: string;
      name: string;
      quantity: number;
      amountCents: number;
    }> = [];

    for (const req of requested) {
      if (!req.quantity || req.quantity <= 0) continue;
      const item = order.items.find(
        (i: IOrderItem) => i.squareVariationId === req.squareVariationId
      );
      if (!item) {
        return NextResponse.json(
          { error: `Item ${req.squareVariationId} is not part of this order` },
          { status: 400 }
        );
      }
      const remaining = item.quantity - (item.refundedQuantity ?? 0);
      if (req.quantity > remaining) {
        return NextResponse.json(
          {
            error: `Cannot refund ${req.quantity} of "${item.name}" — only ${remaining} remain refundable`,
          },
          { status: 400 }
        );
      }
      const lineAmount = item.unitPriceCents * req.quantity;
      refundCents += lineAmount;
      refundedLines.push({
        squareVariationId: item.squareVariationId,
        name: item.variationName ? `${item.name} (${item.variationName})` : item.name,
        quantity: req.quantity,
        amountCents: lineAmount,
      });
    }

    if (refundCents <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be greater than zero" },
        { status: 400 }
      );
    }

    const alreadyRefunded = order.refundAmountCents ?? 0;
    if (alreadyRefunded + refundCents > order.totalCents) {
      return NextResponse.json(
        { error: "Refund exceeds the order total" },
        { status: 400 }
      );
    }

    // --- Square refund ---
    const refundResult = await client.refunds.refundPayment({
      idempotencyKey: randomUUID(),
      paymentId: order.square.paymentId,
      amountMoney: {
        amount: BigInt(refundCents),
        currency: "USD",
      },
      reason: body.reason || "Item refund",
    });

    if (!refundResult.refund) {
      return NextResponse.json(
        { error: "Refund failed — no refund object returned" },
        { status: 500 }
      );
    }

    // --- Persist: bump per-item counters, log the refund event, recompute status ---
    for (const line of refundedLines) {
      const item = order.items.find(
        (i: IOrderItem) => i.squareVariationId === line.squareVariationId
      );
      if (item) item.refundedQuantity = (item.refundedQuantity ?? 0) + line.quantity;
    }

    order.refunds = order.refunds ?? [];
    order.refunds.push({
      squareRefundId: refundResult.refund.id,
      amountCents: refundCents,
      reason: body.reason || undefined,
      items: refundedLines.map((l) => ({
        squareVariationId: l.squareVariationId,
        name: l.name,
        quantity: l.quantity,
      })),
      createdAt: new Date(),
    });
    order.refundAmountCents = alreadyRefunded + refundCents;
    order.refundedAt = new Date();

    const fullyRefunded = order.items.every(
      (i: IOrderItem) => (i.refundedQuantity ?? 0) >= i.quantity
    );
    order.refundStatus = fullyRefunded ? "full" : "partial";
    if (fullyRefunded) order.status = "refunded";

    await order.save();

    // --- Refund confirmation email (non-blocking) ---
    await sendRefundConfirmation({
      customerEmail: order.customer.email,
      data: {
        customerName: order.customer.firstName,
        referenceLabel: `Order ${order.orderNumber}`,
        refundAmountFormatted: formatCents(refundCents),
        reason: body.reason || undefined,
        lineItems: refundedLines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          amountFormatted: formatCents(l.amountCents),
        })),
        isFullRefund: fullyRefunded,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      order: order.toObject(),
    });
  } catch (error) {
    let errorMessage = "Error processing refund";
    let statusCode = 500;

    if (error instanceof SquareError) {
      const firstError = error.errors[0];
      if (firstError) {
        errorMessage = firstError.detail || firstError.code || errorMessage;
        if (firstError.code === "NOT_FOUND" || firstError.code === "PAYMENT_NOT_FOUND") {
          statusCode = 404;
        } else if (firstError.code === "REFUND_AMOUNT_INVALID") {
          statusCode = 400;
        }
      }
    }

    console.error("[API-ADMIN-STORE-ORDER-REFUND-POST] Error:", error);
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: statusCode }
    );
  }
}
