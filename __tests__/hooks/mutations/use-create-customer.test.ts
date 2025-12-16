import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCreateCustomer } from "@/hooks/mutations/use-create-customer";
import { createWrapper, mockFetch } from "../../utils/test-utils";
import { mockCustomer } from "../../utils/mock-data";

describe("useCreateCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create customer booking successfully", async () => {
    mockFetch({ success: true, data: mockCustomer });

    const { result } = renderHook(() => useCreateCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        event: "test-event-id-1",
        eventType: "Event",
        quantity: 2,
        total: 90,
        isSigningUpForSelf: true,
        participants: [{ firstName: "John", lastName: "Doe" }],
        billingInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "555-1234",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCustomer);
  });

  it("should call correct API endpoint with POST", async () => {
    mockFetch({ success: true, data: mockCustomer });

    const { result } = renderHook(() => useCreateCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        event: "test-id",
        eventType: "Event",
        quantity: 1,
        billingInfo: { email: "test@test.com" },
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/customer",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Payment failed" }, false);

    const { result } = renderHook(() => useCreateCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        event: "test-id",
        eventType: "Event",
        quantity: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("should handle validation error", async () => {
    mockFetch({ success: false, error: "Email is required" });

    const { result } = renderHook(() => useCreateCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        event: "test-id",
        eventType: "Event",
        quantity: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Email is required");
  });
});
