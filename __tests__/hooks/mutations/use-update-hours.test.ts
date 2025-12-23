import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpdateHours } from "@/hooks/mutations/use-update-hours";
import { createWrapper, createTestQueryClient, createWrapperWithClient, mockFetch } from "../../utils/test-utils";
import { mockHoursData } from "../../utils/mock-data";

describe("useUpdateHours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update hours successfully", async () => {
    const updatedHours = {
      ...mockHoursData,
      monday: { isClosed: false, hours: { open: "9:00 AM", close: "7:00 PM" } },
    };
    mockFetch({ success: true, data: updatedHours });

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedHours);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.monday.hours?.open).toBe("9:00 AM");
  });

  it("should call correct API endpoint with PUT", async () => {
    mockFetch({ success: true, data: mockHoursData });

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockHoursData);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/hours",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should invalidate hours query on success", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockFetch({ success: true, data: mockHoursData });

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapperWithClient(queryClient),
    });

    await act(async () => {
      result.current.mutate(mockHoursData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["hours"] });
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Update failed" }, false);

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockHoursData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Update failed");
  });

  it("should handle validation error", async () => {
    mockFetch({ success: false, error: "Invalid time format" });

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        ...mockHoursData,
        monday: { isClosed: false, hours: { open: "invalid", close: "invalid" } },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Invalid time format");
  });

  it("should send complete hours data in request body", async () => {
    mockFetch({ success: true, data: mockHoursData });

    const { result } = renderHook(() => useUpdateHours(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockHoursData);
    });

    await waitFor(() => {
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.monday).toBeDefined();
      expect(body.tuesday).toBeDefined();
      expect(body.wednesday).toBeDefined();
      expect(body.thursday).toBeDefined();
      expect(body.friday).toBeDefined();
      expect(body.saturday).toBeDefined();
      expect(body.sunday).toBeDefined();
    });
  });
});
