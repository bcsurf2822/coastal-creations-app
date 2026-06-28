"use client";

import type { ReactElement } from "react";
import { RiBankCardLine } from "react-icons/ri";
import type { SavedCard } from "@/lib/square/cards";

interface SavedCardPickerProps {
  cards: SavedCard[];
  /** Selected saved card id, or null for "use a new card". */
  selectedCardId: string | null;
  onSelect: (cardId: string | null) => void;
  disabled?: boolean;
}

function brandLabel(brand: string): string {
  return brand
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Lets a signed-in customer pay with a card on file or choose "use a new card".
 * The list is custom UI built from saved-card metadata (Square doesn't provide a
 * hosted picker); the actual card entry is still Square's secure iframe.
 */
export default function SavedCardPicker({
  cards,
  selectedCardId,
  onSelect,
  disabled = false,
}: SavedCardPickerProps): ReactElement {
  const options = [
    ...cards.map((card) => ({
      id: card.id,
      label: `${brandLabel(card.brand)} •••• ${card.last4}`,
    })),
    { id: null as string | null, label: "Use a new card" },
  ];

  return (
    <div
      className={`flex flex-col gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      role="radiogroup"
      aria-label="Payment method"
    >
      {options.map((opt) => {
        const selected = selectedCardId === opt.id;
        return (
          <label
            key={opt.id ?? "new-card"}
            className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border-2 px-4 py-3 text-sm transition-colors ${
              selected
                ? "border-[var(--color-secondary)] bg-[var(--color-light)]"
                : "border-[var(--color-border-lighter)] hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="saved-card"
              checked={selected}
              onChange={() => onSelect(opt.id)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {opt.id && <RiBankCardLine className="h-4 w-4 text-gray-400" />}
            <span className="font-medium text-[var(--color-primary)]">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
