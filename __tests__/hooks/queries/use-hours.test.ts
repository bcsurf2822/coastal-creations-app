import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHours } from "@/hooks/queries/use-hours";
import { createWrapper, mockFetch, mockFetchError } from "../../utils/test-utils";
import type { HoursOfOperation } from "@/types/hours";

// Mock hours data matching the HoursOfOperation type
const mockHoursData: HoursOfOperation = {
  _id: "test-hours-id",
  _type: "hoursOfOperation",
  monday: {
    isClosed: false,
    hours: { open: "10:00 AM", close: "6:00 PM" },
  },
  tuesday: {
    isClosed: false,
    hours: { open: "10:00 AM", close: "6:00 PM" },
  },
  wednesday: {
    isClosed: false,
    hours: { open: "10:00 AM", close: "6:00 PM" },
  },
  thursday: {
    isClosed: false,
    hours: { open: "10:00 AM", close: "6:00 PM" },
  },
  friday: {
    isClosed: false,
    hours: { open: "10:00 AM", close: "8:00 PM" },
  },
  saturday: {
    isClosed: false,
    hours: { open: "9:00 AM", close: "5:00 PM" },
  },
  sunday: {
    isClosed: true,
  },
};

describe("useHours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch hours successfully", async () => {
    // Arrange
    mockFetch({ success: true, data: mockHoursData });

    // Act
    const { result } = renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    // Assert - initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert - success state
    expect(result.current.data).toEqual(mockHoursData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle API error (non-ok response)", async () => {
    // Arrange - simulate a 500 error
    mockFetch({ error: "Server error" }, false);

    // Act
    const { result } = renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to fail
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Assert
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Failed to fetch hours of operation");
    expect(result.current.data).toBeUndefined();
  });

  it("should handle API returning success: false", async () => {
    // Arrange - API returns success: false
    mockFetch({ success: false, error: "Invalid data" });

    // Act
    const { result } = renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to fail
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Assert
    expect(result.current.error?.message).toBe("API returned unsuccessful response");
  });

  it("should handle network error", async () => {
    // Arrange - simulate network failure
    mockFetchError("Network error");

    // Act
    const { result } = renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to fail
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Assert
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network error");
  });

  it("should call fetch with correct URL", async () => {
    // Arrange
    mockFetch({ success: true, data: mockHoursData });

    // Act
    renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("/api/hours");
    });
  });

  it("should return correct data structure for business hours", async () => {
    // Arrange
    mockFetch({ success: true, data: mockHoursData });

    // Act
    const { result } = renderHook(() => useHours(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert - verify structure
    const hours = result.current.data;
    expect(hours).toBeDefined();

    // Check all days are present
    expect(hours?.monday).toBeDefined();
    expect(hours?.tuesday).toBeDefined();
    expect(hours?.wednesday).toBeDefined();
    expect(hours?.thursday).toBeDefined();
    expect(hours?.friday).toBeDefined();
    expect(hours?.saturday).toBeDefined();
    expect(hours?.sunday).toBeDefined();

    // Check sunday is closed
    expect(hours?.sunday.isClosed).toBe(true);
    expect(hours?.sunday.hours).toBeUndefined();

    // Check monday has hours
    expect(hours?.monday.isClosed).toBe(false);
    expect(hours?.monday.hours?.open).toBe("10:00 AM");
    expect(hours?.monday.hours?.close).toBe("6:00 PM");
  });
});
