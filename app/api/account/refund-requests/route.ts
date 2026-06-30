import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import Order, { type IOrderItem } from "@/lib/models/Order";
import Customer, { type ICustomer } from "@/lib/models/Customer";
// Registered so the booking's `event` ref can be populated for the label.
import "@/lib/models/Event";
import "@/lib/models/PrivateEvent";
import "@/lib/models/Reservations";
import RefundRequest from "@/lib/models/RefundRequest";
import { emailMatch, getMyRefundRequests } from "@/lib/account/queries";
import { isBookingPast } from "@/lib/account/display";
import { formatCents } from "@/lib/utils/moneyHelpers";
import { sendRefundRequestAdmin } from "@/lib/email/sendRefundRequestAdmin";

interface RequestBody {
  type?: "order" | "booking";
  targetId?: string;
  items?: Array<{ squareVariationId: string; quantity: number }>;
  reason?: string;
}

/** Customer submits a refund request for one of their orders or bookings. */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  const user = guard;

  try {
    await connectMongo();
    const body = (await request.json()) as RequestBody;
    const reason = (body.reason ?? "").trim();

    if (!body.type || !body.targetId) {
      return NextResponse.json(
        { error: "Missing request type or target" },
        { status: 400 }
      );
    }
    if (!reason) {
      return NextResponse.json(
        { error: "Please include a reason for your refund request" },
        { status: 400 }
      );
    }

    // One open request per target.
    const existingPending = await RefundRequest.findOne({
      targetId: body.targetId,
      status: "pending",
    }).lean();
    if (existingPending) {
      return NextResponse.json(
        { error: "A refund request for this purchase is already pending" },
        { status: 409 }
      );
    }

    if (body.type === "order") {
      const order = await Order.findOne({
        _id: body.targetId,
        "customer.email": emailMatch(user.email),
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      if (order.refundStatus === "full") {
        return NextResponse.json(
          { error: "This order has already been fully refunded" },
          { status: 400 }
        );
      }

      // Validate selected items against remaining refundable qty.
      const requested = (body.items ?? []).filter((i) => i.quantity > 0);
      if (requested.length === 0) {
        return NextResponse.json(
          { error: "Select at least one item to request a refund for" },
          { status: 400 }
        );
      }
      let amountCents = 0;
      const requestedItems: Array<{
        squareVariationId: string;
        name: string;
        quantity: number;
      }> = [];
      for (const req of requested) {
        const item = order.items.find(
          (i: IOrderItem) => i.squareVariationId === req.squareVariationId
        );
        if (!item) {
          return NextResponse.json(
            { error: "Item is not part of this order" },
            { status: 400 }
          );
        }
        const remaining = item.quantity - (item.refundedQuantity ?? 0);
        const qty = Math.min(req.quantity, remaining);
        if (qty <= 0) continue;
        amountCents += item.unitPriceCents * qty;
        requestedItems.push({
          squareVariationId: item.squareVariationId,
          name: item.variationName ? `${item.name} (${item.variationName})` : item.name,
          quantity: qty,
        });
      }
      if (requestedItems.length === 0) {
        return NextResponse.json(
          { error: "Selected items are no longer refundable" },
          { status: 400 }
        );
      }

      const created = await RefundRequest.create({
        type: "order",
        targetId: order._id,
        orderNumber: order.orderNumber,
        referenceLabel: `Order ${order.orderNumber}`,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        customerEmail: user.email,
        requestedItems,
        requestedAmountCents: amountCents,
        reason,
      });

      await sendRefundRequestAdmin({
        referenceLabel: created.referenceLabel,
        type: "order",
        customerName: created.customerName,
        customerEmail: created.customerEmail,
        requestedAmountFormatted: formatCents(amountCents),
        reason,
        lineItems: requestedItems.map((i) => ({ name: i.name, quantity: i.quantity })),
      });

      return NextResponse.json({ success: true, status: created.status });
    }

    // --- booking ---
    const booking = await Customer.findOne({
      _id: body.targetId,
      "billingInfo.emailAddress": emailMatch(user.email),
    }).populate("event");
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.refundStatus === "full") {
      return NextResponse.json(
        { error: "This booking has already been fully refunded" },
        { status: 400 }
      );
    }
    // Refund requests are cancellations for UPCOMING bookings only.
    if (isBookingPast(booking as unknown as ICustomer)) {
      return NextResponse.json(
        {
          error:
            "This event has already taken place, so it is no longer eligible for a refund request.",
        },
        { status: 400 }
      );
    }

    const remainingDollars = booking.total - (booking.refundAmount || 0);
    const amountCents = Math.max(0, Math.round(remainingDollars * 100));
    const ev =
      booking.event && typeof booking.event === "object"
        ? (booking.event as { eventName?: string; title?: string })
        : null;
    const referenceLabel = ev?.eventName || ev?.title || "Booking";
    const customerName = `${booking.billingInfo.firstName} ${booking.billingInfo.lastName}`.trim();

    const created = await RefundRequest.create({
      type: "booking",
      targetId: booking._id,
      referenceLabel,
      customerName,
      customerEmail: user.email,
      requestedAmountCents: amountCents,
      reason,
    });

    await sendRefundRequestAdmin({
      referenceLabel,
      type: "booking",
      customerName,
      customerEmail: user.email,
      requestedAmountFormatted: formatCents(amountCents),
      reason,
    });

    return NextResponse.json({ success: true, status: created.status });
  } catch (error) {
    console.error("[API-ACCOUNT-REFUND-REQUESTS-POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit refund request" },
      { status: 500 }
    );
  }
}

/** The signed-in user's refund requests (used to show pending state in the account UI). */
export async function GET(): Promise<NextResponse> {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  try {
    const requests = await getMyRefundRequests(guard.email);
    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        targetId: String(r.targetId),
        type: r.type,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error("[API-ACCOUNT-REFUND-REQUESTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load refund requests" },
      { status: 500 }
    );
  }
}
