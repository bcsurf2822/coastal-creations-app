import { Shippo } from "shippo";
import type { ParcelPreset } from "@/lib/models/StoreProductSettings";
import { getParcelDimensions } from "@/lib/utils/parcelHelpers";

const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY ?? "",
});

// Coastal Creations Studio — the ship-from address for all outbound orders.
const STUDIO_ADDRESS = {
  name: "Coastal Creations Studio",
  street1: "411 E 8th Street",
  city: "Ocean City",
  state: "NJ",
  zip: "08226",
  country: "US",
  phone: "",
  email: "ashley@coastalcreationsstudio.com",
};

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
    addressFrom: STUDIO_ADDRESS,
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
