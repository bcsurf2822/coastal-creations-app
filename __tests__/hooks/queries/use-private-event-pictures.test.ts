import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrivateEventPictures } from "@/hooks/queries/use-private-event-pictures";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockPrivateEventPictures } from "../../utils/mock-data";

describe("usePrivateEventPictures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch private event pictures successfully", async () => {
    // API can return array directly
    mockFetch(mockPrivateEventPictures);

    const { result } = renderHook(() => usePrivateEventPictures(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPrivateEventPictures);
  });

  it("should call correct API endpoint", async () => {
    mockFetch(mockPrivateEventPictures);

    renderHook(() => usePrivateEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/privateEventPictures");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch(mockPrivateEventPictures);

    // Hook takes enabled as direct boolean parameter
    const { result } = renderHook(() => usePrivateEventPictures(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => usePrivateEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch private event pictures");
  });

  it("should return empty array when no pictures", async () => {
    mockFetch([]);

    const { result } = renderHook(() => usePrivateEventPictures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
