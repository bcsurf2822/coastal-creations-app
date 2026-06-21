# Phase 3: Dashboard Components

> Update all admin dashboard components to use the design system

---

## Overview

This phase updates all admin-facing components:
- Dashboard home and navigation
- Event management forms
- Reservation management forms
- Private event forms
- Customer management
- Gift card management
- Gallery/image upload
- Page content editors

## Prerequisites

- Phase 1 complete (UI components exist)
- Phase 2 complete (public components updated)
- Build passes: `npm run build`

---

## Tasks

### Task 3.1: UPDATE components/dashboard/SideBar.tsx

Apply consistent navigation styling.

**Action**: MODIFY `components/dashboard/SideBar.tsx`
- **UPDATE**: Background color to use design tokens
- **UPDATE**: Active/hover states to use `var(--color-primary)` and `var(--color-light)`
- **UPDATE**: Icon and text colors
- **VALIDATE**: Navigation works, visual inspection

---

### Task 3.2: UPDATE components/dashboard/shared/AddButton.tsx

Refactor to use Button component.

**Action**: MODIFY `components/dashboard/shared/AddButton.tsx`
- **IMPORTS**: Add `import { Button } from '@/components/ui'`
- **REPLACE**: Custom button with `<Button variant="primary">`
- **PRESERVE**: onClick handler and icon
- **VALIDATE**: All add buttons work throughout dashboard

---

### Task 3.3: UPDATE components/dashboard/home/Dashboard.tsx

Apply card and typography styling.

**Action**: MODIFY `components/dashboard/home/Dashboard.tsx`
- **IMPORTS**: Add `import { Card } from '@/components/ui'`
- **UPDATE**: Stats/summary cards to use `<Card>` component
- **UPDATE**: Typography hierarchy
- **VALIDATE**: Dashboard loads correctly

---

### Task 3.4: UPDATE components/dashboard/home/EventContainer.tsx

Apply consistent event list styling.

**Action**: MODIFY `components/dashboard/home/EventContainer.tsx`
- **IMPORTS**: Add `import { Card, Badge, Button } from '@/components/ui'`
- **UPDATE**: Event list cards
- **UPDATE**: Status badges
- **UPDATE**: Action buttons
- **VALIDATE**: Events display correctly

---

### Task 3.5: UPDATE components/dashboard/event-form/EventFormBase.tsx

Refactor base event form.

**Action**: MODIFY `components/dashboard/event-form/EventFormBase.tsx`
- **IMPORTS**: Add `import { Card, Button } from '@/components/ui'`
- **UPDATE**: Form container with `<Card>`
- **UPDATE**: Submit/cancel buttons with `<Button>`
- **VALIDATE**: Form renders correctly

---

### Task 3.6: UPDATE components/dashboard/event-form/AddEventForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/event-form/AddEventForm.tsx`
- **UPDATE**: Use updated EventFormBase styling
- **VALIDATE**: Event creation works

---

### Task 3.7: UPDATE components/dashboard/event-form/EditEventForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/event-form/EditEventForm.tsx`
- **UPDATE**: Use updated EventFormBase styling
- **VALIDATE**: Event editing works

---

### Task 3.8: UPDATE components/dashboard/event-form/shared/fields/EventBasicFields.tsx

Refactor form fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventBasicFields.tsx`
- **IMPORTS**: Add `import { Input, Label, Select, Textarea } from '@/components/ui'`
- **REPLACE**: All form inputs with UI components
- **PRESERVE**: react-hook-form integration
- **VALIDATE**: Fields work correctly

---

### Task 3.9: UPDATE components/dashboard/event-form/shared/fields/EventPricingFields.tsx

Refactor pricing fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventPricingFields.tsx`
- **IMPORTS**: Add UI components
- **REPLACE**: Form inputs with UI components
- **VALIDATE**: Pricing fields work

---

### Task 3.10: UPDATE components/dashboard/event-form/shared/fields/EventDateTimeFields.tsx

Refactor date/time fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventDateTimeFields.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Input styling
- **VALIDATE**: Date/time selection works

---

### Task 3.11: UPDATE components/dashboard/event-form/shared/fields/EventOptionsFields.tsx

Refactor options fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventOptionsFields.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Field styling
- **VALIDATE**: Options work correctly

---

### Task 3.12: UPDATE components/dashboard/event-form/shared/fields/EventDiscountFields.tsx

Refactor discount fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventDiscountFields.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Field styling
- **VALIDATE**: Discount fields work

---

### Task 3.13: UPDATE components/dashboard/event-form/shared/fields/EventReservationFields.tsx

Refactor reservation fields.

**Action**: MODIFY `components/dashboard/event-form/shared/fields/EventReservationFields.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Field styling
- **VALIDATE**: Fields work correctly

---

### Task 3.14: UPDATE components/dashboard/event-form/shared/preview/EventCardPreview.tsx

Apply preview card styling.

**Action**: MODIFY `components/dashboard/event-form/shared/preview/EventCardPreview.tsx`
- **IMPORTS**: Add `import { Card, Badge, PriceBadge } from '@/components/ui'`
- **UPDATE**: Preview to match actual EventCard styling
- **VALIDATE**: Preview displays correctly

---

### Task 3.15: UPDATE components/dashboard/reservation-form/ReservationFormBase.tsx

Refactor base reservation form.

**Action**: MODIFY `components/dashboard/reservation-form/ReservationFormBase.tsx`
- **IMPORTS**: Add `import { Card, Button } from '@/components/ui'`
- **UPDATE**: Form container and buttons
- **VALIDATE**: Form renders correctly

---

### Task 3.16: UPDATE components/dashboard/reservation-form/AddReservationForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/reservation-form/AddReservationForm.tsx`
- **VALIDATE**: Reservation creation works

---

### Task 3.17: UPDATE components/dashboard/reservation-form/EditReservationForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/reservation-form/EditReservationForm.tsx`
- **VALIDATE**: Reservation editing works

---

### Task 3.18: UPDATE components/dashboard/reservation-form/shared/fields/*.tsx

Refactor all reservation form fields.

**Action**: MODIFY all files in `components/dashboard/reservation-form/shared/fields/`
- **FILES**: ReservationBasicFields, ReservationPricingFields, ReservationDateTimeFields, ReservationOptionsFields, ReservationDiscountFields
- **IMPORTS**: Add UI components to each
- **REPLACE**: Form inputs with UI components
- **VALIDATE**: All fields work correctly

---

### Task 3.19: UPDATE components/dashboard/private-event-form/PrivateEventFormBase.tsx

Refactor base private event form.

**Action**: MODIFY `components/dashboard/private-event-form/shared/PrivateEventFormBase.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Form container and buttons
- **VALIDATE**: Form renders correctly

---

### Task 3.20: UPDATE components/dashboard/private-event-form/AddPrivateEventForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/private-event-form/AddPrivateEventForm.tsx`
- **VALIDATE**: Private event creation works

---

### Task 3.21: UPDATE components/dashboard/private-event-form/EditPrivateEventForm.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/private-event-form/EditPrivateEventForm.tsx`
- **VALIDATE**: Private event editing works

---

### Task 3.22: UPDATE components/dashboard/private-event-form/shared/fields/*.tsx

Refactor all private event form fields.

**Action**: MODIFY all files in `components/dashboard/private-event-form/shared/fields/`
- **IMPORTS**: Add UI components to each
- **REPLACE**: Form inputs with UI components
- **VALIDATE**: All fields work correctly

---

### Task 3.23: UPDATE components/dashboard/customers/*.tsx

Apply consistent customer management styling.

**Action**: MODIFY customer components
- **UPDATE**: Customer list/table styling
- **UPDATE**: Customer detail cards
- **IMPORTS**: Add UI components as needed
- **VALIDATE**: Customer management works

---

### Task 3.24: UPDATE components/dashboard/reservations/BookingCard.tsx

Apply consistent booking card styling.

**Action**: MODIFY `components/dashboard/reservations/BookingCard.tsx`
- **IMPORTS**: Add `import { Card, Badge } from '@/components/ui'`
- **UPDATE**: Card styling
- **VALIDATE**: Booking cards display correctly

---

### Task 3.25: UPDATE components/dashboard/reservations/BookingsList.tsx

Apply consistent list styling.

**Action**: MODIFY `components/dashboard/reservations/BookingsList.tsx`
- **UPDATE**: List container styling
- **VALIDATE**: Bookings list displays correctly

---

### Task 3.26: UPDATE components/dashboard/reservations/DateFilteredBookingCard.tsx

Apply consistent styling.

**Action**: MODIFY `components/dashboard/reservations/DateFilteredBookingCard.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Card styling
- **VALIDATE**: Date filtered view works

---

### Task 3.27: UPDATE components/dashboard/reservations/ReservationSummaryCard.tsx

Apply consistent summary styling.

**Action**: MODIFY `components/dashboard/reservations/ReservationSummaryCard.tsx`
- **IMPORTS**: Add `import { Card } from '@/components/ui'`
- **UPDATE**: Summary card styling
- **VALIDATE**: Summary displays correctly

---

### Task 3.28: UPDATE components/dashboard/reservations/DateSelector.tsx

Apply consistent date selector styling.

**Action**: MODIFY `components/dashboard/reservations/DateSelector.tsx`
- **UPDATE**: Selector styling to use design tokens
- **VALIDATE**: Date selection works

---

### Task 3.29: UPDATE components/dashboard/gift-cards/GiftCardsTable.tsx

Apply consistent table styling.

**Action**: MODIFY `components/dashboard/gift-cards/GiftCardsTable.tsx`
- **UPDATE**: Table styling
- **UPDATE**: Action buttons with `<Button>` components
- **VALIDATE**: Gift card table displays correctly

---

### Task 3.30: UPDATE components/dashboard/gift-cards/GiftCardDetails.tsx

Apply consistent detail card styling.

**Action**: MODIFY `components/dashboard/gift-cards/GiftCardDetails.tsx`
- **IMPORTS**: Add `import { Card } from '@/components/ui'`
- **UPDATE**: Detail card styling
- **VALIDATE**: Gift card details display correctly

---

### Task 3.31: UPDATE components/dashboard/upload-images/GalleryUploadForm.tsx

Apply consistent upload form styling.

**Action**: MODIFY `components/dashboard/upload-images/GalleryUploadForm.tsx`
- **IMPORTS**: Add `import { Input, Label, Button } from '@/components/ui'`
- **UPDATE**: Form styling
- **VALIDATE**: Image upload works

---

### Task 3.32: UPDATE components/dashboard/upload-images/GalleryGrid.tsx

Apply consistent grid styling.

**Action**: MODIFY `components/dashboard/upload-images/GalleryGrid.tsx`
- **UPDATE**: Grid container styling
- **VALIDATE**: Gallery displays correctly

---

### Task 3.33: UPDATE components/dashboard/upload-images/GalleryImageCard.tsx

Apply consistent image card styling.

**Action**: MODIFY `components/dashboard/upload-images/GalleryImageCard.tsx`
- **IMPORTS**: Add `import { Card, Button } from '@/components/ui'`
- **UPDATE**: Image card styling
- **UPDATE**: Action buttons
- **VALIDATE**: Image cards display correctly

---

### Task 3.34: UPDATE components/dashboard/upload-images/EditGalleryModal.tsx

Apply consistent modal styling.

**Action**: MODIFY `components/dashboard/upload-images/EditGalleryModal.tsx`
- **IMPORTS**: Add UI components
- **UPDATE**: Modal form styling
- **VALIDATE**: Edit modal works

---

### Task 3.35: UPDATE components/dashboard/upload-images/DeleteConfirmation.tsx

Apply consistent confirmation dialog styling.

**Action**: MODIFY `components/dashboard/upload-images/DeleteConfirmation.tsx`
- **IMPORTS**: Add `import { Button } from '@/components/ui'`
- **UPDATE**: Dialog styling
- **UPDATE**: Confirm/cancel buttons with `<Button variant="destructive">` and `<Button variant="secondary">`
- **VALIDATE**: Delete confirmation works

---

### Task 3.36: UPDATE components/dashboard/page-descriptions/TextEditor.tsx

Apply consistent editor styling.

**Action**: MODIFY `components/dashboard/page-descriptions/TextEditor.tsx`
- **UPDATE**: Editor container styling
- **UPDATE**: Toolbar button styling
- **VALIDATE**: Text editor works

---

### Task 3.37: UPDATE components/dashboard/page-descriptions/TabNavigation.tsx

Apply consistent tab styling.

**Action**: MODIFY `components/dashboard/page-descriptions/TabNavigation.tsx`
- **UPDATE**: Tab styling to use design tokens
- **UPDATE**: Active/inactive states
- **VALIDATE**: Tab navigation works

---

## Phase 3 Validation Checklist

```bash
# After all tasks complete:
npx tsc --noEmit              # No TypeScript errors
npm run lint                   # No lint errors
npm run build                  # Build succeeds
npm run dev                    # Start dev server for testing
```

### Visual Testing (Admin Dashboard)
- [ ] Sidebar navigation styled correctly
- [ ] Dashboard home displays correctly
- [ ] Event list displays correctly
- [ ] Event forms styled correctly
- [ ] Reservation forms styled correctly
- [ ] Private event forms styled correctly
- [ ] Customer list displays correctly
- [ ] Booking cards display correctly
- [ ] Gift card management styled correctly
- [ ] Image upload styled correctly
- [ ] Page editor styled correctly

### Functional Testing
- [ ] Create new event works
- [ ] Edit existing event works
- [ ] Delete event works
- [ ] Create reservation works
- [ ] Edit reservation works
- [ ] Create private event works
- [ ] Edit private event works
- [ ] View customer details works
- [ ] Process refund works (if applicable)
- [ ] Upload gallery image works
- [ ] Edit page content works

---

## Next Phase

Once Phase 3 is complete, proceed to `04-remaining-polish.md` for remaining components and final validation.
