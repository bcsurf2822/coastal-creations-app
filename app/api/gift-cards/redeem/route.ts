/**
 * Gift Card Redeem API Route
 * POST: Redeem a gift card amount
 *
 * Admin-only. Every checkout path that legitimately redeems a gift card
 * (app/api/store/checkout, app/api/checkout/booking) calls
 * giftCardService.redeem() directly, server-side — this HTTP route is not on
 * any live customer flow. It stayed reachable with no auth check, and since
 * gift-card balance/lookup is public (GET /api/gift-cards/balance), that made
 * it a bare "drain any card to $0" primitive for anyone who knows a GAN.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { giftCardService } from "@/lib/square/gift-cards";

interface RedeemRequest {
  giftCardId: string;
  amountCents: number;
  referenceId?: string;
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const body: RedeemRequest = await request.json();

    // Validate required fields
    if (!body.giftCardId) {
      return NextResponse.json(
        { error: "Gift card ID is required" },
        { status: 400 }
      );
    }

    if (!body.amountCents || body.amountCents <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    console.log("[API-GIFT-CARDS-REDEEM] Redeeming", body.amountCents, "cents from card:", body.giftCardId);

    // First check the card exists and has sufficient balance
    const card = await giftCardService.getById(body.giftCardId);

    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }

    if (card.state !== "ACTIVE") {
      return NextResponse.json(
        { error: `Gift card is not active (status: ${card.state})` },
        { status: 400 }
      );
    }

    if (card.balanceMoney.amount < body.amountCents) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          availableBalance: card.balanceMoney.amount,
          requestedAmount: body.amountCents,
        },
        { status: 400 }
      );
    }

    // Redeem the gift card
    const result = await giftCardService.redeem(
      body.giftCardId,
      body.amountCents,
      body.referenceId
    );

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      formattedNewBalance: `$${(result.newBalance / 100).toFixed(2)}`,
      redeemedAmount: body.amountCents,
    });
  } catch (error) {
    console.error("[API-GIFT-CARDS-REDEEM] Error redeeming gift card:", error);
    return NextResponse.json(
      { error: "Failed to redeem gift card" },
      { status: 500 }
    );
  }
}
