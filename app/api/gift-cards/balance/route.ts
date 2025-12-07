/**
 * Gift Card Balance API Route
 * GET: Check balance by GAN (no authentication required)
 */
import { NextResponse } from "next/server";
import { giftCardService } from "@/lib/square/gift-cards";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const gan = searchParams.get("gan");

    if (!gan) {
      return NextResponse.json(
        { error: "Gift card number (GAN) is required" },
        { status: 400 }
      );
    }

    // Clean GAN - remove dashes if present
    const cleanGan = gan.replace(/-/g, "");

    // Validate GAN format (should be 16 digits)
    if (cleanGan.length !== 16 || !/^\d+$/.test(cleanGan)) {
      return NextResponse.json(
        { error: "Invalid gift card number format" },
        { status: 400 }
      );
    }

    console.log("[API-GIFT-CARDS-BALANCE] Checking balance for GAN:", `****${cleanGan.slice(-4)}`);

    const result = await giftCardService.getBalance(cleanGan);

    if (!result) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      balance: result.balance,
      status: result.status,
      giftCardId: result.giftCardId,
      formattedBalance: `$${(result.balance / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error("[API-GIFT-CARDS-BALANCE] Error checking balance:", error);
    return NextResponse.json(
      { error: "Failed to check gift card balance" },
      { status: 500 }
    );
  }
}
