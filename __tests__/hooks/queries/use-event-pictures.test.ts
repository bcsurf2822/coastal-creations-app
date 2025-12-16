import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventPictures } from "@/hooks/queries/use-event-pictures";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockEventPictures } from "../../utils/mock-data";

describe("useEventPictures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch event pictures successfully", async () => {
    // API can return array directly or { data: [...] }
    mockFetch(mockEventPictures);

    const { result } = renderHook(() => useEventPictures(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEventPictures);
  });

  it("should call correct API endpoint", async () => {
    mockFetch(mockEventPictures);

    renderHook(() => useEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/eventPictures");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch(mockEventPictures);

    // Hook takes enabled as direct boolean parameter
    const { result } = renderHook(() => useEventPictures(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch event pictures");
  });

  it("should return empty array when no pictures", async () => {
    mockFetch([]);

    const { result } = renderHook(() => useEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
