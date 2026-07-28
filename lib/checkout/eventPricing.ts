/**
 * Server-side price integrity for event / private-event / reservation bookings.
 *
 * The booking charge (the `submitPayment` server action) and the saved booking
 * record (`POST /api/customer`) must NEVER trust a client-supplied price. These
 * pure functions recompute the authoritative charge IN CENTS from the loaded
 * Mongo document + the customer's selections, mirroring the client-side math in
 * components/payment/Payment.tsx and components/reservations/PaymentForm.tsx.
 *
 * See ecommerce/09-checkout-price-integrity.md.
 */
import { PriceIntegrityError } from "@/lib/checkout/errors";

export interface OptionChoice {
  name: string;
  price?: number | null;
}
export interface OptionCategory {
  categoryName: string;
  choices: OptionChoice[];
}
export interface SelectedOption {
  categoryName: string;
  choiceName: string;
}
export interface BookingParticipant {
  selectedOptions?: SelectedOption[] | null;
}

export interface EventPricingDoc {
  price?: number | null;
  options?: OptionCategory[] | null;
  isDiscountAvailable?: boolean | null;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
  } | null;
}

export interface PrivateEventPricingDoc {
  depositAmount?: number | null;
  options?: OptionCategory[] | null;
}

export interface ReservationPricingDoc {
  pricePerDayPerParticipant: number;
  options?: OptionCategory[] | null;
}

/** Selection shared by Event + PrivateEvent (per-unit price × quantity + options). */
export interface EventSelection {
  quantity: number;
  isSigningUpForSelf?: boolean;
  /** Primary registrant's option choices (counted only when isSigningUpForSelf). */
  selectedOptions?: SelectedOption[] | null;
  /** Additional participants, each carrying their own option choices. */
  participants?: BookingParticipant[] | null;
}

export interface ReservationSelection {
  selectedDates: Array<{
    numberOfParticipants?: number;
    participants?: number;
  }>;
  participants?: BookingParticipant[] | null;
}

const MAX_QUANTITY = 200;

/** Validates a client quantity is a sane positive integer. */
function validateCount(value: unknown, label: string): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_QUANTITY
  ) {
    throw new PriceIntegrityError(`Invalid ${label}`);
  }
  return value;
}

/**
 * Price (in dollars) of a single selected option, looked up in the doc's options.
 * Mirrors the client `getChoicePrice` — an unknown category/choice contributes 0.
 */
function choicePriceDollars(
  options: OptionCategory[] | null | undefined,
  selected: SelectedOption
): number {
  const category = options?.find((o) => o.categoryName === selected.categoryName);
  const choice = category?.choices.find((c) => c.name === selected.choiceName);
  return choice?.price ?? 0;
}

/** Sum (dollars) of a list of selected options against the doc's option catalog. */
function optionsCostDollars(
  options: OptionCategory[] | null | undefined,
  selectedOptions: SelectedOption[] | null | undefined
): number {
  if (!selectedOptions?.length) return 0;
  return selectedOptions.reduce(
    (sum, sel) => sum + choicePriceDollars(options, sel),
    0
  );
}

/**
 * Total option cost (dollars) across the primary registrant (only when
 * isSigningUpForSelf) and every additional participant. Mirrors
 * Payment.tsx `calculateTotalOptionCosts`.
 */
function totalOptionsCostDollars(
  options: OptionCategory[] | null | undefined,
  selection: EventSelection
): number {
  let total = 0;
  if (selection.isSigningUpForSelf) {
    total += optionsCostDollars(options, selection.selectedOptions);
  }
  for (const participant of selection.participants ?? []) {
    total += optionsCostDollars(options, participant.selectedOptions);
  }
  return total;
}

/**
 * Per-unit price after an event discount (dollars). Mirrors Payment.tsx
 * `calculateDiscountedPrice`: gated on isDiscountAvailable + minParticipants.
 */
function discountedUnitPriceDollars(
  basePrice: number,
  quantity: number,
  doc: EventPricingDoc
): number {
  if (!doc.isDiscountAvailable || !doc.discount) return basePrice;
  if (quantity < doc.discount.minParticipants) return basePrice;
  if (doc.discount.type === "percentage") {
    return basePrice - (basePrice * doc.discount.value) / 100;
  }
  return basePrice - doc.discount.value;
}

/** Rounds a dollar total to integer cents the same way the client does. */
function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Authoritative charge (cents) for a standard Event booking.
 * total = discountedUnitPrice × quantity + option costs.
 */
export function computeEventChargeCents(
  doc: EventPricingDoc,
  selection: EventSelection
): number {
  const quantity = validateCount(selection.quantity, "quantity");
  const base = doc.price ?? 0;
  const discountedUnit = discountedUnitPriceDollars(base, quantity, doc);
  const baseTotal = discountedUnit * quantity;
  const optionCosts = totalOptionsCostDollars(doc.options, selection);
  return Math.max(0, toCents(baseTotal + optionCosts));
}

/**
 * Authoritative charge (cents) for a private-event booking. The charge basis is
 * the DEPOSIT (the booking entry point links with `price=depositAmount`), never
 * the full event price; no discount applies. Options are still added.
 */
export function computePrivateEventChargeCents(
  doc: PrivateEventPricingDoc,
  selection: EventSelection
): number {
  const quantity = validateCount(selection.quantity, "quantity");
  const base = doc.depositAmount ?? 0;
  const baseTotal = base * quantity;
  const optionCosts = totalOptionsCostDollars(doc.options, selection);
  return Math.max(0, toCents(baseTotal + optionCosts));
}

/**
 * Authoritative charge (cents) for a reservation booking. Mirrors
 * PaymentForm.tsx: Σ(participantsPerDate × pricePerDayPerParticipant) + options.
 * No discount/deposit applies to reservations.
 */
export function computeReservationChargeCents(
  doc: ReservationPricingDoc,
  selection: ReservationSelection
): number {
  if (!selection.selectedDates?.length) {
    throw new PriceIntegrityError("No reservation dates selected");
  }
  let baseTotal = 0;
  for (const sd of selection.selectedDates) {
    const perDay = sd.numberOfParticipants ?? sd.participants;
    const participants = validateCount(perDay, "participant count");
    baseTotal += participants * doc.pricePerDayPerParticipant;
  }
  let optionCosts = 0;
  for (const participant of selection.participants ?? []) {
    optionCosts += optionsCostDollars(doc.options, participant.selectedOptions);
  }
  return Math.max(0, toCents(baseTotal + optionCosts));
}
