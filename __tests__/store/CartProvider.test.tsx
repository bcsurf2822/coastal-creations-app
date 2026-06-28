import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart } from "@/components/store/CartProvider";
import type { StoreProduct, StoreProductVariation } from "@/lib/types/storeTypes";

const mockVariation: StoreProductVariation = {
  id: "VAR1",
  name: "Standard",
  priceCents: 2400,
  availability: "available",
  ordinal: 0,
};

const mockVariationLimited: StoreProductVariation = {
  id: "VAR2",
  name: "Limited",
  priceCents: 3000,
  availability: "low_stock",
  inStockQuantity: 2,
  ordinal: 1,
};

const mockVariationSoldOut: StoreProductVariation = {
  id: "VAR3",
  name: "Sold Out",
  priceCents: 1500,
  availability: "sold_out",
  ordinal: 2,
};

const mockProduct: StoreProduct = {
  squareItemId: "ITEM1",
  name: "Animals Watercolor Workbook",
  slug: "animals-watercolor-workbook-ITEM1",
  priceRange: { minCents: 2400, maxCents: 2400 },
  hasMultipleVariations: false,
  availability: "available",
  availabilityLabel: null,
  displayOrder: 0,
  images: [],
  variations: [mockVariation],
};

function createWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CartProvider>{children}</CartProvider>;
  };
}

describe("CartProvider — cart operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotalCents).toBe(0);
  });

  it("addItem creates a new CartItem correctly", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.squareCatalogItemId).toBe("ITEM1");
    expect(item.squareVariationId).toBe("VAR1");
    expect(item.productName).toBe("Animals Watercolor Workbook");
    expect(item.variationName).toBe("Standard");
    expect(item.priceCents).toBe(2400);
    expect(item.slug).toBe("animals-watercolor-workbook-ITEM1");
    expect(item.quantity).toBe(1);
    expect(item.maxQuantity).toBeUndefined();
  });

  it("addItem increments quantity if variation already in cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
      result.current.addItem(mockProduct, mockVariation);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("addItem does not add sold_out variations", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariationSoldOut);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("addItem clamps to maxQuantity when incrementing", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariationLimited);
      result.current.addItem(mockProduct, mockVariationLimited);
      result.current.addItem(mockProduct, mockVariationLimited); // should be clamped at 2
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].maxQuantity).toBe(2);
  });

  it("removeItem removes the correct item", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    act(() => {
      result.current.removeItem("VAR1");
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("updateQuantity updates correctly", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    act(() => {
      result.current.updateQuantity("VAR1", 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it("updateQuantity clamps to maxQuantity", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariationLimited);
    });

    act(() => {
      result.current.updateQuantity("VAR2", 10);
    });

    expect(result.current.items[0].quantity).toBe(2);
  });

  it("updateQuantity clamps minimum to 1", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    act(() => {
      result.current.updateQuantity("VAR1", 0);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });

  it("clearCart empties the cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("totalItems sums all quantities", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation, 3);
      result.current.addItem(mockProduct, mockVariationLimited, 2);
    });

    expect(result.current.totalItems).toBe(5);
  });

  it("subtotalCents computes priceCents × quantity correctly", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation, 2); // 2400 × 2 = 4800
      result.current.addItem(mockProduct, mockVariationLimited, 1); // 3000 × 1 = 3000
    });

    expect(result.current.subtotalCents).toBe(7800);
  });
});

describe("CartProvider — localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists cart to localStorage when items change", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem(mockProduct, mockVariation);
    });

    const stored = localStorage.getItem("cc_cart");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].squareVariationId).toBe("VAR1");
  });

  it("hydrates cart from localStorage on mount", () => {
    const savedItems = [
      {
        squareCatalogItemId: "ITEM1",
        squareVariationId: "VAR1",
        productName: "Animals Watercolor Workbook",
        variationName: "Standard",
        priceCents: 2400,
        slug: "animals-watercolor-workbook-ITEM1",
        quantity: 3,
      },
    ];
    localStorage.setItem("cc_cart", JSON.stringify(savedItems));

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    // Wait for the mount effect
    act(() => {});

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("cc_cart", "not-valid-json{{{");

    expect(() => {
      renderHook(() => useCart(), {
        wrapper: createWrapper(),
      });
    }).not.toThrow();
  });
});
