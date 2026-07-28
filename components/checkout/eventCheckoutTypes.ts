/** Shared types for the event/booking checkout UI. */

export interface OptionChoice {
  name: string;
  price?: number;
}

export interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  required?: boolean;
  choices: OptionChoice[];
}

export interface SelectedOption {
  categoryName: string;
  choiceName: string;
}

export interface CheckoutParticipant {
  firstName: string;
  lastName: string;
  selectedOptions: SelectedOption[];
}

/** A gift card the customer has applied at checkout. Amounts are in cents. */
export interface AppliedGiftCard {
  giftCardId: string;
  gan: string;
  amountApplied: number;
  remainingBalance: number;
}
