import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrivateEvents } from "@/hooks/queries/use-private-events";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockPrivateEvents } from "../../utils/mock-data";

describe("usePrivateEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all private events successfully", async () => {
    // API returns privateEvents, not data
    mockFetch({ success: true, privateEvents: mockPrivateEvents });

    const { result } = renderHook(() => usePrivateEvents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPrivateEvents);
    expect(result.current.data?.length).toBe(2);
  });

  it("should call correct API endpoint", async () => {
    mockFetch({ success: true, privateEvents: mockPrivateEvents });

    renderHook(() => usePrivateEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/private-events");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, privateEvents: mockPrivateEvents });

    // Hook takes enabled as direct boolean parameter
    const { result } = renderHook(() => usePrivateEvents(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => usePrivateEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch private events");
  });

  it("should return empty array when no private events", async () => {
    mockFetch({ success: true, privateEvents: [] });

    const { result } = renderHook(() => usePrivateEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
