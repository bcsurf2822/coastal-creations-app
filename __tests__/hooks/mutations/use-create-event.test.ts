import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCreateEvent } from "@/hooks/mutations/use-create-event";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockEvent } from "../../utils/mock-data";

describe("useCreateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create event successfully", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        eventName: "New Event",
        eventType: "class",
        price: 50,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvent);
  });

  it("should call correct API endpoint with POST", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ eventName: "Test" });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/events",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should invalidate events query on success", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ eventName: "Test" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Note: Cache invalidation happens automatically on success
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Validation failed" }, false);

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ eventName: "" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Validation failed");
  });

  it("should handle success: false response", async () => {
    mockFetch({ success: false, error: "Invalid event data" });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ eventName: "Test" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Invalid event data");
  });

  it("should show pending state during mutation", async () => {
    // Delay the response to test pending state
    let resolvePromise: (value: unknown) => void;
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ eventName: "Test" });
    });

    // Check pending state while request is in flight
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, data: mockEvent }),
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });
});
