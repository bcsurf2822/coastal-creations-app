import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrivateEvent } from "@/hooks/queries/use-private-event";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockPrivateEvent } from "../../utils/mock-data";

describe("usePrivateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single private event successfully", async () => {
    mockFetch({ success: true, data: mockPrivateEvent });

    const { result } = renderHook(() => usePrivateEvent("test-private-event-id-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPrivateEvent);
    expect(result.current.data?._id).toBe("test-private-event-id-1");
  });

  it("should call correct API endpoint", async () => {
    mockFetch({ success: true, data: mockPrivateEvent });

    renderHook(() => usePrivateEvent("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/private-events/abc123");
    });
  });

  it("should not fetch when eventId is null", async () => {
    mockFetch({ success: true, data: mockPrivateEvent });

    const { result } = renderHook(() => usePrivateEvent(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", async () => {
    mockFetch({ success: true, data: mockPrivateEvent });

    // Hook takes enabled as second parameter
    const { result } = renderHook(() => usePrivateEvent("test-id", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Not found" }, false);

    const { result } = renderHook(() => usePrivateEvent("invalid-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch private event");
  });

  it("should handle private event not found", async () => {
    mockFetch({ success: true, data: null });

    const { result } = renderHook(() => usePrivateEvent("non-existent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Private event not found");
  });
});
