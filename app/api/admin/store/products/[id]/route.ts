import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      isOnlineSellable?: boolean;
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
