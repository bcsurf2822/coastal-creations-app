"use client";

import type { ReactElement } from "react";
import { formatCents } from "@/lib/utils/moneyHelpers";

export interface SummaryLine {
  label: string;
  amountCents: number;
}

interface EventSummaryProps {
  eventName: string;
  /** Base registration line: "Registration × N". */
  registrationLabel: string;
  registrationCents: number;
  /** Priced add-on/option lines (only those that cost > 0). */
  optionLines: SummaryLine[];
  /** Gift card applied (shown as a negative line) — cents. */
  giftCardCents?: number;
  discountApplied?: boolean;
  totalCents: number;
}

/**
 * Order summary for event / booking checkout — the right column of CheckoutLayout,
 * mirroring the store's CartSummary. Sticky on desktop.
 */
export default function EventSummary({
  eventName,
  registrationLabel,
  registrationCents,
  optionLines,
  giftCardCents = 0,
  discountApplied = false,
  totalCents,
}: EventSummaryProps): ReactElement {
  return (
    <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border-lighter)] bg-white p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--color-primary)]">
        Order summary
      </h2>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {eventName}
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-subtle)]">{registrationLabel}</span>
          <span className="text-[var(--color-text-primary)]">
            {formatCents(registrationCents)}
          </span>
        </div>

        {optionLines.map((line, i) => (
          <div key={`${line.label}-${i}`} className="flex justify-between">
            <span className="text-[var(--color-text-subtle)]">{line.label}</span>
            <span className="text-[var(--color-text-primary)]">
              {formatCents(line.amountCents)}
            </span>
          </div>
        ))}

        {discountApplied && (
          <p className="text-xs text-[var(--color-success)]">Group discount applied</p>
        )}

        {giftCardCents > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--color-text-subtle)]">Gift card</span>
            <span className="text-[var(--color-success)]">
              −{formatCents(giftCardCents)}
            </span>
          </div>
        )}
      </div>

      <hr className="border-0 border-t border-[var(--color-border-lighter)]" />

      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Total</span>
        <span className="text-lg font-bold text-[var(--color-primary)]">
          {formatCents(totalCents)}
        </span>
      </div>
    </aside>
  );
}
