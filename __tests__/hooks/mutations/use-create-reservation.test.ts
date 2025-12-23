import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCreateReservation } from "@/hooks/mutations/use-create-reservation";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockReservation } from "../../utils/mock-data";

describe("useCreateReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create reservation successfully", async () => {
    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useCreateReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        eventName: "Walk-In Session",
        eventType: "reservation",
        pricePerDayPerParticipant: 25,
        dates: {
          startDate: "2024-12-01",
          endDate: "2024-12-31",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReservation);
  });

  it("should call correct API endpoint with POST", async () => {
    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useCreateReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        eventName: "Test Reservation",
        eventType: "reservation",
        pricePerDayPerParticipant: 30,
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reservations",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Validation failed" }, false);

    const { result } = renderHook(() => useCreateReservation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        eventName: "",
        eventType: "reservation",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
