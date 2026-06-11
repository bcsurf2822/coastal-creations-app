import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import { listCatalogItems, getInventoryCounts } from "@/lib/square/catalog";
import {
  isSellablePhysicalGood,
  toStoreProductSummary,
} from "@/lib/utils/catalogHelpers";
import type { StoreProductSummary } from "@/lib/types/storeTypes";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";

export async function GET(): Promise<Response> {
  try {
    await connectMongo();

    const settings = (await StoreProductSettings.find({
      isOnlineSellable: true,
    }).lean()) as unknown as IStoreProductSettings[];

    if (settings.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const byId = new Map(settings.map((s) => [s.squareItemId, s]));

    const allItems = await listCatalogItems([...byId.keys()]);
    const items = allItems.filter(isSellablePhysicalGood);

    const variationIds = items.flatMap((i) => i.variations.map((v) => v.id));
    const stock = await getInventoryCounts(variationIds);

    const products: StoreProductSummary[] = items
      .map((item) => toStoreProductSummary(item, byId.get(item.id)!, stock))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[API-STORE-PRODUCTS-GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load products" },
      { status: 500 }
    );
  }
}
