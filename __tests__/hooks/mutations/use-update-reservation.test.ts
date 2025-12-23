import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpdateReservation } from "@/hooks/mutations/use-update-reservation";
import { createWrapper, createTestQueryClient, createWrapperWithClient, mockFetch } from "../../utils/test-utils";
import { mockReservation } from "../../utils/mock-data";

describe("useUpdateReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update reservation successfully", async () => {
    const updatedReservation = { ...mockReservation, pricePerDayPerParticipant: 30 };
    mockFetch({ success: true, data: updatedReservation });

    const { result } = renderHook(() => useUpdateReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "test-reservation-id-1",
        data: { pricePerDayPerParticipant: 30 },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pricePerDayPerParticipant).toBe(30);
  });

  it("should call correct API endpoint with PUT", async () => {
    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useUpdateReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: "abc123",
        data: { eventName: "Updated Name" },
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reservations/abc123",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should invalidate reservations and single reservation queries on success", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useUpdateReservation(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        id: "test-id",
        data: { eventName: "Updated" },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["reservations"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["reservation", "test-id"] });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Reservation not found" }, false);

    const { result } = renderHook(() => useUpdateReservation(), {
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

    expect(result.current.error?.message).toBe("Reservation not found");
  });
});
