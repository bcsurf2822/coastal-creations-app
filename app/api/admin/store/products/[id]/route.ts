import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    // Shop visibility is controlled by Square categories, not here. This route only
    // persists the optional shipping/display overrides for an item.
    const body = (await request.json()) as {
      parcelPreset?: ParcelPreset;
      slug?: string;
      displayOrder?: number;
    };

    await connectMongo();

    const settings = await StoreProductSettings.findOneAndUpdate(
      { squareItemId: id },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[API-ADMIN-STORE-PRODUCTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
