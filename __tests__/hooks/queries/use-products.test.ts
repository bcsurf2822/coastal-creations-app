import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProducts, useProduct } from "@/hooks/queries/use-products";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import type { StoreProduct, StoreProductSummary } from "@/lib/types/storeTypes";

const mockSummary: StoreProductSummary = {
  squareItemId: "ITEM1",
  name: "Animals Watercolor Workbook",
  slug: "animals-watercolor-workbook-ITEM1",
  primaryImage: undefined,
  categoryName: "Workbooks",
  priceRange: { minCents: 2400, maxCents: 2400 },
  hasMultipleVariations: false,
  availability: "available",
  displayOrder: 0,
};

const mockDetail: StoreProduct = {
  ...mockSummary,
  description: "A watercolor workbook.",
  images: [],
  variations: [
    {
      id: "VAR1",
      name: "Standard",
      priceCents: 2400,
      availability: "available",
      ordinal: 0,
    },
  ],
};

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the product list successfully", async () => {
    mockFetch({ success: true, products: [mockSummary] });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([mockSummary]);
    expect(global.fetch).toHaveBeenCalledWith("/api/store/products");
  });

  it("returns an empty array when products array is missing", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("sets isError when the response is not ok", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch products");
  });
});

describe("useProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single product by id", async () => {
    mockFetch({ success: true, product: mockDetail });

    const { result } = renderHook(() => useProduct("ITEM1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDetail);
    expect(global.fetch).toHaveBeenCalledWith("/api/store/products/ITEM1");
  });

  it("is disabled when squareItemId is empty", () => {
    mockFetch({ success: true, product: mockDetail });

    const { result } = renderHook(() => useProduct(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sets isError when fetch fails", async () => {
    mockFetch({ error: "Not found" }, false);

    const { result } = renderHook(() => useProduct("ITEM_BAD"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch product");
  });
});
