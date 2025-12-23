import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProcessRefund } from "@/hooks/mutations/use-process-refund";
import { createWrapper, createTestQueryClient, createWrapperWithClient, mockFetch } from "../../utils/test-utils";

describe("useProcessRefund", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process refund successfully", async () => {
    const refundResponse = {
      success: true,
      data: {
        refundId: "refund-123",
        status: "completed",
        amount: 50,
      },
    };
    mockFetch(refundResponse);

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "customer-123",
        refundAmount: 50,
        reason: "Customer request",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data?.refundId).toBe("refund-123");
  });

  it("should call correct API endpoint with POST", async () => {
    mockFetch({ success: true, data: { refundId: "123" } });

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "abc123",
        refundAmount: 25,
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/refunds",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should include refund reason in request body", async () => {
    mockFetch({ success: true, data: { refundId: "123" } });

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "customer-123",
        refundAmount: 50,
        reason: "Duplicate charge",
      });
    });

    await waitFor(() => {
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.reason).toBe("Duplicate charge");
    });
  });

  it("should invalidate customers query on success", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockFetch({ success: true, data: { refundId: "123" } });

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "customer-123",
        refundAmount: 50,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["customers"] });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Refund failed" }, false);

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "customer-123",
        refundAmount: 50,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Refund failed");
  });

  it("should handle insufficient funds error", async () => {
    mockFetch({ success: false, error: "Insufficient funds for refund" });

    const { result } = renderHook(() => useProcessRefund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: "customer-123",
        refundAmount: 1000,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Insufficient funds for refund");
  });
});
