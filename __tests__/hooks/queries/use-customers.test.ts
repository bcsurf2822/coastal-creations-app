import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCustomers } from "@/hooks/queries/use-customers";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockCustomers } from "../../utils/mock-data";

describe("useCustomers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all customers successfully", async () => {
    mockFetch({ success: true, data: mockCustomers });

    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCustomers);
    expect(result.current.data?.length).toBe(2);
  });

  it("should fetch customers filtered by eventId", async () => {
    mockFetch({ success: true, data: [mockCustomers[0]] });

    const { result } = renderHook(
      () => useCustomers({ eventId: "test-event-id-1" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("eventId=test-event-id-1")
    );
  });

  it("should fetch customers filtered by eventType", async () => {
    mockFetch({ success: true, data: mockCustomers });

    renderHook(
      () => useCustomers({ eventType: "Event" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("eventType=Event")
      );
    });
  });

  it("should fetch customers with combined filters", async () => {
    mockFetch({ success: true, data: [mockCustomers[0]] });

    renderHook(
      () => useCustomers({ eventId: "abc", eventType: "Reservation" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain("eventId=abc");
      expect(fetchCall).toContain("eventType=Reservation");
    });
  });

  it("should call base URL when no filters", async () => {
    mockFetch({ success: true, data: mockCustomers });

    renderHook(() => useCustomers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/customer");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, data: mockCustomers });

    const { result } = renderHook(
      () => useCustomers({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch customers");
  });

  it("should return empty array when no customers", async () => {
    mockFetch({ success: true, data: [] });

    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
