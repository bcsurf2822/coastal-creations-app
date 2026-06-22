import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import RefundRequest from "@/lib/models/RefundRequest";

/** Admin: list refund requests (filter by status), plus the pending count. */
export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = status ? { status } : {};

    const [requests, pendingCount] = await Promise.all([
      RefundRequest.find(query).sort({ createdAt: -1 }).limit(200).lean(),
      RefundRequest.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({ success: true, requests, pendingCount });
  } catch (error) {
    console.error("[API-ADMIN-REFUND-REQUESTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load refund requests" },
      { status: 500 }
    );
  }
}
