import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReservations } from "@/hooks/queries/use-reservations";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockReservations } from "../../utils/mock-data";

describe("useReservations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all reservations successfully", async () => {
    mockFetch({ success: true, reservations: mockReservations });

    const { result } = renderHook(() => useReservations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReservations);
    expect(result.current.data?.length).toBe(2);
  });

  it("should fetch reservations with type filter", async () => {
    mockFetch({ success: true, reservations: mockReservations });

    renderHook(() => useReservations({ type: "walk-in" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("type=walk-in")
      );
    });
  });

  it("should fetch reservations with date range", async () => {
    mockFetch({ success: true, reservations: mockReservations });

    renderHook(
      () => useReservations({ fromDate: "2024-12-01", toDate: "2024-12-31" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain("fromDate=2024-12-01");
      expect(fetchCall).toContain("toDate=2024-12-31");
    });
  });

  it("should call base URL when no filters", async () => {
    mockFetch({ success: true, reservations: mockReservations });

    renderHook(() => useReservations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reservations");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, reservations: mockReservations });

    const { result } = renderHook(
      () => useReservations({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useReservations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch reservations");
  });

  it("should return empty array when no reservations", async () => {
    mockFetch({ success: true, reservations: [] });

    const { result } = renderHook(() => useReservations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
