import { describe, it, expect } from "vitest";
import {
  isSellablePhysicalGood,
  isInOnlineSalesCategory,
  deriveAvailability,
  toStoreProductSummary,
} from "@/lib/utils/catalogHelpers";
import type { RawCatalogItem, RawVariation } from "@/lib/square/catalog";
import type { IStoreProductSettings } from "@/lib/models/StoreProductSettings";

const baseVariation: RawVariation = {
  id: "VAR1",
  name: "Regular",
  sku: null,
  ordinal: 0,
  priceCents: 2000,
  variablePricing: false,
  trackInventory: false,
};

const baseItem: RawCatalogItem = {
  id: "ITEM123",
  name: "Test Product",
  isArchived: false,
  productType: "REGULAR",
  categoryNames: ["Art Kits"],
  imageUrls: [],
  variations: [baseVariation],
};

const baseSettings = {
  squareItemId: "ITEM123",
  isOnlineSellable: true,
  parcelPreset: "MEDIUM",
  displayOrder: 0,
} as unknown as IStoreProductSettings;

describe("isSellablePhysicalGood", () => {
  it("returns true for REGULAR non-archived items", () => {
    expect(isSellablePhysicalGood(baseItem)).toBe(true);
  });

  it("returns false for archived items", () => {
    expect(isSellablePhysicalGood({ ...baseItem, isArchived: true })).toBe(false);
  });

  it("returns false for APPOINTMENTS_SERVICE items", () => {
    expect(
      isSellablePhysicalGood({ ...baseItem, productType: "APPOINTMENTS_SERVICE" })
    ).toBe(false);
  });

  it("returns false for LEGACY_SQUARE_ONLINE_SERVICE items", () => {
    expect(
      isSellablePhysicalGood({ ...baseItem, productType: "LEGACY_SQUARE_ONLINE_SERVICE" })
    ).toBe(false);
  });
});

describe("isInOnlineSalesCategory", () => {
  it("returns true for items in an 'Online Sales …' category", () => {
    expect(
      isInOnlineSalesCategory({
        ...baseItem,
        categoryNames: ["Online Sales - Art Kits"],
      })
    ).toBe(true);
  });

  it("matches the prefix case-insensitively", () => {
    expect(
      isInOnlineSalesCategory({
        ...baseItem,
        categoryNames: ["ONLINE SALES - Stickers"],
      })
    ).toBe(true);
    expect(
      isInOnlineSalesCategory({
        ...baseItem,
        categoryNames: ["online sales - art kits"],
      })
    ).toBe(true);
  });

  it("returns true when any of several categories matches", () => {
    expect(
      isInOnlineSalesCategory({
        ...baseItem,
        categoryNames: ["Coastal Creations", "Online Sales - Art Kits"],
      })
    ).toBe(true);
  });

  it("returns false for non-matching categories", () => {
    expect(
      isInOnlineSalesCategory({
        ...baseItem,
        categoryNames: ["Coastal Creations"],
      })
    ).toBe(false);
  });

  it("returns false for items with no categories", () => {
    expect(isInOnlineSalesCategory({ ...baseItem, categoryNames: [] })).toBe(
      false
    );
  });
});

describe("deriveAvailability", () => {
  it("returns available when trackInventory is false (no record = available)", () => {
    const v = { ...baseVariation, trackInventory: false };
    expect(deriveAvailability(v, undefined)).toBe("available");
    expect(deriveAvailability(v, 0)).toBe("available");
  });

  it("returns sold_out when quantity is 0 and trackInventory is true", () => {
    const v = { ...baseVariation, trackInventory: true };
    expect(deriveAvailability(v, 0)).toBe("sold_out");
  });

  it("returns sold_out when no inventory record and trackInventory is true", () => {
    const v = { ...baseVariation, trackInventory: true };
    expect(deriveAvailability(v, undefined)).toBe("sold_out");
  });

  it("returns low_stock when quantity is within threshold", () => {
    const v = { ...baseVariation, trackInventory: true };
    expect(deriveAvailability(v, 2)).toBe("low_stock");
    expect(deriveAvailability(v, 3)).toBe("low_stock");
  });

  it("returns available when quantity is above threshold", () => {
    const v = { ...baseVariation, trackInventory: true };
    expect(deriveAvailability(v, 10)).toBe("available");
  });
});

describe("toStoreProductSummary", () => {
  it("uses settings.slug when provided", () => {
    const settings = {
      ...baseSettings,
      slug: "custom-slug",
    } as unknown as IStoreProductSettings;
    const summary = toStoreProductSummary(baseItem, settings, new Map());
    expect(summary.slug).toBe("custom-slug");
  });

  it("generates slug from name and id when settings.slug is missing", () => {
    const summary = toStoreProductSummary(baseItem, baseSettings, new Map());
    expect(summary.slug).toBe("test-product-ITEM123");
  });

  it("computes priceRange from fixed-price variations", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", priceCents: 2000 },
        { ...baseVariation, id: "V2", priceCents: 5000 },
      ],
    };
    const summary = toStoreProductSummary(item, baseSettings, new Map());
    expect(summary.priceRange).toEqual({ minCents: 2000, maxCents: 5000 });
  });

  it("ignores VARIABLE_PRICING variations (null priceCents) in price range", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", priceCents: 3000, variablePricing: false },
        { ...baseVariation, id: "V2", priceCents: null, variablePricing: true },
      ],
    };
    const summary = toStoreProductSummary(item, baseSettings, new Map());
    expect(summary.priceRange).toEqual({ minCents: 3000, maxCents: 3000 });
  });

  it("rolls up availability to available when any variation is available", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", trackInventory: true },
        { ...baseVariation, id: "V2", trackInventory: false },
      ],
    };
    const stock = new Map([["V1", 0]]);
    const summary = toStoreProductSummary(item, baseSettings, stock);
    expect(summary.availability).toBe("available");
  });

  it("rolls up availability to sold_out when all variations are sold out", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", trackInventory: true },
        { ...baseVariation, id: "V2", trackInventory: true },
      ],
    };
    const stock = new Map<string, number>();
    const summary = toStoreProductSummary(item, baseSettings, stock);
    expect(summary.availability).toBe("sold_out");
  });

  it("skips a sold-out first-ordinal variation when picking defaultVariation", () => {
    // Regression: grid quick-add must not silently pick a sold-out flavor just
    // because it's ordinal 0 — CartProvider refuses to add sold-out variations,
    // so this used to fail with no feedback (see Mini Travel Art Kits in prod).
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", ordinal: 0, trackInventory: true }, // sold out
        { ...baseVariation, id: "V2", ordinal: 1, trackInventory: true }, // in stock
      ],
    };
    const stock = new Map([["V2", 3]]); // V1 absent -> no inventory record -> sold_out
    const summary = toStoreProductSummary(item, baseSettings, stock);
    expect(summary.defaultVariation?.id).toBe("V2");
    expect(summary.defaultVariation?.availability).not.toBe("sold_out");
  });

  it("falls back to the ordinal-first variation when every variation is sold out", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", ordinal: 0, trackInventory: true },
        { ...baseVariation, id: "V2", ordinal: 1, trackInventory: true },
      ],
    };
    const stock = new Map<string, number>();
    const summary = toStoreProductSummary(item, baseSettings, stock);
    expect(summary.defaultVariation?.id).toBe("V1");
    expect(summary.availability).toBe("sold_out");
  });
});
