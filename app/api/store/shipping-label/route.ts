/**
 * Manual shipping-label FALLBACK (admin-only).
 *
 * The label is normally bought automatically at checkout (app/api/store/checkout).
 * This endpoint exists for the case where that auto-purchase failed and the order is
 * still "paid" — the merchant taps "Create Shipping Label" in the admin order page to
 * retry. It does NOT email the customer; the customer "your order shipped" email is
 * sent only by the mark_shipped action. See spec/ecommerce/03-shipping-notification-flow.md.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { purchaseLabelForOrder } from "@/lib/shippo/labels";

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { orderId } = (await request.json()) as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    await connectMongo();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only valid as a fallback for orders that are paid but have no label yet.
    // (label_created/shipped/delivered already have one; purchaseLabelForOrder is
    // idempotent, but we guard here to give a clear admin error.)
    if (order.status !== "paid") {
      return NextResponse.json(
        { error: `Cannot create label for order in status: ${order.status}` },
        { status: 400 }
      );
    }

    const label = await purchaseLabelForOrder(orderId);

    return NextResponse.json({
      success: true,
      labelUrl: label.labelUrl,
      trackingNumber: label.trackingNumber,
      trackingUrlProvider: label.trackingUrlProvider,
    });
  } catch (error) {
    console.error("[API-STORE-SHIPPING-LABEL-POST] Error:", error);
    return NextResponse.json({ error: "Failed to create shipping label" }, { status: 500 });
  }
}
