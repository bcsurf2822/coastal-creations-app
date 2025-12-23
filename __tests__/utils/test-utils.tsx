"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Creates a fresh QueryClient for each test
 * with settings optimized for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Garbage collect immediately
        staleTime: 0, // Always consider data stale
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
}

/**
 * Creates a wrapper component with a fresh QueryClient
 */
export function createWrapper(): React.FC<WrapperProps> {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: WrapperProps): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Creates a wrapper component with a specific QueryClient
 * Useful for testing cache invalidation with spies
 */
export function createWrapperWithClient(
  queryClient: QueryClient
): React.FC<WrapperProps> {
  return function Wrapper({ children }: WrapperProps): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Custom render function that includes QueryClientProvider
 */
export function renderWithClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: WrapperProps): ReactElement => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Helper to create a mock fetch response
 */
export function createMockFetchResponse<T>(data: T, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? "OK" : "Bad Request",
    type: "basic",
    url: "",
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array(),
  } as Response;
}

/**
 * Helper to mock fetch with a specific response
 */
export function mockFetch<T>(data: T, ok = true): void {
  const mockResponse = createMockFetchResponse(data, ok);
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);
}

/**
 * Helper to mock fetch to reject with an error
 */
export function mockFetchError(message: string): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(message));
}

// Re-export everything from testing-library
export * from "@testing-library/react";
