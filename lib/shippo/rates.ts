import { Shippo } from "shippo";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";
import { getParcelDimensions } from "@/lib/utils/parcelHelpers";

const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY ?? "",
});

// Ship-from (merchant origin) for all outbound orders + rate calc. Sourced from env so
// no merchant PII is hardcoded. NOTE: USPS requires BOTH a sender email AND phone, or the
// label purchase fails with "sender_info_missing" — keep MERCHANT_SHIP_FROM_EMAIL and
// MERCHANT_SHIP_FROM_PHONE populated.
const MERCHANT_SHIP_FROM = {
  name: process.env.MERCHANT_SHIP_FROM_NAME ?? "",
  street1: process.env.MERCHANT_SHIP_FROM_STREET ?? "",
  city: process.env.MERCHANT_SHIP_FROM_CITY ?? "",
  state: process.env.MERCHANT_SHIP_FROM_STATE ?? "",
  zip: process.env.MERCHANT_SHIP_FROM_ZIP ?? "",
  country: process.env.MERCHANT_SHIP_FROM_COUNTRY ?? "US",
  phone: process.env.MERCHANT_SHIP_FROM_PHONE ?? "",
  email: process.env.MERCHANT_SHIP_FROM_EMAIL ?? "",
};

// Surface a clear server log if the origin is misconfigured (rates/labels will fail).
if (!MERCHANT_SHIP_FROM.street1 || !MERCHANT_SHIP_FROM.phone || !MERCHANT_SHIP_FROM.email) {
  console.warn(
    "[SHIPPO-RATES] Incomplete MERCHANT_SHIP_FROM_* env — Shippo rates/labels may fail (USPS needs sender email + phone)."
  );
}

export interface ShipToAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShippingRate {
  rateId: string;
  carrier: string;
  service: string;
  serviceName: string;
  rateCents: number;
  estimatedDays?: number;
}

// Picks the heaviest parcel preset in the cart to produce a single-parcel shipment.
function heaviestPreset(presets: ParcelPreset[]): ParcelPreset {
  const order: ParcelPreset[] = ["LARGE", "MEDIUM", "SMALL"];
  for (const p of order) {
    if (presets.includes(p)) return p;
  }
  return "MEDIUM";
}

export async function getShippingRates(
  destination: ShipToAddress,
  parcelPresets: ParcelPreset[]
): Promise<ShippingRate[]> {
  const preset = heaviestPreset(parcelPresets);
  const dims = getParcelDimensions(preset);

  const shipment = await shippoClient.shipments.create({
    addressFrom: MERCHANT_SHIP_FROM,
    addressTo: {
      name: destination.name,
      street1: destination.street1,
      street2: destination.street2 ?? "",
      city: destination.city,
      state: destination.state,
      zip: destination.zip,
      country: destination.country || "US",
    },
    parcels: [
      {
        length: String(dims.length),
        width: String(dims.width),
        height: String(dims.height),
        distanceUnit: dims.distanceUnit,
        weight: String(dims.weight),
        massUnit: dims.massUnit,
      },
    ],
    async: false,
  });

  if (!Array.isArray(shipment.rates)) return [];

  return shipment.rates
    .filter((r) => r.amount && parseFloat(r.amount) > 0)
    .map((r) => ({
      rateId: r.objectId,
      carrier: r.provider,
      service: r.servicelevel.token ?? "",
      serviceName: `${r.provider} ${r.servicelevel.name ?? ""}`.trim(),
      rateCents: Math.round(parseFloat(r.amountLocal ?? r.amount) * 100),
      estimatedDays: r.estimatedDays,
    }))
    .sort((a, b) => a.rateCents - b.rateCents);
}
