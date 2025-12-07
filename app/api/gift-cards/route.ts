/**
 * Gift Cards API Route
 * POST: Create and activate a new gift card
 */
import { NextResponse } from "next/server";
import { giftCardService } from "@/lib/square/gift-cards";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { GiftCardEmailTemplate } from "@/components/email-templates/GiftCardEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

interface GiftCardPurchaseRequest {
  amountCents: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  personalMessage?: string;
  purchaserEmail: string;
  sourceId: string; // Card token from Square payment form
  customerId?: string; // Optional Square customer ID to link payment
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: GiftCardPurchaseRequest = await request.json();

    // Valid preset amounts in cents: $20, $35, $50, $100
    const VALID_AMOUNTS = [2000, 3500, 5000, 10000];

    // Validate required fields
    if (!body.amountCents || !VALID_AMOUNTS.includes(body.amountCents)) {
      return NextResponse.json(
        { error: "Please select a valid gift card amount ($20, $35, $50, or $100)" },
        { status: 400 }
      );
    }

    if (!body.recipientEmail || !body.recipientName || !body.senderName) {
      return NextResponse.json(
        { error: "Recipient email, recipient name, and sender name are required" },
        { status: 400 }
      );
    }

    if (!body.sourceId) {
      return NextResponse.json(
        { error: "Payment source (card token) is required" },
        { status: 400 }
      );
    }

    console.log("[API-GIFT-CARDS-POST] Creating gift card for amount:", body.amountCents);
    if (body.customerId) {
      console.log("[API-GIFT-CARDS-POST] Linking to customer:", body.customerId);
    }

    // Create order, process payment, create and activate the gift card
    const { gan, giftCardId, orderId, paymentId } = await giftCardService.createAndActivateGiftCard(
      body.amountCents,
      body.sourceId,
      body.customerId
    );

    console.log("[API-GIFT-CARDS-POST] Order:", orderId, "Payment:", paymentId);

    // Format GAN for display
    const formattedGan = giftCardService.formatGan(gan);

    // Send email to recipient
    try {
      const emailHtml = await render(
        React.createElement(GiftCardEmailTemplate, {
          recipientName: body.recipientName,
          senderName: body.senderName,
          amount: body.amountCents / 100,
          gan: formattedGan,
          personalMessage: body.personalMessage,
        })
      );

      await resend.emails.send({
        from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
        to: [body.recipientEmail],
        subject: `You've received a gift card from ${body.senderName}!`,
        html: emailHtml,
      });

      console.log("[API-GIFT-CARDS-POST] Gift card email sent to:", body.recipientEmail);
    } catch (emailError) {
      console.error("[API-GIFT-CARDS-POST] Failed to send email:", emailError);
      // Don't fail the entire request if email fails - card is already created
    }

    // Send confirmation to purchaser if different from recipient
    if (body.purchaserEmail && body.purchaserEmail !== body.recipientEmail) {
      try {
        await resend.emails.send({
          from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
          to: [body.purchaserEmail],
          subject: "Your gift card purchase confirmation",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Gift Card Purchase Confirmation</h2>
              <p>Thank you for your purchase!</p>
              <p>A gift card for <strong>$${(body.amountCents / 100).toFixed(2)}</strong> has been sent to <strong>${body.recipientName}</strong> at ${body.recipientEmail}.</p>
              <p>Gift Card Number (last 4): ****-****-****-${gan.slice(-4)}</p>
              <p style="margin-top: 24px; color: #666;">Coastal Creations Studio</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("[API-GIFT-CARDS-POST] Failed to send purchaser confirmation:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      gan: formattedGan,
      giftCardId,
      amount: body.amountCents,
    });
  } catch (error) {
    console.error("[API-GIFT-CARDS-POST] Error creating gift card:", error);

    // Log more details for debugging
    if (error instanceof Error) {
      console.error("[API-GIFT-CARDS-POST] Error message:", error.message);
      console.error("[API-GIFT-CARDS-POST] Error stack:", error.stack);
    }

    // Check if it's a Square API error
    const squareError = error as { errors?: Array<{ code?: string; detail?: string }> };
    if (squareError.errors) {
      console.error("[API-GIFT-CARDS-POST] Square API errors:", JSON.stringify(squareError.errors, null, 2));
      return NextResponse.json(
        { error: "Failed to create gift card", details: squareError.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create gift card", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
