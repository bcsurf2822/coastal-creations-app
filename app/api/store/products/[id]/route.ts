import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import { retrieveCatalogItem, getInventoryCounts } from "@/lib/square/catalog";
import {
  isSellablePhysicalGood,
  toStoreProduct,
} from "@/lib/utils/catalogHelpers";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { id } = await params;

  try {
    await connectMongo();

    const settings = (await StoreProductSettings.findOne({
      squareItemId: id,
      isOnlineSellable: true,
    }).lean()) as IStoreProductSettings | null;

    if (!settings) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = await retrieveCatalogItem(id);

    if (!item || !isSellablePhysicalGood(item)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const variationIds = item.variations.map((v) => v.id);
    const stock = await getInventoryCounts(variationIds);

    const product = toStoreProduct(item, settings, stock);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("[API-STORE-PRODUCTS-GET-ID] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load product" },
      { status: 500 }
    );
  }
}
