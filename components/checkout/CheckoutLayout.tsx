"use client";

import type { ReactElement, ReactNode } from "react";

interface CheckoutLayoutProps {
  /** Left column: the form (contact → options → payment). */
  children: ReactNode;
  /** Right column: the order summary (sticky on desktop). */
  summary: ReactNode;
}

/**
 * Shared checkout shell — form on the left, order summary on the right on desktop;
 * stacked on mobile with the **summary on top** (so the customer sees what they're
 * buying before the form). Used by the store, event/booking, and gift-card checkouts.
 * Each flow supplies its own form content and summary.
 */
export default function CheckoutLayout({
  children,
  summary,
}: CheckoutLayoutProps): ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
      {/* Summary first in the DOM → on top when stacked; order flips + sticks on desktop. */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-6">{summary}</div>
      <div className="order-2 lg:order-1 flex flex-col gap-8">{children}</div>
    </div>
  );
}
