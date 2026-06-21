# PRP: Bookings API Migration (PAID - Requires Square Appointments Plus/Premium)

## Subscription Requirement
**This feature requires Square Appointments Plus ($29/month) or Premium ($69/month) subscription for seller-level booking creation. Without subscription, only customer-facing booking creation is available.**

## Goal
Migrate the custom MongoDB reservation system to Square Bookings API, enabling the business owner to manage all bookings directly from Square Dashboard while the app serves as a customer-facing booking interface.

## Why
- **Single Dashboard**: Business owner manages all bookings from Square instead of custom admin panel
- **Calendar Sync**: Square syncs with Google Calendar, Outlook automatically
- **Client Management**: Bookings automatically linked to Customer Directory
- **Notifications**: Square handles confirmation and reminder emails/SMS
- **No-Show Protection**: Square supports deposits and cancellation policies
- **Staff Management**: If hiring instructors later, multi-staff scheduling built-in
- **Reduced Custom Code**: Remove MongoDB reservation models and scheduling logic

## What
Replace the custom Reservations model and scheduling system with Square Bookings API. The website becomes a booking widget that creates Square bookings, while all management happens in Square Dashboard.

### Success Criteria
- [ ] New reservations created in Square Bookings, not MongoDB
- [ ] Business owner can view/manage all bookings in Square Dashboard
- [ ] Customers can book available time slots through the website
- [ ] Cancellation/rescheduling flows work via Square
- [ ] Booking confirmations sent automatically by Square
- [ ] Existing reservations migrated to Square (one-time)
- [ ] MongoDB Reservations model deprecated/removed

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/docs/bookings-api/use-the-api
  why: Core API documentation for bookings workflow
  critical: Understand service-based booking model

- url: https://developer.squareup.com/reference/square/bookings-api
  why: Complete API reference

- url: https://developer.squareup.com/docs/bookings-api/availability-overview
  why: How to query available time slots
  critical: SearchAvailability returns bookable slots

- url: https://developer.squareup.com/docs/bookings-api/customer-bookings
  why: Customer-initiated booking flow (works without subscription)

- file: lib/models/Reservations.ts
  why: Current reservation model to understand data mapping

- file: app/api/reservations/route.ts
  why: Current reservation API to replace
```

### Current Codebase Tree (relevant files)
```bash
coastal-creations-app/
├── lib/
│   └── models/
│       ├── Reservations.ts         # TO BE REPLACED
│       └── Customer.ts             # MODIFY - link to bookings
├── app/
│   └── api/
│       └── reservations/
│           └── route.ts            # TO BE REPLACED
```

### Desired Codebase Tree
```bash
coastal-creations-app/
├── lib/
│   ├── models/
│   │   └── Customer.ts             # Keep, add bookingIds array
│   └── square/
│       ├── bookings.ts             # NEW - Booking service
│       └── availability.ts         # NEW - Availability queries
├── app/
│   └── api/
│       └── square/
│           └── bookings/
│               ├── route.ts        # NEW - Create bookings
│               ├── [id]/
│               │   └── route.ts    # NEW - Get/update/cancel booking
│               ├── availability/
│               │   └── route.ts    # NEW - Search available slots
│               └── migrate/
│                   └── route.ts    # NEW - One-time migration
├── components/
│   └── booking/
│       ├── AvailabilityCalendar.tsx  # NEW - Show available slots
│       ├── TimeSlotPicker.tsx        # NEW - Select time slot
│       └── BookingConfirmation.tsx   # NEW - Confirm booking details
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Square Bookings requires services in Catalog
// Must create CatalogObject of type ITEM_VARIATION with:
// - item_type: "APPOINTMENTS_SERVICE"
// - service_duration in milliseconds

// CRITICAL: Availability search requires:
// - location_id
// - service_variation_id (from Catalog)
// - start_at (search window start)
// - Optional: staff_member_id, segment_filters

// GOTCHA: Booking versions
// Square bookings have version numbers for optimistic locking
// Must include version when updating/cancelling

// GOTCHA: Customer linking
// Bookings require customer_id (Square Customer, not MongoDB)
// Must create/link Square customer first

// PATTERN: Booking states
// PENDING -> ACCEPTED -> CANCELLED_BY_CUSTOMER/CANCELLED_BY_SELLER
// Or: PENDING -> DECLINED

// GOTCHA: Time zones
// All times in ISO 8601 format
// Square stores in UTC, converts based on location timezone

// SUBSCRIPTION TIERS:
// Free: Customer can book (CreateBooking with customer_id)
// Plus ($29/mo): Seller can create bookings, manage calendar
// Premium ($69/mo): Multi-location, no-show protection
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/types/bookings.ts

export interface BookingSegment {
  serviceVariationId: string;        // From Catalog API
  serviceVariationVersion: bigint;
  teamMemberId?: string;             // Optional staff member
  durationMinutes: number;
}

export interface BookingInput {
  customerId: string;                // Square Customer ID (required)
  locationId: string;
  startAt: string;                   // ISO 8601 datetime
  appointmentSegments: BookingSegment[];
  customerNote?: string;
  sellerNote?: string;
}

export interface TimeSlot {
  startAt: string;
  locationId: string;
  appointmentSegments: Array<{
    serviceVariationId: string;
    durationMinutes: number;
    teamMemberId?: string;
  }>;
}

export interface AvailabilityQuery {
  locationId: string;
  serviceVariationId: string;
  startAtMin: string;                // Search window start
  startAtMax: string;                // Search window end
}

// Mapping from current Reservations model:
// Reservations.title -> Booking.customerNote or service name
// Reservations.pricePerDayPerParticipant -> CatalogItemVariation.price
// Reservations.availableDates -> Availability search results
// Reservations.availableTimes -> Availability.startAt times
```

### List of Tasks

```yaml
Task 0 (PREREQUISITE - Manual):
CONFIGURE Square Dashboard:
  - Subscribe to Appointments Plus or Premium
  - Enable Appointments in Square Dashboard
  - Create services in Catalog (art classes, private events)
  - Set business hours and availability
  - Configure booking policies (cancellation, deposits)

Task 1:
CREATE lib/square/bookings.ts:
  - Implement BookingService class
  - createBooking() - create new booking
  - getBooking() - retrieve by ID
  - updateBooking() - modify booking
  - cancelBooking() - cancel with version
  - listBookings() - list by customer or date range

Task 2:
CREATE lib/square/availability.ts:
  - Implement AvailabilityService class
  - searchAvailability() - find open slots
  - getServiceVariations() - get bookable services
  - Helper to format availability for UI

Task 3:
CREATE app/api/square/bookings/route.ts:
  - POST: Create new booking
  - GET: List bookings (with filters)
  - Requires customerId (Square)

Task 4:
CREATE app/api/square/bookings/[id]/route.ts:
  - GET: Retrieve single booking
  - PUT: Update booking (reschedule)
  - DELETE: Cancel booking

Task 5:
CREATE app/api/square/bookings/availability/route.ts:
  - GET: Search available slots
  - Query params: serviceId, startDate, endDate
  - Returns array of available TimeSlots

Task 6:
CREATE components/booking/AvailabilityCalendar.tsx:
  - Calendar view of available dates
  - Highlight days with availability
  - onClick selects date for time slot view

Task 7:
CREATE components/booking/TimeSlotPicker.tsx:
  - Display available times for selected date
  - Allow selection of time slot
  - Show service duration

Task 8:
MODIFY existing booking flow:
  - FIND: Current reservation creation pages
  - REPLACE: Use new availability + booking components
  - INTEGRATE: With Customer Directory (create Square customer first)
  - PRESERVE: Payment flow integration

Task 9:
CREATE app/api/square/bookings/migrate/route.ts:
  - POST: One-time migration script
  - Query MongoDB reservations
  - Create Square bookings for future reservations
  - Log migration results
  - Mark MongoDB records as migrated

Task 10 (CLEANUP - After verification):
DEPRECATE MongoDB Reservations:
  - Remove lib/models/Reservations.ts
  - Remove app/api/reservations/route.ts
  - Update any references
```

### Task 1 Pseudocode: Booking Service

```typescript
// lib/square/bookings.ts
import { Client, ApiError } from "square";
import { randomUUID } from "crypto";
import { getSquareClient } from "./client";

export class BookingService {
  private client: Client;
  private locationId: string;

  constructor() {
    this.client = getSquareClient();
    this.locationId = process.env.SQUARE_LOCATION_ID!;
  }

  async createBooking(input: {
    customerId: string;
    startAt: string;
    serviceVariationId: string;
    serviceVariationVersion: bigint;
    durationMinutes: number;
    customerNote?: string;
  }): Promise<Booking> {
    const response = await this.client.bookingsApi.createBooking({
      idempotencyKey: randomUUID(),
      booking: {
        locationId: this.locationId,
        customerId: input.customerId,
        startAt: input.startAt,
        appointmentSegments: [
          {
            serviceVariationId: input.serviceVariationId,
            serviceVariationVersion: input.serviceVariationVersion,
            durationMinutes: input.durationMinutes,
          },
        ],
        customerNote: input.customerNote,
      },
    });

    return response.result.booking!;
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    try {
      const response = await this.client.bookingsApi.retrieveBooking(bookingId);
      return response.result.booking || null;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // CRITICAL: Include version for optimistic locking
  async cancelBooking(
    bookingId: string,
    bookingVersion: number
  ): Promise<Booking> {
    const response = await this.client.bookingsApi.cancelBooking(bookingId, {
      idempotencyKey: randomUUID(),
      bookingVersion,
    });

    return response.result.booking!;
  }

  // CRITICAL: Include version for updates
  async rescheduleBooking(
    bookingId: string,
    bookingVersion: number,
    newStartAt: string
  ): Promise<Booking> {
    const response = await this.client.bookingsApi.updateBooking(bookingId, {
      idempotencyKey: randomUUID(),
      booking: {
        version: bookingVersion,
        startAt: newStartAt,
      },
    });

    return response.result.booking!;
  }

  async listCustomerBookings(customerId: string): Promise<Booking[]> {
    const response = await this.client.bookingsApi.listBookings({
      locationId: this.locationId,
      customerId,
    });

    return response.result.bookings || [];
  }
}
```

### Task 2 Pseudocode: Availability Service

```typescript
// lib/square/availability.ts
import { Client } from "square";
import { getSquareClient } from "./client";

export class AvailabilityService {
  private client: Client;
  private locationId: string;

  constructor() {
    this.client = getSquareClient();
    this.locationId = process.env.SQUARE_LOCATION_ID!;
  }

  async searchAvailability(query: {
    serviceVariationId: string;
    startAtMin: string;  // ISO 8601
    startAtMax: string;  // ISO 8601
  }): Promise<TimeSlot[]> {
    const response = await this.client.bookingsApi.searchAvailability({
      query: {
        filter: {
          locationId: this.locationId,
          startAtRange: {
            startAt: query.startAtMin,
            endAt: query.startAtMax,
          },
          segmentFilters: [
            {
              serviceVariationId: query.serviceVariationId,
            },
          ],
        },
      },
    });

    return response.result.availabilities || [];
  }

  // Get all bookable services from Catalog
  async getBookableServices(): Promise<Array<{
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
    version: bigint;
  }>> {
    const response = await this.client.catalogApi.searchCatalogObjects({
      objectTypes: ["ITEM_VARIATION"],
      query: {
        exactQuery: {
          attributeName: "item_variation_data.item_type",
          attributeValue: "APPOINTMENTS_SERVICE",
        },
      },
    });

    return (response.result.objects || []).map((obj) => ({
      id: obj.id,
      name: obj.itemVariationData?.name || "",
      durationMinutes: Number(
        (obj.itemVariationData?.serviceDuration || 0) / 60000
      ), // ms to minutes
      priceCents: Number(obj.itemVariationData?.priceMoney?.amount || 0),
      version: obj.version!,
    }));
  }

  // Helper: Get available dates in range (has at least one slot)
  async getAvailableDates(
    serviceVariationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    const slots = await this.searchAvailability({
      serviceVariationId,
      startAtMin: startDate.toISOString(),
      startAtMax: endDate.toISOString(),
    });

    // Extract unique dates
    const dates = new Set<string>();
    for (const slot of slots) {
      const date = slot.startAt.split("T")[0];
      dates.add(date);
    }

    return Array.from(dates).sort();
  }
}
```

### Task 6 Pseudocode: Availability Calendar Component

```typescript
// components/booking/AvailabilityCalendar.tsx
"use client";

import React, { useState, useEffect } from "react";

interface AvailabilityCalendarProps {
  serviceId: string;
  onDateSelect: (date: string) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  serviceId,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, serviceId]);

  const fetchAvailability = async () => {
    setLoading(true);
    const startDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    try {
      const response = await fetch(
        `/api/square/bookings/availability?` +
          `serviceId=${serviceId}` +
          `&startDate=${startDate.toISOString()}` +
          `&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      // Extract dates that have availability
      const dates = new Set<string>(
        data.slots.map((slot: { startAt: string }) =>
          slot.startAt.split("T")[0]
        )
      );
      setAvailableDates(dates);
    } catch (error) {
      console.error("[AvailabilityCalendar-fetchAvailability] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendarDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const isAvailable = availableDates.has(dateStr);
    const isPast = date < new Date();

    return (
      <button
        key={dateStr}
        disabled={!isAvailable || isPast}
        onClick={() => isAvailable && onDateSelect(dateStr)}
        className={`
          p-2 text-center rounded-md
          ${isAvailable && !isPast
            ? "bg-green-100 hover:bg-green-200 cursor-pointer font-medium"
            : "text-gray-300 cursor-not-allowed"}
          ${isPast ? "opacity-50" : ""}
        `}
      >
        {date.getDate()}
      </button>
    );
  };

  // ... calendar grid rendering logic ...

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(/* prev month */)}>
          Previous
        </button>
        <h3 className="font-bold">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button onClick={() => setCurrentMonth(/* next month */)}>
          Next
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          Loading availability...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Render day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-gray-500 text-sm p-2">
              {day}
            </div>
          ))}
          {/* Render calendar days */}
          {/* ... generate days for current month ... */}
        </div>
      )}
    </div>
  );
};
```

### Integration Points
```yaml
SQUARE_DASHBOARD_SETUP:
  - Enable: Appointments in Square Dashboard settings
  - Create: Services (catalog items with APPOINTMENTS_SERVICE type)
  - Configure: Business hours and availability
  - Set: Booking policies and notifications

CATALOG_INTEGRATION:
  - Services must exist in Catalog before bookings work
  - See: paid/02-catalog-api-migration.md for service setup
  - Link: Services <-> Bookings via serviceVariationId

CUSTOMER_INTEGRATION:
  - Bookings require Square Customer ID
  - See: 01-customer-directory-migration.md
  - Must create/find Square customer before booking

NOTIFICATIONS:
  - Square sends: Confirmation emails/SMS
  - Square sends: Reminder notifications
  - Configure: In Square Dashboard > Notifications
```

## Validation Loop

### Level 1: Syntax & Style
```bash
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app

npx eslint lib/square/bookings.ts --fix
npx eslint lib/square/availability.ts --fix
npx eslint components/booking/*.tsx --fix
npx tsc --noEmit

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// __tests__/lib/square/availability.test.ts
import { AvailabilityService } from "@/lib/square/availability";

describe("AvailabilityService", () => {
  const service = new AvailabilityService();

  // Requires sandbox with services configured
  test.skip("searchAvailability returns time slots", async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const slots = await service.searchAvailability({
      serviceVariationId: "TEST_SERVICE_ID",
      startAtMin: startDate.toISOString(),
      startAtMax: endDate.toISOString(),
    });

    expect(Array.isArray(slots)).toBe(true);
    // Each slot should have startAt
    for (const slot of slots) {
      expect(slot.startAt).toBeDefined();
    }
  });

  test.skip("getBookableServices returns services", async () => {
    const services = await service.getBookableServices();
    expect(Array.isArray(services)).toBe(true);

    for (const svc of services) {
      expect(svc.id).toBeDefined();
      expect(svc.durationMinutes).toBeGreaterThan(0);
    }
  });
});
```

### Level 3: Integration Test
```bash
# Prerequisites:
# 1. Square Appointments Plus subscription active
# 2. At least one service created in Square Catalog
# 3. Business hours configured

# Test availability search
curl "http://localhost:3000/api/square/bookings/availability?\
serviceId=SERVICE_VARIATION_ID&\
startDate=2024-01-15T00:00:00Z&\
endDate=2024-01-22T00:00:00Z"

# Expected: {"slots": [{"startAt": "2024-01-15T10:00:00Z", ...}, ...]}

# Test booking creation (requires customer ID)
curl -X POST http://localhost:3000/api/square/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "SQUARE_CUSTOMER_ID",
    "serviceVariationId": "SERVICE_VARIATION_ID",
    "startAt": "2024-01-15T10:00:00Z"
  }'

# Expected: {"bookingId": "xxx", "status": "ACCEPTED"}

# Verify in Square Dashboard:
# Dashboard > Appointments > Calendar
```

## Final Validation Checklist
- [ ] Square Appointments subscription active (Plus or Premium)
- [ ] Services created in Square Catalog
- [ ] Business hours configured in Square Dashboard
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Availability search returns correct slots
- [ ] Bookings created in Square Dashboard
- [ ] Customer receives confirmation email from Square
- [ ] Calendar shows booked slots as unavailable
- [ ] Cancellation updates Square Dashboard
- [ ] Migration script moves existing reservations

---

## Anti-Patterns to Avoid
- DO NOT create bookings without Square Customer ID
- DO NOT skip version number in updates/cancellations
- DO NOT hardcode service IDs - fetch from Catalog
- DO NOT create services via API without Dashboard setup first
- DO NOT assume UTC - use location timezone for display
- DO NOT migrate without subscription - test in sandbox first
