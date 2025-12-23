import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEvents } from "@/hooks/queries/use-events";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockEvents } from "../../utils/mock-data";

describe("useEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all events successfully", async () => {
    mockFetch({ success: true, events: mockEvents });

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvents);
    expect(result.current.data?.length).toBe(3);
  });

  it("should fetch events with type filter", async () => {
    const campEvents = mockEvents.filter(e => e.eventType === "camp");
    mockFetch({ success: true, events: campEvents });

    const { result } = renderHook(() => useEvents({ type: "camp" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/events?type=camp");
    expect(result.current.data).toEqual(campEvents);
  });

  it("should call correct URL without type filter", async () => {
    mockFetch({ success: true, events: mockEvents });

    renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/events");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, events: mockEvents });

    const { result } = renderHook(() => useEvents({ enabled: false }), {
      wrapper: createWrapper(),
    });

    // Query should not run when disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch events");
  });

  it("should return empty array when no events", async () => {
    mockFetch({ success: true, events: [] });

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("should handle missing events array gracefully", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
