/**
 * Gift Cards List API Route (Admin)
 * GET: List all gift cards with pagination and filtering
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { giftCardService } from "@/lib/square/gift-cards";

export async function GET(request: Request): Promise<Response> {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;
    const state = searchParams.get("state") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    console.log("[API-GIFT-CARDS-LIST] Fetching gift cards, state:", state, "limit:", limit);

    const result = await giftCardService.listGiftCards({
      cursor,
      state,
      limit,
    });

    return NextResponse.json({
      success: true,
      giftCards: result.giftCards,
      cursor: result.cursor,
      totalOutstandingBalance: result.totalOutstandingBalance,
      count: result.giftCards.length,
    });
  } catch (error) {
    console.error("[API-GIFT-CARDS-LIST] Error listing gift cards:", error);
    return NextResponse.json(
      { error: "Failed to list gift cards" },
      { status: 500 }
    );
  }
}
