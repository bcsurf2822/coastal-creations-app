import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePaymentErrors } from "@/hooks/queries/use-payment-errors";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockPaymentErrors } from "../../utils/mock-data";

describe("usePaymentErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch payment errors successfully", async () => {
    mockFetch({ success: true, paymentErrors: mockPaymentErrors, count: 2 });

    const { result } = renderHook(() => usePaymentErrors(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPaymentErrors);
    expect(result.current.data?.length).toBe(2);
  });

  it("should call base URL by default", async () => {
    mockFetch({ success: true, paymentErrors: mockPaymentErrors, count: 2 });

    renderHook(() => usePaymentErrors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/payment-errors");
    });
  });

  it("should fetch with custom limit", async () => {
    mockFetch({ success: true, paymentErrors: mockPaymentErrors, count: 2 });

    renderHook(() => usePaymentErrors({ limit: 100 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=100")
      );
    });
  });

  it("should fetch with eventId filter", async () => {
    mockFetch({ success: true, paymentErrors: [mockPaymentErrors[0]], count: 1 });

    renderHook(() => usePaymentErrors({ eventId: "test-event-id-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("eventId=test-event-id-1")
      );
    });
  });

  it("should fetch with customerEmail filter", async () => {
    mockFetch({ success: true, paymentErrors: [mockPaymentErrors[0]], count: 1 });

    renderHook(() => usePaymentErrors({ customerEmail: "test@example.com" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("customerEmail=test%40example.com")
      );
    });
  });

  it("should handle enabled option", async () => {
    mockFetch({ success: true, paymentErrors: mockPaymentErrors, count: 2 });

    const { result } = renderHook(() => usePaymentErrors({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => usePaymentErrors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch payment errors");
  });

  it("should return empty array when no errors", async () => {
    mockFetch({ success: true, paymentErrors: [], count: 0 });

    const { result } = renderHook(() => usePaymentErrors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
