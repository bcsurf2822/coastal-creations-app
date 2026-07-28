---
name: "Reservation Time Slot Selection Feature"
description: "Enable admin to configure time slot durations and allow clients to select specific time blocks when booking reservations"
---

## Original Story

```
Ashley has requested that the client should be able to select time slots through the reservation.
Requirements:
1. Admin (Ashley) can set a slot duration when creating a reservation: 1 hour, 2 hours, or 4 hours
2. System auto-generates time slots based on operating hours and the chosen duration
3. Clients can ONLY select from the pre-generated time slots - they cannot choose durations
4. No custom time slots per day - uses same operating hours for all days
5. Example: Operating hours 12 PM - 6 PM with 2-hour duration = 3 slots (12-2, 2-4, 4-6)
```

## Story Metadata

**Story Type**: Feature
**Estimated Complexity**: High
**Primary Systems Affected**:
- `lib/models/Reservations.ts` - Database schema
- `components/dashboard/reservation-form/` - Admin form components
- `components/reservations/` - Client booking components
- `app/api/reservations/` - API routes
- `lib/types/reservationTypes.ts` - Type definitions

---

## CONTEXT REFERENCES

- `lib/models/Reservations.ts:11-54` - Current IReservation interface with dailyAvailability structure
- `components/dashboard/reservation-form/shared/fields/ReservationDateTimeFields.tsx` - Admin time configuration UI
- `components/dashboard/reservation-form/shared/fields/ReservationPricingFields.tsx` - Pricing/capacity configuration
- `components/reservations/CalendarSelection.tsx` - Client date selection calendar
- `components/reservations/DayCard.tsx` - Individual day card showing availability
- `components/reservations/types.ts` - SelectedDate and DayCardProps interfaces
- `app/api/reservations/route.ts:21-79` - generateDailyAvailability function

---

## CURRENT STATE ANALYSIS

### Current Model Structure (dailyAvailability)
```typescript
dailyAvailability: Array<{
  date: Date;
  maxParticipants: number;      // Capacity for entire day
  currentBookings: number;       // Bookings for entire day
  isAvailable: boolean;
  startTime?: string;            // Day's open time (e.g., "10:00")
  endTime?: string;              // Day's close time (e.g., "16:00")
}>
```

### Current Client Flow
1. Client sees a calendar of available days
2. Client clicks a day to select it
3. Client chooses number of participants (1 to available spots)
4. Time is display-only - shows operating hours, not selectable slots

### Gap Analysis
- **No time slot concept**: Current system tracks per-day availability, not per-slot
- **No slot duration config**: Admin sets open/close hours, not slot length
- **No slot capacity**: Cannot configure how many people per time slot
- **No slot selection UI**: Client cannot choose a specific time block

---

## IMPLEMENTATION TASKS

### TASK 1: UPDATE lib/models/Reservations.ts

- ADD: `slotDurationMinutes?: 60 | 120 | 240` field to IReservation interface (1, 2, or 4 hours ONLY)
- ADD: `maxParticipantsPerSlot?: number` field to IReservation interface
- ADD: `enableTimeSlots?: boolean` field to toggle time slot mode
- UPDATE: DailyAvailabilitySchema to include nested timeSlots array:
  ```typescript
  timeSlots?: Array<{
    startTime: string;         // "10:00"
    endTime: string;           // "11:00"
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>
  ```
- PATTERN: Follow existing DailyAvailabilitySchema structure for nested schema
- IMPORTS: No new imports needed
- GOTCHA: Make timeSlots optional to maintain backward compatibility with existing reservations
- **VALIDATE**: `npm run build && grep -q "slotDurationMinutes" lib/models/Reservations.ts && echo "Model updated"`

### TASK 2: UPDATE lib/types/reservationTypes.ts

- ADD: TimeSlot interface:
  ```typescript
  export interface TimeSlot {
    startTime: string;
    endTime: string;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }
  ```
- UPDATE: DailyAvailability interface to include `timeSlots?: TimeSlot[]`
- UPDATE: Reservation interface to include new fields
- UPDATE: CreateReservationData to include slot configuration
- ADD: SelectedTimeSlot interface for client bookings:
  ```typescript
  export interface SelectedTimeSlot {
    date: Date;
    startTime: string;
    endTime: string;
    participants: number;
  }
  ```
- PATTERN: Follow existing interface patterns in file
- **VALIDATE**: `npx tsc --noEmit && echo "Types compile successfully"`

### TASK 3: CREATE components/dashboard/reservation-form/shared/fields/ReservationTimeSlotFields.tsx

- CREATE: New component for time slot configuration in admin form
- IMPLEMENT: Toggle switch for "Enable Time Slots" mode
- IMPLEMENT: Dropdown for slot duration with ONLY 3 options:
  - 1 hour (60 minutes)
  - 2 hours (120 minutes)
  - 4 hours (240 minutes)
- IMPLEMENT: Input for max participants per slot
- IMPLEMENT: Live preview showing auto-generated slots based on start/end time and selected duration
  - Example: Start 12:00, End 18:00, Duration 2 hours => Shows "12:00-2:00 PM, 2:00-4:00 PM, 4:00-6:00 PM"
- IMPLEMENT: Warning if operating hours don't divide evenly by slot duration
- PATTERN: Follow ReservationDateTimeFields.tsx component structure
- IMPORTS:
  ```typescript
  import { ReactElement, useMemo } from "react";
  import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
  import dayjs from "dayjs";
  ```
- GOTCHA: Only show slot configuration when timeType === "same" (custom times per day not supported with slots)
- GOTCHA: Disable slot durations that don't fit evenly into operating hours (e.g., 4-hour slots won't work for 5-hour window)
- **VALIDATE**: `npx tsc --noEmit && echo "Component compiles"`

### TASK 4: UPDATE components/dashboard/reservation-form/types/reservationForm.types.ts

- ADD: `enableTimeSlots: boolean` to ReservationFormState
- ADD: `slotDurationMinutes: 60 | 120 | 240` to ReservationFormState (1, 2, or 4 hours only)
- ADD: `maxParticipantsPerSlot: number` to ReservationFormState
- UPDATE: ReservationFormActions to include handlers for new fields
- PATTERN: Follow existing state/action patterns in file
- **VALIDATE**: `npx tsc --noEmit`

### TASK 5: UPDATE components/dashboard/reservation-form/hooks/useReservationForm.ts

- UPDATE: Initial state to include new time slot fields with defaults
- ADD: Handler logic for enableTimeSlots toggle
- UPDATE: Form submission to include slot configuration data
- UPDATE: Validation to ensure slot config is valid when enabled
- PATTERN: Follow existing validation patterns in hook
- GOTCHA: When enableTimeSlots is off, omit slot fields from submission
- **VALIDATE**: `npx tsc --noEmit`

### TASK 6: UPDATE components/dashboard/reservation-form/ReservationFormBase.tsx

- IMPORT: ReservationTimeSlotFields component
- ADD: ReservationTimeSlotFields between DateTimeFields and PricingFields
- CONDITIONALLY RENDER: Only when timeType === "same" (slots require consistent times)
- PATTERN: Follow existing field component integration pattern
- **VALIDATE**: `npm run build`

### TASK 7: UPDATE app/api/reservations/route.ts

- UPDATE: generateDailyAvailability function to generate timeSlots when enabled
- ADD: Helper function generateTimeSlots for auto-generating slots from operating hours:
  ```typescript
  type SlotDuration = 60 | 120 | 240; // 1, 2, or 4 hours only

  function generateTimeSlots(
    startTime: string,           // Operating hours start (e.g., "12:00")
    endTime: string,             // Operating hours end (e.g., "18:00")
    slotDurationMinutes: SlotDuration,
    maxParticipantsPerSlot: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let current = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);

    // Auto-generate slots based on duration
    // Example: 12:00-18:00 with 120min = slots at 12-2, 2-4, 4-6
    while (current.add(slotDurationMinutes, 'minute').isSameOrBefore(end)) {
      slots.push({
        startTime: current.format('HH:mm'),
        endTime: current.add(slotDurationMinutes, 'minute').format('HH:mm'),
        maxParticipants: maxParticipantsPerSlot,
        currentBookings: 0,
        isAvailable: true
      });
      current = current.add(slotDurationMinutes, 'minute');
    }
    return slots;
  }
  ```
- UPDATE: POST handler to use new slot generation when enableTimeSlots is true
- UPDATE: reservationData construction to include slot configuration fields
- ADD: Validation that slotDurationMinutes is one of: 60, 120, 240
- IMPORTS: No new imports needed (dayjs already imported)
- GOTCHA: Preserve backward compatibility - only generate slots when enableTimeSlots is true
- GOTCHA: When enableTimeSlots is true, ignore maxParticipantsPerDay in favor of maxParticipantsPerSlot
- **VALIDATE**: `npm run build && npm run lint`

### TASK 8: UPDATE app/api/reservations/[id]/route.ts

- UPDATE: PUT handler to regenerate timeSlots when slot config changes
- ADD: Logic to preserve existing slot bookings when regenerating
- PATTERN: Follow existing dailyAvailability preservation logic
- GOTCHA: Map existing bookings by slot time to preserve counts
- **VALIDATE**: `npm run build`

### TASK 9: CREATE components/reservations/TimeSlotPicker.tsx

- CREATE: Client-facing time slot selection component
- IMPLEMENT: Display PRE-GENERATED slots from admin configuration (clients cannot choose duration)
- IMPLEMENT: Grid/list of available time slots for selected date
- IMPLEMENT: Each slot shows:
  - Time range (e.g., "12:00 PM - 2:00 PM")
  - Available spots (e.g., "3 spots available")
  - Selection state (highlighted when selected)
- IMPLEMENT: Participant count selector appears after selecting a slot
- PROPS:
  ```typescript
  interface TimeSlotPickerProps {
    date: Date;
    timeSlots: TimeSlot[];              // Pre-generated by admin
    selectedSlot?: SelectedTimeSlot;
    onSlotSelect: (slot: SelectedTimeSlot | null) => void;
  }
  ```
- PATTERN: Follow DayCard.tsx styling and interaction patterns
- IMPORTS: Use EB_Garamond font, dayjs for time formatting
- GOTCHA: Disable slots that are sold out or unavailable (grayed out but visible)
- GOTCHA: Client sees exactly what admin configured - no duration options shown to client
- **VALIDATE**: `npx tsc --noEmit`

### TASK 10: UPDATE components/reservations/DayCard.tsx

- ADD: Optional `timeSlots?: TimeSlot[]` prop
- ADD: Optional `onTimeSlotSelect?: (slot: SelectedTimeSlot) => void` prop
- UPDATE: When timeSlots exist, show slot selector instead of participant dropdown
- IMPLEMENT: Expand card or show modal when date is selected to display slots
- PATTERN: Keep existing day-only mode when no timeSlots provided
- GOTCHA: Maintain backward compatibility - existing reservations without slots should work unchanged
- **VALIDATE**: `npm run build`

### TASK 11: UPDATE components/reservations/types.ts

- ADD: Import TimeSlot from reservationTypes
- UPDATE: SelectedDate to optionally include time slot info:
  ```typescript
  export interface SelectedDate {
    date: Date;
    participants: number;
    timeSlot?: {
      startTime: string;
      endTime: string;
    };
  }
  ```
- UPDATE: DayCardProps to include optional timeSlots and slot selection handler
- **VALIDATE**: `npx tsc --noEmit`

### TASK 12: UPDATE components/reservations/CalendarSelection.tsx

- UPDATE: availableDatesMap to include timeSlots data from dailyAvailability
- UPDATE: handleDateToggle to handle slot-enabled reservations differently:
  - When enableTimeSlots is FALSE: Current behavior (select day, choose participants)
  - When enableTimeSlots is TRUE: Show TimeSlotPicker with pre-generated slots
- ADD: State for selected time slots: `selectedTimeSlots: Map<string, SelectedTimeSlot>`
- UPDATE: handleContinue to encode time slot selections in query params
- IMPLEMENT: When reservation has slots enabled, clicking day shows the available slots for that day
- IMPLEMENT: Client flow for slot-enabled reservations:
  1. Click a date
  2. See available time slots (e.g., "12-2 PM", "2-4 PM", "4-6 PM")
  3. Select a slot
  4. Choose number of participants
  5. Repeat for other dates if needed
- PATTERN: Follow existing selection patterns
- IMPORTS: Add TimeSlotPicker component
- GOTCHA: Support both modes - day-only selection (legacy) and day+slot selection (new)
- GOTCHA: When enableTimeSlots is true on reservation, REQUIRE slot selection - cannot just select day
- **VALIDATE**: `npm run build`

### TASK 13: UPDATE components/reservations/BookingSummary.tsx

- UPDATE: Display selected time slots when applicable
- UPDATE: Price calculation to work with slot-based selections
- ADD: Show time range for each selected slot
- PATTERN: Follow existing display patterns
- **VALIDATE**: `npm run build`

### TASK 14: UPDATE app/reservations/[reservationId]/payment/page.tsx

- UPDATE: Parse selectedDates query param to handle time slot data
- UPDATE: Pass time slot info to PaymentForm
- PATTERN: Follow existing query param parsing
- **VALIDATE**: `npm run build`

### TASK 15: UPDATE components/reservations/PaymentForm.tsx

- UPDATE: Handle time slot data in booking submission
- UPDATE: Display selected slots in confirmation section
- UPDATE: ReservationBookingData to include slot info when booking
- **VALIDATE**: `npm run build`

### TASK 16: UPDATE app/api/customer/route.ts (if needed for slot booking)

- UPDATE: POST handler to decrement slot availability when booking
- ADD: Logic to update specific timeSlot within dailyAvailability
- GOTCHA: Must update the correct nested timeSlot object within the correct day
- **VALIDATE**: `npm run build && npm run lint`

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file modification
npm run lint
npx tsc --noEmit

# Expected: Zero errors
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test time slot generation utility
npm run test -- --grep "generateTimeSlots"

# Test form components
npm run test -- --grep "ReservationTimeSlotFields"

# Full test suite
npm run test:run
```

### Level 3: Integration Testing (System Validation)

```bash
# Start development server
npm run dev &
sleep 5

# Test admin flow
# 1. Navigate to /admin/dashboard/add-reservation
# 2. Enable time slots, configure 1-hour slots
# 3. Verify slots preview shows correct blocks
# 4. Save reservation

# Test client flow
# 1. Navigate to /reservations
# 2. Select a reservation with time slots enabled
# 3. Click on a date and verify slot picker appears
# 4. Select a slot and proceed to payment
```

### Level 4: Manual Verification

```bash
# Verify backward compatibility
# 1. Existing reservations without time slots should work unchanged
# 2. New reservations with time slots disabled should work as before
# 3. Only reservations with enableTimeSlots=true should show slot picker
```

---

## COMPLETION CHECKLIST

- [ ] Model updated with time slot schema
- [ ] Types updated for time slot support
- [ ] Admin form includes time slot configuration
- [ ] API generates time slots correctly
- [ ] Client can see and select time slots
- [ ] Booking flow handles slot selections
- [ ] Backward compatibility maintained
- [ ] All validation gates passed
- [ ] No TypeScript errors
- [ ] No linting errors

---

## Notes

### Design Decisions

1. **Optional Time Slots**: Time slots are optional to maintain backward compatibility. Existing reservations continue to work as day-only selections.

2. **Same Time Requirement**: Time slots only work when `timeType === "same"`. Custom times per day is NOT supported with time slots - it adds too much complexity.

3. **Fixed Slot Duration Options**: Only 3 options per Ashley's requirements:
   - 1 hour (60 minutes)
   - 2 hours (120 minutes)
   - 4 hours (240 minutes)

   These are the ONLY durations clients can book. Admin picks ONE duration per reservation.

4. **Auto-Generated Slots**: System automatically generates slots based on:
   - Operating hours (start time to end time)
   - Selected slot duration
   - Example: 12 PM - 6 PM with 2-hour slots = 3 slots (12-2, 2-4, 4-6)

5. **Clients Select from Pre-Generated Slots**: Clients CANNOT choose duration. They only see and select from the slots Ashley configured. Each slot shows availability.

6. **Per-Slot Capacity**: When time slots are enabled, `maxParticipantsPerSlot` controls capacity. `maxParticipantsPerDay` is ignored.

7. **Duration Validation**: Admin form should disable/warn about duration options that don't fit evenly into operating hours:
   - 5-hour window (e.g., 12-5 PM): 1-hour works (5 slots), 2-hour doesn't fit evenly, 4-hour doesn't fit
   - 6-hour window (e.g., 12-6 PM): All options work (6, 3, or 1.5 slots - round down)

### Migration Considerations

- Existing reservations will not have `enableTimeSlots` field (undefined = false)
- No data migration needed - system defaults to day-only mode
- Admin can edit existing reservations to enable time slots

### UI/UX Notes

- Admin form shows live preview of generated slots
- Client sees slots as clickable cards with availability count
- Sold-out slots should be visually distinct (grayed out) but still visible
- Time format: 12-hour with AM/PM (e.g., "12:00 PM - 2:00 PM")
- Mobile: Stack slots vertically, ensure touch-friendly sizing
