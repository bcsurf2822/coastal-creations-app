"use client";

import type { ReactElement, ReactNode } from "react";

interface CheckoutLayoutProps {
  /** Left column: the form (contact → options → payment). */
  children: ReactNode;
  /** Right column: the order summary (sticky on desktop). */
  summary: ReactNode;
}

/**
 * Shared checkout shell — form on the left, order summary on the right
 * (stacked on mobile, two columns on desktop). Used by the store, event/booking,
 * and gift-card checkouts so every flow has the same summary-right / payment-left
 * layout. Each flow supplies its own form content and summary.
 */
export default function CheckoutLayout({
  children,
  summary,
}: CheckoutLayoutProps): ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
      <div className="flex flex-col gap-8">{children}</div>
      {summary}
    </div>
  );
}
