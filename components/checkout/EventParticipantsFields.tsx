"use client";

import type { ReactElement } from "react";
import { Input, Label, Select } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type {
  EventOption,
  SelectedOption,
  CheckoutParticipant,
} from "./eventCheckoutTypes";

interface EventParticipantsFieldsProps {
  quantity: number;
  onQuantityChange: (n: number) => void;
  isSigningUpForSelf: boolean;
  onSelfChange: (b: boolean) => void;
  eventOptions: EventOption[];
  /** Options chosen for the primary registrant (only when signing up for self). */
  selfSelectedOptions: SelectedOption[];
  onSelfOptionChange: (categoryName: string, choiceName: string) => void;
  participants: CheckoutParticipant[];
  onParticipantNameChange: (
    index: number,
    field: "firstName" | "lastName",
    value: string
  ) => void;
  onParticipantOptionChange: (
    index: number,
    categoryName: string,
    choiceName: string
  ) => void;
}

function choiceLabel(choice: { name: string; price?: number }): string {
  return choice.price && choice.price > 0
    ? `${choice.name} (+${formatCents(Math.round(choice.price * 100))})`
    : choice.name;
}

function OptionSelects({
  idPrefix,
  options,
  selected,
  onChange,
}: {
  idPrefix: string;
  options: EventOption[];
  selected: SelectedOption[];
  onChange: (categoryName: string, choiceName: string) => void;
}): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const value =
          selected.find((s) => s.categoryName === opt.categoryName)?.choiceName ?? "";
        return (
          <div key={opt.categoryName}>
            <Label htmlFor={`${idPrefix}-${opt.categoryName}`} required>
              {opt.categoryName}
            </Label>
            <Select
              id={`${idPrefix}-${opt.categoryName}`}
              value={value}
              onChange={(e) => onChange(opt.categoryName, e.target.value)}
            >
              <option value="">Select…</option>
              {opt.choices.map((c) => (
                <option key={c.name} value={c.name}>
                  {choiceLabel(c)}
                </option>
              ))}
            </Select>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Quantity + who's-registering + per-person options/names for event checkout.
 * Presentational/controlled — all state lives in EventCheckout.
 */
export default function EventParticipantsFields({
  quantity,
  onQuantityChange,
  isSigningUpForSelf,
  onSelfChange,
  eventOptions,
  selfSelectedOptions,
  onSelfOptionChange,
  participants,
  onParticipantNameChange,
  onParticipantOptionChange,
}: EventParticipantsFieldsProps): ReactElement {
  const hasOptions = eventOptions.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity */}
      <div className="max-w-[160px]">
        <Label htmlFor="quantity" required>
          Number of people
        </Label>
        <Select
          id="quantity"
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </div>

      {/* Who is this for */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Who is this registration for?
        </span>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signup-for"
              checked={isSigningUpForSelf}
              onChange={() => onSelfChange(true)}
            />
            <span>Myself{quantity > 1 ? " (and others)" : ""}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signup-for"
              checked={!isSigningUpForSelf}
              onChange={() => onSelfChange(false)}
            />
            <span>Someone else</span>
          </label>
        </div>
      </div>

      {/* Primary registrant options (self only) */}
      {isSigningUpForSelf && hasOptions && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-lighter)] p-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Your selections
          </h3>
          <OptionSelects
            idPrefix="self"
            options={eventOptions}
            selected={selfSelectedOptions}
            onChange={onSelfOptionChange}
          />
        </div>
      )}

      {/* Additional / other participants */}
      {participants.map((p, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-lighter)] p-4"
        >
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {isSigningUpForSelf ? `Additional person ${index + 1}` : `Participant ${index + 1}`}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`p-${index}-first`} required>
                First name
              </Label>
              <Input
                id={`p-${index}-first`}
                value={p.firstName}
                onChange={(e) => onParticipantNameChange(index, "firstName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`p-${index}-last`} required>
                Last name
              </Label>
              <Input
                id={`p-${index}-last`}
                value={p.lastName}
                onChange={(e) => onParticipantNameChange(index, "lastName", e.target.value)}
              />
            </div>
          </div>
          {hasOptions && (
            <OptionSelects
              idPrefix={`p-${index}`}
              options={eventOptions}
              selected={p.selectedOptions}
              onChange={(cat, choice) => onParticipantOptionChange(index, cat, choice)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
