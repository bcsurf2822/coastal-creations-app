import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEvent } from "@/hooks/queries/use-event";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockEvent } from "../../utils/mock-data";

describe("useEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single event successfully", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useEvent("test-event-id-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvent);
    expect(result.current.data?._id).toBe("test-event-id-1");
  });

  it("should call correct API endpoint", async () => {
    mockFetch({ success: true, data: mockEvent });

    renderHook(() => useEvent("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/event/abc123");
    });
  });

  it("should handle event response shape", async () => {
    // Some endpoints return { event } instead of { data }
    mockFetch({ success: true, event: mockEvent });

    const { result } = renderHook(() => useEvent("test-event-id-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvent);
  });

  it("should not fetch when eventId is null", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useEvent(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useEvent("test-id", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Not found" }, false);

    const { result } = renderHook(() => useEvent("invalid-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch event");
  });

  it("should handle event not found", async () => {
    mockFetch({ success: true, data: null });

    const { result } = renderHook(() => useEvent("non-existent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Event not found");
  });
});
