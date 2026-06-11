/**
 * Shippo Webhook Receiver
 *
 * Receives inbound events from Shippo and updates Order tracking state.
 *
 * Events handled:
 *   track_updated  — carrier tracking status changed → update status to shipped/delivered
 *
 * Verification: Shippo sends the webhook secret in the `Shippo-Webhook-Secret` header.
 * Set SHIPPO_WEBHOOK_SECRET in your environment to match the secret configured in the
 * Shippo dashboard (Settings → Webhooks).
 */
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";

interface ShippoTrackingStatus {
  status: string; // "DELIVERED" | "TRANSIT" | "FAILURE" | "RETURNED" | "UNKNOWN"
}

interface ShippoTrackUpdatedPayload {
  tracking_number: string;
  carrier: string;
  tracking_status: ShippoTrackingStatus;
}

interface ShippoWebhookEvent {
  event: string;
  data: ShippoTrackUpdatedPayload | Record<string, unknown>;
}

function verifySecret(request: Request): boolean {
  const webhookSecret = process.env.SHIPPO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("[WEBHOOKS-SHIPPO] SHIPPO_WEBHOOK_SECRET not set — skipping verification");
    return true;
  }
  const incomingSecret = request.headers.get("Shippo-Webhook-Secret");
  return incomingSecret === webhookSecret;
}

export async function POST(request: Request): Promise<Response> {
  if (!verifySecret(request)) {
    console.warn("[WEBHOOKS-SHIPPO] Invalid webhook secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ShippoWebhookEvent;
  try {
    body = (await request.json()) as ShippoWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = body;
  console.log("[WEBHOOKS-SHIPPO] Received event:", event);

  if (event === "track_updated") {
    const payload = data as ShippoTrackUpdatedPayload;
    const { tracking_number, tracking_status } = payload;

    if (!tracking_number) {
      return NextResponse.json({ error: "Missing tracking_number" }, { status: 400 });
    }

    await connectMongo();

    const order = await Order.findOne({ "shippo.trackingNumber": tracking_number });
    if (!order) {
      // Shippo may send events for test shipments or labels not in our system — not an error.
      console.log("[WEBHOOKS-SHIPPO] No order found for tracking number:", tracking_number);
      return NextResponse.json({ received: true });
    }

    const carrierStatus = tracking_status?.status?.toUpperCase();
    const updates: Record<string, unknown> = {};

    if (carrierStatus === "DELIVERED") {
      updates.status = "delivered";
      updates.deliveredAt = new Date();
    } else if (
      carrierStatus === "TRANSIT" &&
      order.status === "label_created"
    ) {
      updates.status = "shipped";
      updates.shippedAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await Order.findByIdAndUpdate(order._id, updates);
      console.log(
        "[WEBHOOKS-SHIPPO] Updated order",
        order.orderNumber,
        "→ status:",
        updates.status
      );
    }
  }

  return NextResponse.json({ received: true });
}
