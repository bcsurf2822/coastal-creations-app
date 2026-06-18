"use client";

import type { ReactElement } from "react";
import { useState } from "react";
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

interface RateOptionProps {
  rate: ShippingRate;
  isSelected: boolean;
  onSelect: (rate: ShippingRate) => void;
}

function RateOption({ rate, isSelected, onSelect }: RateOptionProps): ReactElement {
  return (
    <button
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
}

export default function ShippingRateStep({
  rates,
  selectedRate,
  onSelect,
  onBack,
  onNext,
}: ShippingRateStepProps): ReactElement {
  // [SHIPPINGRATESTEP] Collapse the full rate list by default — show only the
  // recommended (selected) option, let the user expand to choose another.
  const [showAllOptions, setShowAllOptions] = useState(false);

  const handleSelect = (rate: ShippingRate): void => {
    onSelect(rate);
    setShowAllOptions(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-subtle)]">
        Select a shipping method for your order.
      </p>

      <div className="flex flex-col gap-3">
        {showAllOptions ? (
          rates.map((rate) => (
            <RateOption
              key={rate.rateId}
              rate={rate}
              isSelected={selectedRate?.rateId === rate.rateId}
              onSelect={handleSelect}
            />
          ))
        ) : (
          selectedRate && (
            <RateOption
              rate={selectedRate}
              isSelected
              onSelect={handleSelect}
            />
          )
        )}

        {rates.length > 1 && (
          <button
            type="button"
            onClick={() => setShowAllOptions((prev) => !prev)}
            className="self-start text-sm font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline transition-colors"
          >
            {showAllOptions ? "Hide other options" : "Choose a different shipping option"}
          </button>
        )}
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
