/**
 * Store Checkout API
 * POST: Charges Square, saves the Order to MongoDB, and sends the confirmation email.
 *
 * PRICE INTEGRITY: client-supplied money is NOT trusted. The subtotal is recomputed
 * from the Square catalog and shipping from a fresh Shippo re-quote (lib/checkout/
 * storePricing.ts). The body's `subtotalCents` and `selectedRate.rateCents` are
 * ignored for charging; only `selectedRate.carrier`/`service` select which fresh
 * rate to charge. See ecommerce/09-checkout-price-integrity.md.
 *
 * Request body:
 *   paymentToken   — Square nonce from the card form
 *   customer       — { firstName, lastName, email, phone? }
 *   shippingAddress — IOrderAddress shape
 *   selectedRate   — { rateId, carrier, service, serviceName, rateCents, estimatedDays? }
 *                    (carrier + service identify the chosen rate; amount is re-quoted)
 *   items          — CartItem array (item ids + quantities; prices re-derived)
 *   subtotalCents  — number (ignored; recomputed server-side)
 */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSquareClient } from "@/lib/square/client";
import { getSessionUser } from "@/lib/auth/guards";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";
import { OrderConfirmationEmail } from "@/components/email-templates/OrderConfirmationEmail";
import { StoreOrderAdminEmail } from "@/components/email-templates/StoreOrderAdminEmail";
import { purchaseLabelForOrder } from "@/lib/shippo/labels";
import { squareCustomerService } from "@/lib/square/customers";
import { giftCardService } from "@/lib/square/gift-cards";
import {
  priceCartFromCatalog,
  resolveShippingRate,
  PriceIntegrityError,
} from "@/lib/checkout/storePricing";
import { normalizeIdempotencyKey } from "@/lib/checkout/idempotency";
import { resolveEmailRecipients, EMAIL_FROM } from "@/lib/email/recipients";
import type { LabelResult } from "@/lib/shippo/labels";
import type { CartItem } from "@/lib/types/cartTypes";
import type { ShippingRate } from "@/lib/shippo/rates";

const squareClient = getSquareClient();

/**
 * Split a full recipient name into first/last for Square's payment shippingAddress.
 * First token = first name, the remainder = last name (handles single-token names).
 * Falls back to the buyer's name when no recipient name is present.
 */
function splitName(
  full: string | undefined,
  fallback: { firstName: string; lastName: string }
): { firstName: string; lastName: string } {
  const trimmed = (full ?? "").trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface CheckoutRequest {
  paymentToken?: string;
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
  idempotencyKey?: string;
  /** Optional gift card the customer applied — validated against Square below. */
  giftCard?: { giftCardId: string; amountCents: number };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: CheckoutRequest = await request.json();

    const { paymentToken, customer, shippingAddress, selectedRate, items } = body;

    if (!customer || !shippingAddress || !selectedRate || !items?.length) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    // Mongo is needed to read parcel presets for the shipping re-quote.
    await connectMongo();

    // Durable buyer identity: link this order to the authenticated user when one is
    // signed in. NON-FATAL and identity-only — a guest (null) still checks out, and
    // the buyer email/charge always comes from the submitted form (so gifting and
    // buying-for-someone keep working). See lib/account/queries.ts for read-side use.
    const sessionUser = await getSessionUser();

    // PRICE INTEGRITY: never trust client money. Recompute the subtotal from the
    // Square catalog and the shipping from a fresh Shippo re-quote. A tampered
    // body (tiny subtotalCents / rateCents) is overridden here; an unsellable item
    // or vanished shipping service throws PriceIntegrityError → 400 (no charge).
    // See ecommerce/09-checkout-price-integrity.md.
    const pricedCart = await priceCartFromCatalog(items);
    const serverRate = await resolveShippingRate(
      {
        name: shippingAddress.name,
        street1: shippingAddress.addressLine1,
        street2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.stateProvince,
        zip: shippingAddress.postalCode,
        country: shippingAddress.country || "US",
      },
      items,
      selectedRate
    );

    const subtotalCents = pricedCart.subtotalCents;

    // Sales tax temporarily disabled (pending the studio's nexus/rate decision — see
    // ecommerce/ecommerce-sales-tax-guide.md). Order keeps taxCents: 0 for now.
    const totalCents = subtotalCents + serverRate.rateCents;

    console.log("[API-STORE-CHECKOUT-POST] Processing checkout for:", customer.email, "Server total:", totalCents);

    // Gift card: validate against Square's REAL balance and reduce the card charge.
    // Gift cards apply to the PRODUCT SUBTOTAL ONLY — never to shipping — so the
    // credit is clamped to subtotalCents (not the shipping-inclusive totalCents).
    // A tampered amountCents can never apply more than the actual balance / subtotal.
    let giftCardAppliedCents = 0;
    if (body.giftCard && body.giftCard.amountCents > 0) {
      try {
        const card = await giftCardService.getById(body.giftCard.giftCardId);
        const available = card && card.state === "ACTIVE" ? card.balanceMoney.amount : 0;
        giftCardAppliedCents = Math.max(
          0,
          Math.min(body.giftCard.amountCents, available, subtotalCents)
        );
      } catch (giftCardError) {
        console.error(
          "[API-STORE-CHECKOUT-POST] Gift card validation failed (applying $0):",
          giftCardError
        );
      }
    }
    const chargeCents = totalCents - giftCardAppliedCents;

    // Step 1: Charge the card portion (skipped when a gift card covers the full total).
    let squarePaymentId: string | undefined;
    if (chargeCents > 0) {
      if (!paymentToken) {
        return NextResponse.json(
          { error: "Payment information is required" },
          { status: 400 }
        );
      }
      const paymentResult = await squareClient.payments.create({
        idempotencyKey: normalizeIdempotencyKey(body.idempotencyKey),
        sourceId: paymentToken,
        amountMoney: {
          amount: BigInt(chargeCents),
          currency: "USD",
        },
        buyerEmailAddress: customer.email,
        shippingAddress: {
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          // Ship-to name is the RECIPIENT (gift orders ship to someone other than
          // the buyer); derived from shippingAddress.name, not the payer.
          ...splitName(shippingAddress.name, {
            firstName: customer.firstName,
            lastName: customer.lastName,
          }),
          postalCode: shippingAddress.postalCode,
          country: (shippingAddress.country || "US") as "US",
        },
        note: `Coastal Creations Studio — online store order`,
      });

      const payment = paymentResult.payment;
      if (payment?.status !== "COMPLETED") {
        console.error("[API-STORE-CHECKOUT-POST] Square payment not completed:", payment?.status);
        return NextResponse.json(
          { error: "Payment was not completed", status: payment?.status },
          { status: 400 }
        );
      }
      console.log("[API-STORE-CHECKOUT-POST] Square payment completed:", payment.id);
      squarePaymentId = payment.id ?? undefined;
    }

    // Redeem the gift card. Gift-card-only order → fatal on failure (no order is
    // created); partial (card already charged) → non-fatal (reconcile manually).
    if (giftCardAppliedCents > 0 && body.giftCard) {
      try {
        await giftCardService.redeem(
          body.giftCard.giftCardId,
          giftCardAppliedCents,
          customer.email
        );
      } catch (giftCardError) {
        console.error("[API-STORE-CHECKOUT-POST] Gift card redemption failed:", giftCardError);
        if (chargeCents === 0) {
          return NextResponse.json(
            { error: "Gift card could not be redeemed. No charge was made." },
            { status: 400 }
          );
        }
      }
    }

    // Step 2: Save Order to MongoDB — with SERVER-derived prices and the FRESH
    // rate id from the re-quote (the label purchase transacts on this id, and the
    // client's original id would already be stale).
    const orderItems = pricedCart.items.map((item) => ({
      squareCatalogItemId: item.squareCatalogItemId,
      squareVariationId: item.squareVariationId,
      name: item.name,
      variationName: item.variationName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    }));

    const newOrder = await Order.create({
      userId: sessionUser
        ? new mongoose.Types.ObjectId(sessionUser.id)
        : undefined,
      items: orderItems,
      subtotalCents,
      shippingCents: serverRate.rateCents,
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
        paymentId: squarePaymentId,
      },
      giftCard:
        giftCardAppliedCents > 0 && body.giftCard
          ? { giftCardId: body.giftCard.giftCardId, amountCents: giftCardAppliedCents }
          : undefined,
      shippo: {
        rateId: serverRate.rateId,
        carrier: serverRate.carrier,
        serviceLevel: serverRate.service,
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
      // Associate the Square customer profile with the authenticated user (once),
      // so their account can resolve saved payment methods (Cards on File) later.
      // Adapter-managed `users` collection — direct driver update, only if unset.
      if (sessionUser) {
        await mongoose.connection
          .collection("users")
          .updateOne(
            {
              _id: new mongoose.Types.ObjectId(sessionUser.id),
              squareCustomerId: { $exists: false },
            },
            { $set: { squareCustomerId: squareResult.customerId } }
          );
      }
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
    const { customer: customerRecipient, admin: adminRecipient } =
      resolveEmailRecipients(customer.email);

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
            shippingCents: serverRate.rateCents,
            totalCents,
            shippingAddress: {
              name: shippingAddress.name,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              stateProvince: shippingAddress.stateProvince,
              postalCode: shippingAddress.postalCode,
            },
            shippingMethod: serverRate.serviceName,
          },
        })
      );

      const adminEmailHtml = await render(
        React.createElement(StoreOrderAdminEmail, {
          orderNumber: newOrder.orderNumber,
          customer,
          items: orderItems,
          subtotalCents,
          shippingCents: serverRate.rateCents,
          totalCents,
          shippingAddress: {
            name: shippingAddress.name,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            stateProvince: shippingAddress.stateProvince,
            postalCode: shippingAddress.postalCode,
          },
          shippingMethod: serverRate.serviceName,
          labelUrl: label?.labelUrl,
          trackingNumber: label?.trackingNumber,
          labelFailed: label === null,
        })
      );

      await Promise.allSettled([
        resend.emails.send({
          from: EMAIL_FROM,
          to: [customerRecipient],
          subject: `Order ${newOrder.orderNumber} confirmed — Coastal Creations Studio`,
          html: emailHtml,
        }),
        resend.emails.send({
          from: EMAIL_FROM,
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
    // Price/shipping reconciliation failures are the customer's to resolve (stale
    // cart, item pulled, rate expired) — surface a clear 400 and DO NOT charge.
    if (error instanceof PriceIntegrityError) {
      console.warn("[API-STORE-CHECKOUT-POST] Price integrity rejection:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[API-STORE-CHECKOUT-POST] Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
