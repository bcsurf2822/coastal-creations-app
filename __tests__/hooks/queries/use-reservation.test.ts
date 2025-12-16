import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReservation } from "@/hooks/queries/use-reservation";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockReservation } from "../../utils/mock-data";

describe("useReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single reservation successfully", async () => {
    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useReservation("test-reservation-id-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReservation);
    expect(result.current.data?._id).toBe("test-reservation-id-1");
  });

  it("should call correct API endpoint", async () => {
    mockFetch({ success: true, data: mockReservation });

    renderHook(() => useReservation("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reservations/abc123");
    });
  });

  it("should not fetch when reservationId is null", async () => {
    mockFetch({ success: true, data: mockReservation });

    const { result } = renderHook(() => useReservation(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", async () => {
    mockFetch({ success: true, data: mockReservation });

    // Hook takes enabled as second parameter
    const { result } = renderHook(() => useReservation("test-id", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Not found" }, false);

    const { result } = renderHook(() => useReservation("invalid-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch reservation");
  });

  it("should handle reservation not found", async () => {
    mockFetch({ success: true, data: null });

    const { result } = renderHook(() => useReservation("non-existent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Reservation not found");
  });
});
