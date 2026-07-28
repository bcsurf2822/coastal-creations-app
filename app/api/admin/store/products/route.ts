import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";
import { listCatalogItems } from "@/lib/square/catalog";

export async function GET(): Promise<Response> {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await connectMongo();

    const [allItems, allSettings] = await Promise.all([
      listCatalogItems(),
      StoreProductSettings.find({}).lean() as unknown as IStoreProductSettings[],
    ]);

    const settingsById = new Map(allSettings.map((s) => [s.squareItemId, s]));

    const products = allItems
      .filter((item) => !item.isArchived && item.productType === "REGULAR")
      .map((item) => ({
        catalogItem: item,
        settings: settingsById.get(item.id) ?? null,
      }));

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[API-ADMIN-STORE-PRODUCTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
