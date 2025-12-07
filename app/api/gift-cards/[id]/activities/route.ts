/**
 * Gift Card Activities API Route (Admin)
 * GET: List activity history for a specific gift card
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { giftCardService } from "@/lib/square/gift-cards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: giftCardId } = await params;

    if (!giftCardId) {
      return NextResponse.json(
        { error: "Gift card ID is required" },
        { status: 400 }
      );
    }

    console.log("[API-GIFT-CARDS-ACTIVITIES] Fetching activities for card:", giftCardId);

    const activities = await giftCardService.getGiftCardActivities(giftCardId);

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error("[API-GIFT-CARDS-ACTIVITIES] Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch gift card activities" },
      { status: 500 }
    );
  }
}
