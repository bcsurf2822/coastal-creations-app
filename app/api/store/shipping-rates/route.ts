/**
 * Store Shipping Rates API
 * POST: Returns live Shippo carrier rates for the destination address + cart items.
 */
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import StoreProductSettings from "@/lib/models/StoreProductSettings";
import { getShippingRates } from "@/lib/shippo/rates";
import type { ShipToAddress } from "@/lib/shippo/rates";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";

interface ShippingRatesRequest {
  destination: ShipToAddress;
  // Map of squareCatalogItemId → quantity so we can look up parcel presets
  cartItems: Array<{ squareCatalogItemId: string; quantity: number }>;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ShippingRatesRequest = await request.json();

    if (!body.destination || !body.cartItems?.length) {
      return NextResponse.json({ error: "Missing destination or cart items" }, { status: 400 });
    }

    await connectMongo();

    const squareItemIds = body.cartItems.map((i) => i.squareCatalogItemId);
    const settings = await StoreProductSettings.find({
      squareItemId: { $in: squareItemIds },
    }).select("squareItemId parcelPreset shipping");

    // Build list of parcel presets (one per cart item, duplicated by quantity for largest-first logic)
    const presets: ParcelPreset[] = [];
    for (const cartItem of body.cartItems) {
      const setting = settings.find((s) => s.squareItemId === cartItem.squareCatalogItemId);
      const preset = setting?.parcelPreset ?? "MEDIUM";
      for (let i = 0; i < cartItem.quantity; i++) {
        presets.push(preset);
      }
    }

    console.log("[API-STORE-SHIPPING-RATES-POST] Fetching rates for destination:", body.destination.zip);

    const rates = await getShippingRates(body.destination, presets);

    if (rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates available for this address. Please verify your address." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, rates });
  } catch (error) {
    console.error("[API-STORE-SHIPPING-RATES-POST] Error fetching rates:", error);
    return NextResponse.json({ error: "Failed to fetch shipping rates" }, { status: 500 });
  }
}
