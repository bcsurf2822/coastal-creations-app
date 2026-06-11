"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type { ShippingRate } from "@/lib/shippo/rates";

interface ShippingRateStepProps {
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  onSelect: (rate: ShippingRate) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ShippingRateStep({
  rates,
  selectedRate,
  onSelect,
  onBack,
  onNext,
}: ShippingRateStepProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-subtle)]">
        Select a shipping method for your order.
      </p>

      <div className="flex flex-col gap-3">
        {rates.map((rate) => {
          const isSelected = selectedRate?.rateId === rate.rateId;
          return (
            <button
              key={rate.rateId}
              onClick={() => onSelect(rate)}
              className={`w-full text-left px-4 py-3 rounded-[var(--radius-lg)] border-2 transition-colors ${
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-light)]"
                  : "border-[var(--color-border-lighter)] hover:border-[var(--color-secondary)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)] text-sm">
                    {rate.serviceName}
                  </p>
                  {rate.estimatedDays != null && (
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
                      Est. {rate.estimatedDays} business day{rate.estimatedDays !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <span className="font-bold text-[var(--color-primary)] ml-4">
                  {formatCents(rate.rateCents)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!selectedRate}
          onClick={onNext}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
