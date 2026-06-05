"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./get-query-client";
import { CartProvider } from "@/components/store/CartProvider";
import CartDrawer from "@/components/store/CartDrawer";
import type { ReactElement, ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const isDevelopment = process.env.NODE_ENV === "development";

export function Providers({ children }: ProvidersProps): ReactElement {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
      {isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
