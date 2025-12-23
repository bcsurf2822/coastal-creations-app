import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent immediate refetch after hydration
        staleTime: 60 * 1000, // 1 minute
        // Garbage collection time
        gcTime: 5 * 60 * 1000, // 5 minutes
        // Retry failed requests once
        retry: 1,
        // Refetch when window regains focus
        refetchOnWindowFocus: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: reuse the same QueryClient
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
