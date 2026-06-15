import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import type { OrderStatus } from "@/lib/models/Order";
import { ShippingConfirmationEmail } from "@/components/email-templates/ShippingConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// Request body: either a generic status override, or a named workflow action.
interface PatchBody {
  action?: "mark_shipped";
  status?: OrderStatus;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { id } = await params;

  try {
    await connectMongo();
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[API-ADMIN-STORE-ORDERS-ID-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as PatchBody;
    await connectMongo();

    // --- Named action: Mark Shipped & Notify Customer (diagram step 7) ---
    // This is the merchant's deliberate "I packed and dropped it off" control. It is
    // the ONLY place the customer "your order shipped" email is sent. Idempotent: a
    // second call after shipping is a no-op and sends no duplicate email.
    if (body.action === "mark_shipped") {
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Already shipped/delivered → idempotent no-op, no second email.
      if (order.shippedAt || order.status === "shipped" || order.status === "delivered") {
        return NextResponse.json({ success: true, order: order.toObject(), alreadyShipped: true });
      }

      // Can only ship an order that has a label.
      if (order.status !== "label_created") {
        return NextResponse.json(
          {
            error: `Cannot mark shipped from status "${order.status}" — a shipping label must exist first.`,
          },
          { status: 400 }
        );
      }

      order.status = "shipped";
      order.shippedAt = new Date();
      await order.save();

      console.log("[API-ADMIN-STORE-ORDERS-ID-PATCH] Marked shipped:", order.orderNumber);

      // Send the customer their tracking email (non-blocking — status is already saved).
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
            trackingNumber: order.shippo.trackingNumber ?? "",
            trackingUrlProvider: order.shippo.trackingUrlProvider,
          })
        );

        await resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [customerRecipient],
          subject: `Your order ${order.orderNumber} has shipped!`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "[API-ADMIN-STORE-ORDERS-ID-PATCH] Shipping email failed (order still marked shipped):",
          emailError
        );
      }

      return NextResponse.json({ success: true, order: order.toObject() });
    }

    // --- Generic status override (admin escape hatch; does not send email) ---
    if (!body.status) {
      return NextResponse.json({ error: "Missing status or action" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[API-ADMIN-STORE-ORDERS-ID-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
