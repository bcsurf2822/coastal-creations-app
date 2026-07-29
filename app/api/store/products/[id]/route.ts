import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import { retrieveCatalogItem, getInventoryCounts } from "@/lib/square/catalog";
import {
  isSellablePhysicalGood,
  isInOnlineSalesCategory,
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
    const item = await retrieveCatalogItem(id);

    // Visible only if it's a physical good in an "Online Sales …" Square category.
    if (!item || !isSellablePhysicalGood(item) || !isInOnlineSalesCategory(item)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectMongo();
    const settings = (await StoreProductSettings.findOne({
      squareItemId: id,
    }).lean()) as IStoreProductSettings | null;

    const variationIds = item.variations.map((v) => v.id);
    const stock = await getInventoryCounts(variationIds);

    const product = toStoreProduct(item, settings ?? undefined, stock);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("[API-STORE-PRODUCTS-GET-ID] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load product" },
      { status: 500 }
    );
  }
}
