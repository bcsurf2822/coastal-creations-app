# Hotfix: Event Options — Always Include a Free Choice

**Date:** 2026-06-14
**Type:** Production hotfix
**Area:** Event booking / checkout options
**Branches & PRs:**
- `main-hotfix-1` → `main` — **PR #147** (production fix)
- `merge-options-hotfix-into-develop` → `develop` — **PR #148** (keep develop in sync)

---

## Problem

Event option categories (e.g. "Framing Class", "Gold Leaf") are configured by an
admin as a set of **choices**, each with a name and an optional price. Categories
could be marked "optional," but the customer checkout still **forced a payment**
in this scenario:

- An admin created a category whose **only choice was paid** (e.g. Gold Leaf @ $30).
- At checkout the option dropdown **auto-selected the first choice** (`choices[0]`),
  which was the $30 option.
- There was **no free alternative** to fall back to, so an "optional" add-on
  silently added $30 to the customer's total (`Total option costs: $30.00`).

Reported live on the Gold Leaf class: the description said "optional" but checkout
charged $30 with no way to opt out.

### Root cause

`components/payment/Payment.tsx` defaulted a customer's selection for optional
categories to `choices[0]`. When the only choice was paid, the customer was
auto-enrolled into the charge with no free option available.

---

## Solution

Every option category now **always includes a free ($0) choice as its first
choice**, and the customer must make an **explicit selection** at checkout
(choosing the free option costs nothing).

Two behavioral changes:

1. **Guaranteed free option.** Each category always has a free choice at
   `choices[0]`. It is renameable (defaults to **"None"**), always priced $0, and
   cannot be removed in the admin form.
2. **Explicit selection required.** The admin "Required" checkbox was removed —
   *every* category now requires the customer to choose. This is safe because a
   free option is always present, so no one is ever forced to pay.

This was a deliberate product decision (simpler for the studio admin): rather than
toggling "required" per category, all option categories require a choice, and the
free option guarantees an opt-out path.

---

## Implementation

### New shared helper — `lib/utils/optionHelpers.ts`

`ensureFreeOption` / `ensureFreeOptions` guarantee a free choice exists and sits
first in a category. A choice counts as "free" when its price is missing or `0`.
If none exists, a `{ name: "None", price: 0 }` choice is prepended; if one exists
but isn't first, it is moved to the front.

Applied in **three** places so the rule holds everywhere — including legacy events
saved before this rule existed (they are fixed on render, no manual re-edit needed):

- Admin edit load (`useEventData.ts`)
- Admin save (`useEventForm.ts`)
- Customer checkout render (`Payment.tsx`)

### Admin form

- **`components/dashboard/event-form/shared/fields/EventOptionsFields.tsx`**
  - Removed the "Required" checkbox.
  - `choices[0]` renders as a locked, non-removable, renameable **Free** row
    (price shown as a "Free" badge, no price input, no Remove button).
- **`components/dashboard/event-form/shared/hooks/useEventForm.ts`**
  - New categories seed with a free `{ name: "None", price: 0 }` first choice.
  - On submit: free name defaults to "None" if blank, its price is forced to `0`,
    and `required: true` is written for all categories.
- **`components/dashboard/event-form/shared/hooks/useEventData.ts`**
  - Normalizes loaded options via `ensureFreeOptions`.

### Customer checkout

- **`components/payment/Payment.tsx`**
  - Normalizes fetched event options via `ensureFreeOptions`.
  - Default selections start **unselected** (`choiceName: ""`) for the primary
    registrant and all participants.
  - `getRequiredOptionsError` now requires a choice in **every** category
    (removed the `required` filter).
- **`components/payment/BillingForm.tsx`**
  - All three option dropdowns (self, additional participants, other participants)
    start unselected, always show the `-- Select an option --` placeholder and the
    required asterisk.
  - Choices priced `0` display as `<name> - Free` (existing `formatChoiceDisplay`).

---

## Behavior after the fix

- Admin adds a paid "Gold Leaf — $30" choice → a free **"None"** row is guaranteed,
  renameable, and not removable.
- At checkout the dropdown defaults to nothing; the customer must pick. Choosing the
  free option keeps **Total option costs: $0.00**.
- Multiple free choices are allowed — leave a choice's price blank/`0` and it shows
  as "Free" to customers.

---

## Scope & notes

- **In scope:** the **event** booking flow only (where the production bug is).
- **Not changed:** the **reservation** flow has a parallel options structure
  (`components/reservations/OptionsSelector.tsx`, `ParticipantFields.tsx`,
  `components/dashboard/reservation-form/shared/fields/ReservationOptionsFields.tsx`).
  It can receive the same treatment as a follow-up.
- The `required` field remains in the data model / types for backward compatibility,
  but is always written as `true` for events going forward.

---

## Verification

- `tsc --noEmit` and `eslint` clean on all changed files.
- The fix into `develop` was applied by **cherry-picking the single hotfix commit**
  onto a branch off `develop` (not a branch merge), so none of the `main`-only merge
  commits leaked into develop's history. The one overlapping file (`Payment.tsx`,
  store rework in progress) auto-merged cleanly and was hand-verified to contain both
  the store work and all hotfix edits.

---

## Files changed

```
lib/utils/optionHelpers.ts                                                  (new)
components/dashboard/event-form/shared/fields/EventOptionsFields.tsx
components/dashboard/event-form/shared/hooks/useEventForm.ts
components/dashboard/event-form/shared/hooks/useEventData.ts
components/payment/Payment.tsx
components/payment/BillingForm.tsx
```
