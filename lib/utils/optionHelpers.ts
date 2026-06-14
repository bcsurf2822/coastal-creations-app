// Helpers for event/reservation "options" (choice categories).
//
// Business rule: every option category must always include a FREE ($0) choice
// so a customer is never forced to pay for an "optional" add-on. The free choice
// is treated as the first choice in the category. Admins may rename it (defaults
// to "None") but it always exists and is always free.

export const DEFAULT_FREE_CHOICE_NAME = "None";

export interface OptionChoiceLike {
  name: string;
  price?: number;
}

export interface OptionCategoryLike {
  categoryName?: string;
  categoryDescription?: string;
  required?: boolean;
  choices?: OptionChoiceLike[];
}

// A choice counts as "free" when it has no price or a price of 0.
const isFreeChoice = (choice: OptionChoiceLike): boolean =>
  !choice.price || choice.price <= 0;

// Guarantees a single free choice exists and is positioned first.
// - If no free choice exists, prepend one named DEFAULT_FREE_CHOICE_NAME.
// - If a free choice exists but isn't first, move it to the front so the admin
//   UI and customer dropdown render it consistently as the default option.
export const ensureFreeOption = <T extends OptionCategoryLike>(category: T): T => {
  const choices = category.choices ?? [];

  const freeIndex = choices.findIndex(isFreeChoice);

  if (freeIndex === -1) {
    return {
      ...category,
      choices: [{ name: DEFAULT_FREE_CHOICE_NAME, price: 0 }, ...choices],
    };
  }

  if (freeIndex > 0) {
    const free = choices[freeIndex];
    return {
      ...category,
      choices: [
        free,
        ...choices.slice(0, freeIndex),
        ...choices.slice(freeIndex + 1),
      ],
    };
  }

  return category;
};

// Applies ensureFreeOption to every category in a list.
export const ensureFreeOptions = <T extends OptionCategoryLike>(
  categories: T[] | undefined | null
): T[] => (categories ?? []).map((category) => ensureFreeOption(category));
