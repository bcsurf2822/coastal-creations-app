import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePageContent, useInvalidatePageContent } from "@/hooks/queries/use-page-content";
import { createWrapper, createTestQueryClient, mockFetch } from "../../utils/test-utils";
import { mockPageContent } from "../../utils/mock-data";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";

describe("usePageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch page content successfully", async () => {
    mockFetch({ success: true, data: mockPageContent });

    const { result } = renderHook(() => usePageContent(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.content).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.content).toEqual(mockPageContent);
    expect(result.current.isError).toBe(false);
  });

  it("should return backwards-compatible API shape", async () => {
    mockFetch({ success: true, data: mockPageContent });

    const { result } = renderHook(() => usePageContent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify backwards-compatible property names
    expect(result.current).toHaveProperty("content");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("error");
  });

  it("should handle API error", async () => {
    mockFetch({ error: "Server error" }, false);

    const { result } = renderHook(() => usePageContent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch page content");
    expect(result.current.content).toBeNull();
  });

  it("should handle success: false response", async () => {
    mockFetch({ success: false });

    const { result } = renderHook(() => usePageContent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("API returned unsuccessful response");
  });

  it("should return null content when data is undefined", async () => {
    mockFetch({ success: true, data: undefined });

    const { result } = renderHook(() => usePageContent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.content).toBeNull();
  });
});

describe("useInvalidatePageContent", () => {
  it("should return a function to invalidate cache", async () => {
    const { result } = renderHook(() => useInvalidatePageContent(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current).toBe("function");
  });
});
