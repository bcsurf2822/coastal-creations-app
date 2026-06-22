import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import RefundRequest from "@/lib/models/RefundRequest";

interface PatchBody {
  action?: "approve" | "decline";
  adminNote?: string;
}

/**
 * Admin: resolve a refund request. "approve" marks it approved (the actual Square
 * refund is issued separately through the existing refund routes, then this is
 * called to close the request). "decline" marks it declined with an optional note.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await connectMongo();
    const { id } = await params;
    const body = (await request.json()) as PatchBody;

    const req = await RefundRequest.findById(id);
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (req.status !== "pending") {
      return NextResponse.json(
        { error: `Request already ${req.status}` },
        { status: 400 }
      );
    }

    if (body.action === "approve") {
      req.status = "approved";
    } else if (body.action === "decline") {
      req.status = "declined";
      if (body.adminNote) req.adminNote = body.adminNote;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    req.resolvedAt = new Date();
    req.resolvedByEmail = guard.email;
    await req.save();

    return NextResponse.json({ success: true, request: req.toObject() });
  } catch (error) {
    console.error("[API-ADMIN-REFUND-REQUESTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update refund request" },
      { status: 500 }
    );
  }
}
