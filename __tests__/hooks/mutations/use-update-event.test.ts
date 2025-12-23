import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpdateEvent } from "@/hooks/mutations/use-update-event";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockEvent } from "../../utils/mock-data";

describe("useUpdateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update event successfully", async () => {
    const updatedEvent = { ...mockEvent, eventName: "Updated Event" };
    mockFetch({ success: true, data: updatedEvent });

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "test-event-id-1",
        data: { eventName: "Updated Event" },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.eventName).toBe("Updated Event");
  });

  it("should call correct API endpoint with PUT", async () => {
    mockFetch({ success: true, data: mockEvent });

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "abc123",
        data: { price: 60 },
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/events/abc123",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Event not found" }, false);

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "invalid-id",
        data: { eventName: "Test" },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("should handle success: false response", async () => {
    mockFetch({ success: false, error: "Invalid update" });

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "test-id",
        data: { eventName: "" },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Invalid update");
  });
});
