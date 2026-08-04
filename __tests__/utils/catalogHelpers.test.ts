import { describe, it, expect } from "vitest";
import {
  isSellablePhysicalGood,
  isInOnlineSalesCategory,
  deriveAvailability,
  toStoreProductSummary,
  toStoreProductSummaries,
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
  imageUrls: [],
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

  it("labels remaining stock from defaultVariation, not the sum across all flavors", () => {
    // Regression: "Mini Travel Art Kits" in prod showed "Only 3 remaining" (3
    // different flavors with 1 unit each) but quick-add always adds ONE specific
    // flavor (defaultVariation), which only had 1 unit — the badge overpromised
    // what the button could actually deliver.
    const item: RawCatalogItem = {
      ...baseItem,
      variations: [
        { ...baseVariation, id: "V1", ordinal: 0, trackInventory: true }, // sold out
        { ...baseVariation, id: "V2", ordinal: 1, trackInventory: true }, // 1 left
        { ...baseVariation, id: "V3", ordinal: 2, trackInventory: true }, // 1 left
        { ...baseVariation, id: "V4", ordinal: 3, trackInventory: true }, // 1 left
      ],
    };
    const stock = new Map([
      ["V2", 1],
      ["V3", 1],
      ["V4", 1],
    ]); // V1 absent -> sold_out; total across all flavors = 3
    const summary = toStoreProductSummary(item, baseSettings, stock);
    expect(summary.defaultVariation?.id).toBe("V2");
    expect(summary.availabilityLabel).toBe("Only 1 remaining");
  });
});

describe("toStoreProductSummaries", () => {
  it("returns a single summary, unchanged, for a single-variation item", () => {
    const summaries = toStoreProductSummaries(baseItem, baseSettings, new Map());
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toEqual(toStoreProductSummary(baseItem, baseSettings, new Map()));
  });

  it("returns one card per variation for a multi-variation item, each independently sellable", () => {
    // Mirrors the real "Mini Travel Art Kits" prod bug: 9 flavors, only a few
    // in stock. The old single-card-with-a-hidden-default behavior meant a
    // shopper could only ever see/buy whichever flavor happened to be picked
    // as the default — the others were invisible on the grid.
    const item: RawCatalogItem = {
      ...baseItem,
      name: "Mini Travel Art Kits",
      variations: [
        { ...baseVariation, id: "UNICORN", name: "Mini Unicorn Art Kit", ordinal: 0, trackInventory: true }, // sold out
        { ...baseVariation, id: "LIZARD", name: "Mini Lizard Art Kit", ordinal: 4, trackInventory: true, priceCents: 2500 },
        { ...baseVariation, id: "BEACH", name: "Mini Beach Art Kit", ordinal: 5, trackInventory: true, priceCents: 2500 },
        { ...baseVariation, id: "GIRAFFE", name: "Mini Giraffe Art Kit", ordinal: 7, trackInventory: true, priceCents: 2500 },
      ],
    };
    const stock = new Map([
      ["LIZARD", 1],
      ["BEACH", 1],
      ["GIRAFFE", 1],
    ]); // UNICORN absent -> sold_out

    const summaries = toStoreProductSummaries(item, baseSettings, stock);

    expect(summaries).toHaveLength(4);
    // Sorted by ordinal, not input order.
    expect(summaries.map((s) => s.name)).toEqual([
      "Mini Unicorn Art Kit",
      "Mini Lizard Art Kit",
      "Mini Beach Art Kit",
      "Mini Giraffe Art Kit",
    ]);
    // Every flavor is its own independently-addable single-variation card —
    // not a rolled-up multi-variation item hiding the others.
    for (const s of summaries) {
      expect(s.hasMultipleVariations).toBe(false);
      expect(s.squareItemId).toBe(item.id);
      expect(s.defaultVariation?.name).toBe(s.name);
    }
    const lizard = summaries.find((s) => s.name === "Mini Lizard Art Kit");
    const unicorn = summaries.find((s) => s.name === "Mini Unicorn Art Kit");
    // 1 unit is within LOW_STOCK_THRESHOLD (5) -> "low_stock", not "sold_out".
    expect(lizard?.availability).toBe("low_stock");
    expect(lizard?.availabilityLabel).toBe("Only 1 remaining");
    expect(lizard?.priceRange).toEqual({ minCents: 2500, maxCents: 2500 });
    expect(unicorn?.availability).toBe("sold_out");
  });

  it("produces a unique, correctly-decodable slug per flavor", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      id: "ITEM123",
      variations: [
        { ...baseVariation, id: "V1", name: "Mini Unicorn Art Kit", ordinal: 0 },
        { ...baseVariation, id: "V2", name: "Mini Dino Art Kit", ordinal: 1 },
      ],
    };
    const summaries = toStoreProductSummaries(item, undefined, new Map());
    const slugs = summaries.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(2);
    expect(slugs).toEqual(["mini-unicorn-art-kit-ITEM123", "mini-dino-art-kit-ITEM123"]);
  });

  it("prefers the variation's own image, falling back to the item's image", () => {
    const item: RawCatalogItem = {
      ...baseItem,
      imageUrls: ["https://example.com/item-fallback.jpg"],
      variations: [
        { ...baseVariation, id: "V1", name: "Has Own Image", imageUrls: ["https://example.com/v1.jpg"] },
        { ...baseVariation, id: "V2", name: "No Own Image", imageUrls: [] },
      ],
    };
    const summaries = toStoreProductSummaries(item, undefined, new Map());
    expect(summaries.find((s) => s.name === "Has Own Image")?.primaryImage?.url).toBe(
      "https://example.com/v1.jpg"
    );
    expect(summaries.find((s) => s.name === "No Own Image")?.primaryImage?.url).toBe(
      "https://example.com/item-fallback.jpg"
    );
  });
});
