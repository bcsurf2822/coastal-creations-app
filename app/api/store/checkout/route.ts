/**
 * Store Checkout API
 * POST: Charges Square, saves the Order to MongoDB, and sends the confirmation email.
 *
 * Request body:
 *   paymentToken   — Square nonce from the card form
 *   customer       — { firstName, lastName, email, phone? }
 *   shippingAddress — IOrderAddress shape
 *   selectedRate   — { rateId, carrier, service, serviceName, rateCents, estimatedDays? }
 *   items          — CartItem array (used to build the order snapshot)
 *   subtotalCents  — number
 */
import { NextResponse } from "next/server";
import { Client, Environment } from "square/legacy";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { OrderConfirmationEmail } from "@/components/email-templates/OrderConfirmationEmail";
import { StoreOrderAdminEmail } from "@/components/email-templates/StoreOrderAdminEmail";
import { purchaseLabelForOrder } from "@/lib/shippo/labels";
import { squareCustomerService } from "@/lib/square/customers";
import type { LabelResult } from "@/lib/shippo/labels";
import type { CartItem } from "@/lib/types/cartTypes";
import type { ShippingRate } from "@/lib/shippo/rates";

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const resend = new Resend(process.env.RESEND_API_KEY);

interface CheckoutRequest {
  paymentToken: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  selectedRate: ShippingRate;
  items: CartItem[];
  subtotalCents: number;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: CheckoutRequest = await request.json();

    const { paymentToken, customer, shippingAddress, selectedRate, items, subtotalCents } = body;

    if (!paymentToken || !customer || !shippingAddress || !selectedRate || !items?.length) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    // Sales tax temporarily disabled (pending the studio's nexus/rate decision — see
    // ecommerce/ecommerce-sales-tax-guide.md). Order keeps taxCents: 0 for now.
    const totalCents = subtotalCents + selectedRate.rateCents;

    console.log("[API-STORE-CHECKOUT-POST] Processing checkout for:", customer.email, "Total:", totalCents);

    // Step 1: Charge Square
    const paymentResult = await squareClient.paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId: paymentToken,
      amountMoney: {
        amount: BigInt(totalCents),
        currency: "USD",
      },
      buyerEmailAddress: customer.email,
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        firstName: customer.firstName,
        lastName: customer.lastName,
        postalCode: shippingAddress.postalCode,
        country: (shippingAddress.country || "US") as "US",
      },
      note: `Coastal Creations Studio — online store order`,
    });

    const payment = paymentResult.result.payment;

    if (payment?.status !== "COMPLETED") {
      console.error("[API-STORE-CHECKOUT-POST] Square payment not completed:", payment?.status);
      return NextResponse.json(
        { error: "Payment was not completed", status: payment?.status },
        { status: 400 }
      );
    }

    console.log("[API-STORE-CHECKOUT-POST] Square payment completed:", payment.id);

    // Step 2: Save Order to MongoDB
    await connectMongo();

    const orderItems = items.map((item) => ({
      squareCatalogItemId: item.squareCatalogItemId,
      squareVariationId: item.squareVariationId,
      name: item.productName,
      variationName: item.variationName,
      quantity: item.quantity,
      unitPriceCents: item.priceCents,
    }));

    const newOrder = await Order.create({
      items: orderItems,
      subtotalCents,
      shippingCents: selectedRate.rateCents,
      taxCents: 0,
      totalCents,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress,
      square: {
        paymentId: payment.id,
      },
      shippo: {
        rateId: selectedRate.rateId,
        carrier: selectedRate.carrier,
        serviceLevel: selectedRate.service,
      },
      status: "paid",
      refundStatus: "none",
    });

    console.log("[API-STORE-CHECKOUT-POST] Order saved:", newOrder.orderNumber);

    // Link this order to a Square customer (unifies store + booking history, and lets a
    // signed-in customer's account resolve their Square profile). Non-fatal: a Square
    // failure must never fail a paid order — mirrors the booking flow.
    try {
      const squareResult = await squareCustomerService.findOrCreateCustomer({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        address: shippingAddress.addressLine1
          ? {
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.stateProvince,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || "US",
            }
          : undefined,
      });
      await Order.findByIdAndUpdate(newOrder._id, {
        "square.customerId": squareResult.customerId,
      });
    } catch (squareError) {
      console.error(
        "[API-STORE-CHECKOUT-POST] Square customer link failed (non-fatal):",
        squareError
      );
    }

    // Step 3: Auto-create the Shippo shipping label (diagram step 3 → "label_created").
    // Non-fatal: if Shippo fails, the order stays "paid" and the merchant can create the
    // label manually from the admin order page (POST /api/store/shipping-label fallback).
    // This NEVER emails the customer — that happens only at "Mark Shipped".
    let label: LabelResult | null = null;
    try {
      label = await purchaseLabelForOrder(newOrder._id.toString());
    } catch (labelError) {
      console.error(
        "[API-STORE-CHECKOUT-POST] Auto-label failed (order saved as paid):",
        labelError
      );
    }

    // Step 4: Send emails (non-blocking — a failure here shouldn't fail the order)
    const isProduction = process.env.VERCEL_ENV === "production";
    const customerRecipient = isProduction ? customer.email : (process.env.DEV_EMAIL ?? customer.email);
    const adminRecipient = isProduction
      ? (process.env.STUDIO_EMAIL ?? "ashley@coastalcreationsstudio.com")
      : (process.env.DEV_EMAIL ?? customer.email);

    try {
      const emailHtml = await render(
        React.createElement(OrderConfirmationEmail, {
          order: {
            orderNumber: newOrder.orderNumber,
            customerFirstName: customer.firstName,
            customerEmail: customer.email,
            items: orderItems.map((item) => ({
              name: item.name,
              variationName: item.variationName,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
            })),
            subtotalCents,
            shippingCents: selectedRate.rateCents,
            totalCents,
            shippingAddress: {
              name: shippingAddress.name,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              stateProvince: shippingAddress.stateProvince,
              postalCode: shippingAddress.postalCode,
            },
            shippingMethod: selectedRate.serviceName,
          },
        })
      );

      const adminEmailHtml = await render(
        React.createElement(StoreOrderAdminEmail, {
          orderNumber: newOrder.orderNumber,
          customer,
          items: orderItems,
          subtotalCents,
          shippingCents: selectedRate.rateCents,
          totalCents,
          shippingAddress: {
            name: shippingAddress.name,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            stateProvince: shippingAddress.stateProvince,
            postalCode: shippingAddress.postalCode,
          },
          shippingMethod: selectedRate.serviceName,
          labelUrl: label?.labelUrl,
          trackingNumber: label?.trackingNumber,
          labelFailed: label === null,
        })
      );

      await Promise.allSettled([
        resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [customerRecipient],
          subject: `Order ${newOrder.orderNumber} confirmed — Coastal Creations Studio`,
          html: emailHtml,
        }),
        resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [adminRecipient],
          subject: `New Store Order: ${newOrder.orderNumber} — ${customer.firstName} ${customer.lastName}`,
          html: adminEmailHtml,
        }),
      ]);
    } catch (emailError) {
      console.error("[API-STORE-CHECKOUT-POST] Email send failed (order still saved):", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error("[API-STORE-CHECKOUT-POST] Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
