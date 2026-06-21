# Phase 2: Public-Facing Components

> Update all customer-facing components to use the design system

---

## Overview

This phase updates all components that customers interact with:
- Landing page (Hero, Offerings, Calendar, Gallery)
- Event/Class displays
- Reservation booking flow
- Payment forms
- Gift cards
- Contact form
- Navigation and Footer

## Prerequisites

- Phase 1 complete (UI components exist in `components/ui/`)
- Build passes: `npm run build`

---

## Tasks

### Task 2.1: UPDATE components/classes/EventCard.tsx

Refactor event card to use Card, Badge, Button, and PriceBadge components.

**Action**: MODIFY `components/classes/EventCard.tsx`
- **IMPORTS**: Add `import { Card, Badge, Button, PriceBadge } from '@/components/ui'`
- **REPLACE**: Custom card styling with `<Card variant="event">` or `<Card variant="featured">`
- **REPLACE**: Status indicators with `<Badge variant="...">`
- **REPLACE**: Price display with `<PriceBadge price={...}>`
- **REPLACE**: Action buttons with `<Button variant="primary">` / `<Button variant="secondary">`
- **PRESERVE**: All props, event handlers, and data flow
- **VALIDATE**: `npm run build`, visual inspection

```tsx
// Example transformation:
// BEFORE:
<div className="bg-white rounded-lg shadow-md p-4">
  <span className="bg-green-100 text-green-800">Available</span>
  <span className="text-xl font-bold">${price}</span>
  <button className="bg-blue-600 text-white px-4 py-2">Book Now</button>
</div>

// AFTER:
<Card variant="featured">
  <Badge variant="available" />
  <PriceBadge price={price} />
  <Button variant="primary">Book Now</Button>
</Card>
```

---

### Task 2.2: UPDATE components/landing/Hero.tsx

Apply design system typography and colors.

**Action**: MODIFY `components/landing/Hero.tsx`
- **UPDATE**: Heading colors to use `text-[var(--color-primary)]`
- **UPDATE**: Subheading to use `text-[var(--color-text-muted)]`
- **REPLACE**: CTA buttons with `<Button variant="primary" size="lg">` and `<Button variant="secondary" size="lg">`
- **VALIDATE**: Visual inspection, responsive check

---

### Task 2.3: UPDATE components/landing/Offerings.tsx

Apply card styling and consistent spacing.

**Action**: MODIFY `components/landing/Offerings.tsx`
- **IMPORTS**: Add `import { Card, Button } from '@/components/ui'`
- **REPLACE**: Offering item containers with `<Card variant="standard">`
- **UPDATE**: Typography hierarchy (titles, descriptions)
- **UPDATE**: Spacing to use consistent gaps (gap-6, gap-8)
- **VALIDATE**: Visual inspection

---

### Task 2.4: UPDATE components/landing/Calendar.tsx

Apply consistent styling to calendar section.

**Action**: MODIFY `components/landing/Calendar.tsx`
- **UPDATE**: Section background to use `bg-[var(--color-light)]`
- **UPDATE**: Typography colors
- **UPDATE**: Any buttons to use Button component
- **VALIDATE**: Visual inspection

---

### Task 2.5: UPDATE components/landing/GallerySlideshow.tsx

Apply consistent styling.

**Action**: MODIFY `components/landing/GallerySlideshow.tsx`
- **UPDATE**: Container styling
- **UPDATE**: Navigation buttons if present
- **VALIDATE**: Slideshow functionality works

---

### Task 2.6: UPDATE components/landing/GiftCardBanner.tsx

Apply consistent card and button styling.

**Action**: MODIFY `components/landing/GiftCardBanner.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Banner styling to match design system
- **REPLACE**: CTA button with `<Button>`
- **VALIDATE**: Visual inspection

---

### Task 2.7: UPDATE components/reservations/ReservationCard.tsx

Refactor reservation card to use design system.

**Action**: MODIFY `components/reservations/ReservationCard.tsx`
- **IMPORTS**: Add `import { Card, Badge, PriceBadge } from '@/components/ui'`
- **REPLACE**: Card container with `<Card variant="featured">`
- **REPLACE**: Status indicators with `<Badge>`
- **VALIDATE**: Visual inspection, `npm run build`

---

### Task 2.8: UPDATE components/reservations/ReservationContainer.tsx

Apply consistent container styling.

**Action**: MODIFY `components/reservations/ReservationContainer.tsx`
- **UPDATE**: Page container styling
- **UPDATE**: Section spacing
- **VALIDATE**: Visual inspection

---

### Task 2.9: UPDATE components/reservations/BookingSummary.tsx

Apply consistent card and typography styling.

**Action**: MODIFY `components/reservations/BookingSummary.tsx`
- **IMPORTS**: Add `import { Card, PriceBadge } from '@/components/ui'`
- **UPDATE**: Summary card styling
- **UPDATE**: Price display with `<PriceBadge>`
- **VALIDATE**: Summary displays correctly

---

### Task 2.10: UPDATE components/reservations/ParticipantFields.tsx

Refactor form fields to use Input and Label.

**Action**: MODIFY `components/reservations/ParticipantFields.tsx`
- **IMPORTS**: Add `import { Input, Label } from '@/components/ui'`
- **REPLACE**: Input elements with `<Input>` component
- **REPLACE**: Labels with `<Label>` component
- **PRESERVE**: react-hook-form register props
- **VALIDATE**: Form fields work correctly

```tsx
// Example transformation:
// BEFORE:
<label className="text-sm font-medium">Name</label>
<input {...register('name')} className="border rounded p-2" />

// AFTER:
<Label htmlFor="name">Name</Label>
<Input id="name" {...register('name')} />
```

---

### Task 2.11: UPDATE components/reservations/BillingFields.tsx

Refactor billing form fields.

**Action**: MODIFY `components/reservations/BillingFields.tsx`
- **IMPORTS**: Add `import { Input, Label, Select } from '@/components/ui'`
- **REPLACE**: All form inputs with UI components
- **VALIDATE**: Billing form works correctly

---

### Task 2.12: UPDATE components/reservations/OptionsSelector.tsx

Apply consistent checkbox/option styling.

**Action**: MODIFY `components/reservations/OptionsSelector.tsx`
- **UPDATE**: Option card styling
- **UPDATE**: Selected state styling to use design tokens
- **VALIDATE**: Option selection works

---

### Task 2.13: UPDATE components/reservations/DayCard.tsx

Apply consistent day selection styling.

**Action**: MODIFY `components/reservations/DayCard.tsx`
- **UPDATE**: Card styling
- **UPDATE**: Selected/available states to use design tokens
- **VALIDATE**: Day selection works

---

### Task 2.14: UPDATE components/reservations/CalendarSelection.tsx

Apply consistent calendar styling.

**Action**: MODIFY `components/reservations/CalendarSelection.tsx`
- **UPDATE**: Calendar container styling
- **VALIDATE**: Calendar selection works

---

### Task 2.15: UPDATE components/reservations/PaymentForm.tsx

Apply consistent form styling.

**Action**: MODIFY `components/reservations/PaymentForm.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Form styling
- **REPLACE**: Submit button with `<Button>`
- **VALIDATE**: Payment form works

---

### Task 2.16: UPDATE components/payment/BillingForm.tsx

Refactor payment billing form.

**Action**: MODIFY `components/payment/BillingForm.tsx`
- **IMPORTS**: Add `import { Input, Label, Select, Button } from '@/components/ui'`
- **REPLACE**: All form fields with UI components
- **REPLACE**: Submit button with `<Button variant="primary" size="lg">`
- **PRESERVE**: Validation and form submission logic
- **VALIDATE**: Payment form works end-to-end

---

### Task 2.17: UPDATE components/payment/Payment.tsx

Apply consistent container styling.

**Action**: MODIFY `components/payment/Payment.tsx`
- **IMPORTS**: Add `import { Card } from '@/components/ui'`
- **UPDATE**: Payment container with `<Card>`
- **VALIDATE**: Payment flow works

---

### Task 2.18: UPDATE components/payment/RegistrationHeader.tsx

Apply consistent typography.

**Action**: MODIFY `components/payment/RegistrationHeader.tsx`
- **UPDATE**: Header styling to use design tokens
- **VALIDATE**: Visual inspection

---

### Task 2.19: UPDATE components/payment/ReservationSummary.tsx

Apply consistent summary card styling.

**Action**: MODIFY `components/payment/ReservationSummary.tsx`
- **IMPORTS**: Add `import { Card, PriceBadge } from '@/components/ui'`
- **UPDATE**: Summary styling
- **VALIDATE**: Summary displays correctly

---

### Task 2.20: UPDATE components/payment/GiftCardRedemption.tsx

Apply consistent form styling.

**Action**: MODIFY `components/payment/GiftCardRedemption.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Input and button styling
- **VALIDATE**: Gift card redemption works

---

### Task 2.21: UPDATE components/contact/ContactForm.tsx

Refactor contact form.

**Action**: MODIFY `components/contact/ContactForm.tsx`
- **IMPORTS**: Add `import { Input, Textarea, Label, Button } from '@/components/ui'`
- **REPLACE**: All form fields with UI components
- **REPLACE**: Submit button with `<Button variant="primary">`
- **VALIDATE**: Contact form submission works

---

### Task 2.22: UPDATE components/contact/ContactContainer.tsx

Apply consistent page styling.

**Action**: MODIFY `components/contact/ContactContainer.tsx`
- **UPDATE**: Container styling
- **VALIDATE**: Visual inspection

---

### Task 2.23: UPDATE components/gift-cards/GiftCardPurchase.tsx

Apply consistent form and card styling.

**Action**: MODIFY `components/gift-cards/GiftCardPurchase.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Form styling with Input, Label, Button
- **UPDATE**: Card container styling
- **VALIDATE**: Gift card purchase flow works

---

### Task 2.24: UPDATE components/gift-cards/GiftCardBalance.tsx

Apply consistent form styling.

**Action**: MODIFY `components/gift-cards/GiftCardBalance.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Balance check form styling
- **VALIDATE**: Balance check works

---

### Task 2.25: UPDATE components/layout/nav/NavBar.tsx

Apply consistent navigation styling.

**Action**: MODIFY `components/layout/nav/NavBar.tsx`
- **UPDATE**: Logo/brand colors to use `var(--color-primary)`
- **UPDATE**: Link hover states
- **UPDATE**: Mobile menu button styling
- **VALIDATE**: Navigation works on all screen sizes

---

### Task 2.26: UPDATE components/layout/footer/Footer.tsx

Apply footer gradient and styling.

**Action**: MODIFY `components/layout/footer/Footer.tsx`
- **UPDATE**: Footer background to use `var(--gradient-footer)` or `bg-gradient-to-r from-[var(--color-sand-medium)] to-[var(--color-sand-light)]`
- **UPDATE**: Link colors and hover states
- **UPDATE**: Typography styling
- **VALIDATE**: Visual inspection, responsive check

---

## Phase 2 Validation Checklist

```bash
# After all tasks complete:
npx tsc --noEmit              # No TypeScript errors
npm run lint                   # No lint errors
npm run build                  # Build succeeds
npm run dev                    # Start dev server for visual testing
```

### Visual Testing
- [ ] Homepage hero displays correctly
- [ ] Offerings section styled consistently
- [ ] Event cards display with proper badges and prices
- [ ] Reservation flow works and looks correct
- [ ] Payment forms styled correctly
- [ ] Contact form styled correctly
- [ ] Gift card pages styled correctly
- [ ] Navigation responsive and styled
- [ ] Footer gradient and styling correct

### Functional Testing
- [ ] Event booking flow works (browse -> select -> pay)
- [ ] Reservation flow works (date -> form -> pay)
- [ ] Contact form submits
- [ ] Gift card purchase works
- [ ] Gift card balance check works

---

## Next Phase

Once Phase 2 is complete, proceed to `03-dashboard.md` to update admin dashboard components.
