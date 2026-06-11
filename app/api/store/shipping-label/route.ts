import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Shippo } from "shippo";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { ShippingConfirmationEmail } from "@/components/email-templates/ShippingConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY ?? "",
});

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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

    if (order.status !== "paid") {
      return NextResponse.json(
        { error: `Cannot create label for order in status: ${order.status}` },
        { status: 400 }
      );
    }

    if (!order.shippo.rateId) {
      return NextResponse.json(
        { error: "Order has no Shippo rateId — cannot purchase label" },
        { status: 400 }
      );
    }

    console.log("[API-STORE-SHIPPING-LABEL-POST] Purchasing label for order:", order.orderNumber);

    const transaction = await shippoClient.transactions.create({
      rate: order.shippo.rateId,
      async: false,
    });

    if (transaction.status !== "SUCCESS") {
      console.error(
        "[API-STORE-SHIPPING-LABEL-POST] Shippo transaction failed:",
        transaction.status,
        transaction.messages
      );
      return NextResponse.json(
        { error: "Shippo label purchase failed", messages: transaction.messages },
        { status: 502 }
      );
    }

    await Order.findByIdAndUpdate(orderId, {
      "shippo.transactionId": transaction.objectId,
      "shippo.labelUrl": transaction.labelUrl,
      "shippo.trackingNumber": transaction.trackingNumber,
      "shippo.trackingUrlProvider": transaction.trackingUrlProvider,
      status: "label_created",
    });

    console.log(
      "[API-STORE-SHIPPING-LABEL-POST] Label created for:",
      order.orderNumber,
      "tracking:",
      transaction.trackingNumber
    );

    // Send tracking email to customer (non-blocking — label is already saved)
    const isProduction = process.env.VERCEL_ENV === "production";
    const customerRecipient = isProduction
      ? order.customer.email
      : (process.env.DEV_EMAIL ?? order.customer.email);

    try {
      const emailHtml = await render(
        React.createElement(ShippingConfirmationEmail, {
          customerFirstName: order.customer.firstName,
          orderNumber: order.orderNumber,
          carrier: order.shippo.carrier ?? "carrier",
          trackingNumber: transaction.trackingNumber ?? "",
          trackingUrlProvider: transaction.trackingUrlProvider,
        })
      );

      await resend.emails.send({
        from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
        to: [customerRecipient],
        subject: `Your order ${order.orderNumber} has shipped!`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("[API-STORE-SHIPPING-LABEL-POST] Tracking email failed (label still created):", emailError);
    }

    return NextResponse.json({
      success: true,
      labelUrl: transaction.labelUrl,
      trackingNumber: transaction.trackingNumber,
      trackingUrlProvider: transaction.trackingUrlProvider,
    });
  } catch (error) {
    console.error("[API-STORE-SHIPPING-LABEL-POST] Error:", error);
    return NextResponse.json({ error: "Failed to create shipping label" }, { status: 500 });
  }
}
