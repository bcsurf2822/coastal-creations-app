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
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { DeliveryConfirmationEmail } from "@/components/email-templates/DeliveryConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // NOTE: we do NOT auto-advance to "shipped" on TRANSIT. "shipped" is the merchant's
    // deliberate "Mark Shipped" action (which sends the customer tracking email). The
    // webhook only owns the automatic DELIVERED transition + delivery email (step 8).
    if (carrierStatus === "DELIVERED") {
      // Idempotent: only act + email once per order.
      if (order.status === "delivered" || order.deliveredAt) {
        return NextResponse.json({ received: true });
      }

      await Order.findByIdAndUpdate(order._id, {
        status: "delivered",
        deliveredAt: new Date(),
      });
      console.log("[WEBHOOKS-SHIPPO] Order delivered:", order.orderNumber);

      const isProduction = process.env.VERCEL_ENV === "production";
      const customerRecipient = isProduction
        ? order.customer.email
        : (process.env.DEV_EMAIL ?? order.customer.email);

      try {
        const emailHtml = await render(
          React.createElement(DeliveryConfirmationEmail, {
            customerFirstName: order.customer.firstName,
            orderNumber: order.orderNumber,
            carrier: order.shippo.carrier,
            trackingNumber: order.shippo.trackingNumber,
          })
        );

        await resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [customerRecipient],
          subject: `Your order ${order.orderNumber} was delivered`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "[WEBHOOKS-SHIPPO] Delivery email failed (order still marked delivered):",
          emailError
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
