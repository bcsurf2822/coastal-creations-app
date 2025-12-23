import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGallery } from "@/hooks/queries/use-gallery";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockGalleryItems } from "../../utils/mock-data";

describe("useGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all gallery images successfully", async () => {
    mockFetch({ success: true, data: mockGalleryItems });

    const { result } = renderHook(() => useGallery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGalleryItems);
    expect(result.current.data?.length).toBe(2);
  });

  it("should fetch gallery with destination filter", async () => {
    const filteredItems = mockGalleryItems.filter(
      i => i.destinations?.includes("adult-class")
    );
    mockFetch({ success: true, data: filteredItems });

    renderHook(() => useGallery({ destination: "adult-class" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/gallery?destination=adult-class");
    });
  });

  it("should call base URL when no destination", async () => {
    mockFetch({ success: true, data: mockGalleryItems });

    renderHook(() => useGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/gallery");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, data: mockGalleryItems });

    const { result } = renderHook(() => useGallery({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch gallery images");
  });

  it("should return empty array when no images", async () => {
    mockFetch({ success: true, data: [] });

    const { result } = renderHook(() => useGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
