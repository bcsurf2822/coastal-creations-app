import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import { listCatalogItems, getInventoryCounts } from "@/lib/square/catalog";
import {
  isSellablePhysicalGood,
  isInOnlineSalesCategory,
  toStoreProductSummary,
} from "@/lib/utils/catalogHelpers";
import type { StoreProductSummary } from "@/lib/types/storeTypes";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";

export async function GET(): Promise<Response> {
  try {
    // Shop visibility is driven entirely by Square: an item appears online when the
    // merchant adds it to an "Online Sales …" category in the Square dashboard. No
    // app-side toggle. StoreProductSettings is now only an OPTIONAL layer for parcel
    // size / slug / display order overrides.
    const allItems = await listCatalogItems();
    const items = allItems.filter(
      (item) => isSellablePhysicalGood(item) && isInOnlineSalesCategory(item)
    );

    if (items.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    await connectMongo();
    const settings = (await StoreProductSettings.find({
      squareItemId: { $in: items.map((i) => i.id) },
    }).lean()) as unknown as IStoreProductSettings[];
    const byId = new Map(settings.map((s) => [s.squareItemId, s]));

    const variationIds = items.flatMap((i) => i.variations.map((v) => v.id));
    const stock = await getInventoryCounts(variationIds);

    const products: StoreProductSummary[] = items
      .map((item) => toStoreProductSummary(item, byId.get(item.id), stock))
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
