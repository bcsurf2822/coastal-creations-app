import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useDeleteReservation } from "@/hooks/mutations/use-delete-reservation";
import { createWrapper, createTestQueryClient, createWrapperWithClient, mockFetch } from "../../utils/test-utils";

describe("useDeleteReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete reservation successfully", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useDeleteReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("test-reservation-id-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should call correct API endpoint with DELETE", async () => {
    mockFetch({ success: true });

    const { result } = renderHook(() => useDeleteReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("abc123");
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reservations?id=abc123",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  it("should invalidate reservations query on success", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockFetch({ success: true });

    const { result } = renderHook(() => useDeleteReservation(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      result.current.mutate("test-id");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["reservations"] });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Reservation not found" }, false);

    const { result } = renderHook(() => useDeleteReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("invalid-id");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Reservation not found");
  });

  it("should handle delete with active bookings error", async () => {
    mockFetch({ success: false, error: "Cannot delete reservation with active bookings" });

    const { result } = renderHook(() => useDeleteReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate("test-id");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Cannot delete reservation with active bookings");
  });
});
