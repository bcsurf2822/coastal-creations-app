import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockPaymentConfig } from "../../utils/mock-data";

describe("usePaymentConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch payment config successfully", async () => {
    // API returns config directly, not wrapped in { success, data }
    mockFetch(mockPaymentConfig);

    const { result } = renderHook(() => usePaymentConfig(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPaymentConfig);
    expect(result.current.data?.applicationId).toBe("sq-app-id-123");
    expect(result.current.data?.locationId).toBe("sq-location-id-456");
  });

  it("should call correct API endpoint", async () => {
    mockFetch(mockPaymentConfig);

    renderHook(() => usePaymentConfig(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/payment-config");
    });
  });

  it("should handle enabled option", async () => {
    mockFetch(mockPaymentConfig);

    // Hook takes enabled as direct boolean parameter
    const { result } = renderHook(() => usePaymentConfig(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => usePaymentConfig(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch payment configuration");
  });
});
