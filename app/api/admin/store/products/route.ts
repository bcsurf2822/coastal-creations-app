import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";
import { listCatalogItems } from "@/lib/square/catalog";

export async function GET(): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
