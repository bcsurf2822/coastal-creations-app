import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks for the authoritative sources storePricing reads from ---
const listCatalogItems = vi.fn();
vi.mock("@/lib/square/catalog", () => ({
  listCatalogItems: (...args: unknown[]) => listCatalogItems(...args),
}));

const getShippingRates = vi.fn();
vi.mock("@/lib/shippo/rates", () => ({
  getShippingRates: (...args: unknown[]) => getShippingRates(...args),
}));

const settingsSelect = vi.fn();
vi.mock("@/lib/models/StoreProductSettings", () => ({
  default: { find: () => ({ select: settingsSelect }) },
  DEFAULT_PARCEL_PRESET: "MEDIUM",
}));

import {
  priceCartFromCatalog,
  resolveShippingRate,
  PriceIntegrityError,
} from "@/lib/checkout/storePricing";
import type { CartItem } from "@/lib/types/cartTypes";
import type { ShippingRate } from "@/lib/shippo/rates";

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    squareCatalogItemId: "ITEM1",
    squareVariationId: "VAR1",
    productName: "Art Kit",
    variationName: "Default",
    priceCents: 1, // deliberately tampered-low; must be ignored
    slug: "art-kit",
    quantity: 2,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("priceCartFromCatalog", () => {
  it("recomputes the subtotal from catalog prices, ignoring client priceCents", async () => {
    listCatalogItems.mockResolvedValue([
      {
        id: "ITEM1",
        name: "Art Kit",
        variations: [
          { id: "VAR1", name: "Default", priceCents: 5000, variablePricing: false },
        ],
      },
    ]);

    const result = await priceCartFromCatalog([cartItem({ quantity: 2 })]);

    // 2 x $50.00 from the catalog — NOT 2 x the tampered $0.01.
    expect(result.subtotalCents).toBe(10000);
    expect(result.items[0].unitPriceCents).toBe(5000);
    expect(result.items[0].quantity).toBe(2);
  });

  it("rejects an item whose variation is no longer in the catalog", async () => {
    listCatalogItems.mockResolvedValue([
      { id: "ITEM1", name: "Art Kit", variations: [] },
    ]);
    await expect(priceCartFromCatalog([cartItem()])).rejects.toBeInstanceOf(
      PriceIntegrityError
    );
  });

  it("rejects a variable-priced variation (no authoritative price)", async () => {
    listCatalogItems.mockResolvedValue([
      {
        id: "ITEM1",
        name: "Art Kit",
        variations: [
          { id: "VAR1", name: "Default", priceCents: null, variablePricing: true },
        ],
      },
    ]);
    await expect(priceCartFromCatalog([cartItem()])).rejects.toBeInstanceOf(
      PriceIntegrityError
    );
  });

  it("rejects a tampered (non-integer / out-of-range) quantity", async () => {
    listCatalogItems.mockResolvedValue([
      {
        id: "ITEM1",
        name: "Art Kit",
        variations: [
          { id: "VAR1", name: "Default", priceCents: 5000, variablePricing: false },
        ],
      },
    ]);
    await expect(
      priceCartFromCatalog([cartItem({ quantity: 0 })])
    ).rejects.toBeInstanceOf(PriceIntegrityError);
    await expect(
      priceCartFromCatalog([cartItem({ quantity: 1.5 })])
    ).rejects.toBeInstanceOf(PriceIntegrityError);
  });

  it("rejects an empty cart", async () => {
    await expect(priceCartFromCatalog([])).rejects.toBeInstanceOf(
      PriceIntegrityError
    );
  });
});

describe("resolveShippingRate", () => {
  const destination = {
    name: "A B",
    street1: "1 Main",
    city: "Town",
    state: "NJ",
    zip: "08226",
    country: "US",
  };

  const clientRate: ShippingRate = {
    rateId: "STALE_CLIENT_ID",
    carrier: "USPS",
    service: "usps_priority",
    serviceName: "USPS Priority",
    rateCents: 1, // tampered-low; must be ignored
  };

  it("returns the fresh rate matched by carrier+service and ignores client rateCents/rateId", async () => {
    settingsSelect.mockResolvedValue([
      { squareItemId: "ITEM1", parcelPreset: "MEDIUM" },
    ]);
    getShippingRates.mockResolvedValue([
      {
        rateId: "FRESH_ID",
        carrier: "USPS",
        service: "usps_priority",
        serviceName: "USPS Priority",
        rateCents: 899,
      },
    ]);

    const rate = await resolveShippingRate(destination, [cartItem()], clientRate);

    expect(rate.rateId).toBe("FRESH_ID");
    expect(rate.rateCents).toBe(899);
  });

  it("throws when the chosen service is no longer offered in the fresh quote", async () => {
    settingsSelect.mockResolvedValue([
      { squareItemId: "ITEM1", parcelPreset: "MEDIUM" },
    ]);
    getShippingRates.mockResolvedValue([
      {
        rateId: "FRESH_ID",
        carrier: "UPS",
        service: "ups_ground",
        serviceName: "UPS Ground",
        rateCents: 1200,
      },
    ]);

    await expect(
      resolveShippingRate(destination, [cartItem()], clientRate)
    ).rejects.toBeInstanceOf(PriceIntegrityError);
  });
});
