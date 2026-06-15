/**
 * Square Payment Webhook
 *
 * Handles `payment.completed` events from Square.
 * Auto-creates the Shippo shipping label so the merchant doesn't need to
 * trigger it manually from the admin panel.
 *
 * Idempotency: only acts on orders in "paid" status — silently skips if the
 * label was already created by a duplicate event or the admin fallback route.
 *
 * Verification: Square signs requests with HMAC-SHA256 over the webhook URL
 * concatenated with the raw body. Set SQUARE_WEBHOOK_SIGNATURE_KEY to the
 * signing secret shown in Square dashboard → Webhooks.
 * Set SQUARE_WEBHOOK_URL to the exact URL registered there (used for verification).
 */
import { NextResponse } from "next/server";
import { Shippo } from "shippo";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { ShippingConfirmationEmail } from "@/components/email-templates/ShippingConfirmationEmail";
import { verifySquareWebhookSignature } from "@/lib/utils/webhookHelpers";

const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY ?? "",
});

const resend = new Resend(process.env.RESEND_API_KEY);

interface SquarePaymentEvent {
  type: string;
  event_id: string;
  data: {
    object: {
      payment?: {
        id: string;
        status: string;
      };
    };
  };
}


export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");
  const webhookUrl =
    process.env.SQUARE_WEBHOOK_URL ?? new URL(request.url).toString();

  if (!verifySquareWebhookSignature(rawBody, signature, webhookUrl, process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)) {
    console.warn("[WEBHOOKS-SQUARE] Invalid signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: SquarePaymentEvent;
  try {
    event = JSON.parse(rawBody) as SquarePaymentEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[WEBHOOKS-SQUARE] Received event:", event.type, "id:", event.event_id);

  // Only act on completed payments — acknowledge everything else
  if (event.type !== "payment.completed") {
    return NextResponse.json({ received: true });
  }

  const paymentId = event.data?.object?.payment?.id;
  if (!paymentId) {
    console.warn("[WEBHOOKS-SQUARE] No payment ID in payload");
    return NextResponse.json({ received: true });
  }

  await connectMongo();
  const order = await Order.findOne({ "square.paymentId": paymentId });

  if (!order) {
    // Payment belongs to a class booking, gift card, or other non-store flow
    console.log("[WEBHOOKS-SQUARE] No store order for payment:", paymentId);
    return NextResponse.json({ received: true });
  }

  // Idempotency guard — skip if label already created by a prior event or admin action
  if (order.status !== "paid") {
    console.log(
      "[WEBHOOKS-SQUARE] Order",
      order.orderNumber,
      "already at status:",
      order.status,
      "— skipping",
    );
    return NextResponse.json({ received: true });
  }

  if (!order.shippo?.rateId) {
    console.error(
      "[WEBHOOKS-SQUARE] Order",
      order.orderNumber,
      "missing Shippo rateId — cannot auto-create label",
    );
    return NextResponse.json({ received: true });
  }

  console.log("[WEBHOOKS-SQUARE] Auto-creating label for:", order.orderNumber);

  try {
    const transaction = await shippoClient.transactions.create({
      rate: order.shippo.rateId,
      async: false,
    });

    if (transaction.status !== "SUCCESS") {
      console.error(
        "[WEBHOOKS-SQUARE] Shippo transaction failed:",
        transaction.status,
        transaction.messages,
      );
      // Return 200 — Shippo failures should not trigger Square retries.
      // Admin can use the fallback /api/store/shipping-label endpoint.
      return NextResponse.json({ received: true });
    }

    await Order.findByIdAndUpdate(order._id, {
      "shippo.transactionId": transaction.objectId,
      "shippo.labelUrl": transaction.labelUrl,
      "shippo.trackingNumber": transaction.trackingNumber,
      "shippo.trackingUrlProvider": transaction.trackingUrlProvider,
      status: "label_created",
    });

    console.log(
      "[WEBHOOKS-SQUARE] Label created for:",
      order.orderNumber,
      "tracking:",
      transaction.trackingNumber,
    );

    // Send merchant label-ready email and customer shipping confirmation
    const isProduction = process.env.VERCEL_ENV === "production";
    const merchantEmail = isProduction
      ? (process.env.STUDIO_EMAIL ?? "ashley@coastalcreationsstudio.com")
      : (process.env.DEV_EMAIL ?? "ashley@coastalcreationsstudio.com");
    const customerEmail = isProduction
      ? order.customer.email
      : (process.env.DEV_EMAIL ?? order.customer.email);

    try {
      const customerEmailHtml = await render(
        React.createElement(ShippingConfirmationEmail, {
          customerFirstName: order.customer.firstName,
          orderNumber: order.orderNumber,
          carrier: order.shippo.carrier ?? "carrier",
          trackingNumber: transaction.trackingNumber ?? "",
          trackingUrlProvider: transaction.trackingUrlProvider,
        }),
      );

      const adminUrl =
        process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/store/orders`
          : "/admin/dashboard/store/orders";

      const merchantLabelHtml = `
        <p>A shipping label has been automatically generated for order <strong>${order.orderNumber}</strong>.</p>
        <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName} (${order.customer.email})</p>
        <p><strong>Tracking:</strong> ${transaction.trackingNumber ?? "N/A"} — ${order.shippo.carrier ?? ""}</p>
        <p><a href="${transaction.labelUrl ?? ""}" style="display:inline-block;background:#0c4a6e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Download Label PDF</a></p>
        <p><a href="${adminUrl}">View order in Admin</a></p>
      `;

      await Promise.allSettled([
        resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [merchantEmail],
          subject: `Label ready — Order ${order.orderNumber} (${order.customer.firstName} ${order.customer.lastName})`,
          html: merchantLabelHtml,
        }),
        resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [customerEmail],
          subject: `Your order ${order.orderNumber} has shipped!`,
          html: customerEmailHtml,
        }),
      ]);
    } catch (emailError) {
      console.error("[WEBHOOKS-SQUARE] Emails failed (label still created):", emailError);
    }
  } catch (err) {
    console.error("[WEBHOOKS-SQUARE] Unexpected error:", err);
    // Return 200 — prevents Square from retrying on Shippo/DB errors.
    // Admin fallback route is always available.
  }

  return NextResponse.json({ received: true });
}
