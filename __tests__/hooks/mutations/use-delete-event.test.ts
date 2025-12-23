import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useDeleteEvent } from "@/hooks/mutations/use-delete-event";
import { createWrapper, mockFetch } from "../../utils/test-utils";

describe("useDeleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete event successfully", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("test-event-id-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should call correct API endpoint with DELETE", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("abc123");
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/events?id=abc123",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Event not found" }, false);

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("invalid-id");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("should handle success: false response", async () => {
    mockFetch({ success: false, error: "Cannot delete event with bookings" });

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("test-id");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Cannot delete event with bookings");
  });
});
