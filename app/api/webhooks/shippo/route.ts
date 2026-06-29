/**
 * Shippo Webhook Receiver
 *
 * Receives inbound carrier tracking events from Shippo and drives the order
 * lifecycle automatically — no manual admin toggling required.
 *
 * Events handled:
 *   track_updated — carrier tracking status changed. We act on:
 *     TRANSIT             → first carrier scan: mark order "shipped", email
 *                           the customer their tracking link + notify the admin.
 *     DELIVERED           → mark order "delivered", email the customer.
 *     FAILURE / RETURNED  → email the admin so they can intervene. No status
 *                           change (the admin owns the resolution).
 *
 * Because labels are purchased through Shippo, Shippo auto-registers tracking
 * and sends these events with no extra API calls on our side.
 *
 * Verification: Shippo does NOT sign webhooks or send a secret header, so we
 * authenticate via a shared secret embedded in the registered webhook URL as a
 * `?token=` query param. Set SHIPPO_WEBHOOK_SECRET in the environment and
 * register the webhook URL as `<origin>/api/webhooks/shippo?token=<secret>`.
 * (A `Shippo-Webhook-Secret` header carrying the same value is also accepted,
 * for manual/testing convenience.)
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import type { IOrder } from "@/lib/models/Order";
import { ShippingConfirmationEmail } from "@/components/email-templates/ShippingConfirmationEmail";
import { DeliveryConfirmationEmail } from "@/components/email-templates/DeliveryConfirmationEmail";
import { ShipmentExceptionEmail } from "@/components/email-templates/ShipmentExceptionEmail";
import { resolveEmailRecipients, EMAIL_FROM } from "@/lib/email/recipients";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = EMAIL_FROM;

interface ShippoTrackingStatus {
  status: string; // "PRE_TRANSIT" | "TRANSIT" | "DELIVERED" | "RETURNED" | "FAILURE" | "UNKNOWN"
  status_details?: string;
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
    // Fail closed: with no configured secret we cannot authenticate the caller,
    // so reject rather than accept unauthenticated webhook POSTs.
    console.error("[WEBHOOKS-SHIPPO] SHIPPO_WEBHOOK_SECRET not set — rejecting request");
    return false;
  }
  // Shippo can't send custom headers, so the secret rides in the URL (?token=).
  // Accept the header form too, for manual curl/testing.
  const urlToken = new URL(request.url).searchParams.get("token");
  const headerToken = request.headers.get("Shippo-Webhook-Secret");
  return urlToken === webhookSecret || headerToken === webhookSecret;
}

// Recipient routing is centralized in lib/email/recipients.ts (prod → real +
// STUDIO_EMAIL; dev/stage → DEV_EMAIL).
function resolveRecipients(order: IOrder): { customer: string; admin: string } {
  return resolveEmailRecipients(order.customer.email);
}

// Mark the order shipped on the first carrier scan and notify customer + admin.
// Idempotent: a second TRANSIT event (or any post-ship event) is a no-op.
async function handleTransit(order: IOrder): Promise<void> {
  if (
    order.shippedAt ||
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.status === "cancelled" ||
    order.status === "refunded"
  ) {
    return;
  }

  await Order.findByIdAndUpdate(order._id, {
    status: "shipped",
    shippedAt: new Date(),
  });
  console.log("[WEBHOOKS-SHIPPO] Order shipped (carrier scan):", order.orderNumber);

  const { customer, admin } = resolveRecipients(order);

  try {
    const html = await render(
      React.createElement(ShippingConfirmationEmail, {
        customerFirstName: order.customer.firstName,
        orderNumber: order.orderNumber,
        carrier: order.shippo.carrier ?? "carrier",
        trackingNumber: order.shippo.trackingNumber ?? "",
        trackingUrlProvider: order.shippo.trackingUrlProvider,
      })
    );

    await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: [customer],
        subject: `Your order ${order.orderNumber} has shipped!`,
        html,
      }),
      resend.emails.send({
        from: FROM,
        to: [admin],
        subject: `Shipped: order ${order.orderNumber} is in transit`,
        html,
      }),
    ]);
  } catch (emailError) {
    console.error(
      "[WEBHOOKS-SHIPPO] Shipped email failed (order still marked shipped):",
      emailError
    );
  }
}

// Mark the order delivered and email the customer. Idempotent on deliveredAt.
async function handleDelivered(order: IOrder): Promise<void> {
  if (order.status === "delivered" || order.deliveredAt) {
    return;
  }

  // Backfill shippedAt if a package was delivered without us ever seeing a
  // TRANSIT event (e.g. same-day scan) — keeps the shipped timestamp accurate
  // without sending a redundant "shipped" email right before "delivered".
  await Order.findByIdAndUpdate(order._id, {
    status: "delivered",
    deliveredAt: new Date(),
    ...(order.shippedAt ? {} : { shippedAt: new Date() }),
  });
  console.log("[WEBHOOKS-SHIPPO] Order delivered:", order.orderNumber);

  const { customer } = resolveRecipients(order);

  try {
    const html = await render(
      React.createElement(DeliveryConfirmationEmail, {
        customerFirstName: order.customer.firstName,
        orderNumber: order.orderNumber,
        carrier: order.shippo.carrier,
        trackingNumber: order.shippo.trackingNumber,
      })
    );

    await resend.emails.send({
      from: FROM,
      to: [customer],
      subject: `Your order ${order.orderNumber} was delivered`,
      html,
    });
  } catch (emailError) {
    console.error(
      "[WEBHOOKS-SHIPPO] Delivery email failed (order still marked delivered):",
      emailError
    );
  }
}

// Carrier reported a problem (failed delivery / returned to sender). Alert the
// admin only — they own the resolution, so we do NOT change order status.
// NOTE: no persistent dedup, so a carrier that posts multiple exception updates
// can trigger more than one alert. Acceptable for an internal heads-up; revisit
// with an `exceptionNotifiedAt` field if it proves noisy.
async function handleException(
  order: IOrder,
  carrierStatus: string,
  statusDetails?: string
): Promise<void> {
  // Don't alert on terminal orders — a return on an already-refunded/cancelled
  // order is expected and not actionable.
  if (order.status === "cancelled" || order.status === "refunded") {
    return;
  }

  console.warn(
    `[WEBHOOKS-SHIPPO] Shipment exception (${carrierStatus}) for order:`,
    order.orderNumber
  );

  const { admin } = resolveRecipients(order);

  try {
    const html = await render(
      React.createElement(ShipmentExceptionEmail, {
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        carrier: order.shippo.carrier ?? "carrier",
        trackingNumber: order.shippo.trackingNumber ?? "",
        carrierStatus,
        statusDetails,
        trackingUrlProvider: order.shippo.trackingUrlProvider,
      })
    );

    await resend.emails.send({
      from: FROM,
      to: [admin],
      subject: `Action needed: shipping issue on order ${order.orderNumber}`,
      html,
    });
  } catch (emailError) {
    console.error("[WEBHOOKS-SHIPPO] Exception alert email failed:", emailError);
  }
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

  if (event !== "track_updated") {
    return NextResponse.json({ received: true });
  }

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
  const statusDetails = tracking_status?.status_details;

  switch (carrierStatus) {
    case "TRANSIT":
      await handleTransit(order);
      break;
    case "DELIVERED":
      await handleDelivered(order);
      break;
    case "FAILURE":
    case "RETURNED":
      await handleException(order, carrierStatus, statusDetails);
      break;
    default:
      // PRE_TRANSIT / UNKNOWN — nothing to do yet.
      break;
  }

  return NextResponse.json({ received: true });
}
