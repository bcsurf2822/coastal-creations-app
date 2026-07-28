# React Query Integration - Implementation Report

**Date**: December 16, 2024
**Branch**: react-query-integration
**Status**: Core Infrastructure Complete - Ready for Testing

---

## Overview

This report documents the comprehensive integration of TanStack Query v5 (React Query) into the coastal-creations-app. The implementation replaces manual fetch/useEffect patterns with centralized, cached data fetching hooks.

### Goals Achieved
- Centralized data fetching with automatic caching
- Consistent loading and error state management
- Automatic cache invalidation on mutations
- React Query DevTools integration for debugging
- Backwards-compatible migration path

---

## Infrastructure Setup

### 1. QueryClient Configuration

**File**: `app/get-query-client.ts`

```typescript
import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,      // 1 minute
        gcTime: 5 * 60 * 1000,     // 5 minutes
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
```

**Purpose**: Singleton pattern for Next.js App Router - creates fresh client on server, reuses on browser.

### 2. Provider Component

**File**: `app/providers.tsx`

```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./get-query-client";
import type { ReactElement, ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): ReactElement {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
```

### 3. Root Layout Integration

**File**: `app/layout.tsx`

The Providers component wraps the application in the root layout, making React Query available throughout the app.

---

## Query Hooks Created

All query hooks are located in `hooks/queries/` with a barrel export at `hooks/queries/index.ts`.

### Core Content Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `useHours` | `use-hours.ts` | `["hours"]` | Fetch business hours of operation |
| `usePageContent` | `use-page-content.ts` | `["pageContent"]` | CMS page content (backwards-compatible API) |

### Event Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `useEvents` | `use-events.ts` | `["events", type?]` | Fetch events with optional type filter |
| `useEvent` | `use-event.ts` | `["event", id]` | Fetch single event by ID |

### Customer Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `useCustomers` | `use-customers.ts` | `["customers", eventId?, eventType?]` | Fetch customer bookings with filtering |

### Reservation Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `useReservations` | `use-reservations.ts` | `["reservations", type?, fromDate?, toDate?]` | Fetch reservations with date filtering |
| `useReservation` | `use-reservation.ts` | `["reservation", id]` | Fetch single reservation by ID |

### Private Event Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `usePrivateEvents` | `use-private-events.ts` | `["privateEvents"]` | Fetch all private event offerings |
| `usePrivateEvent` | `use-private-event.ts` | `["privateEvent", id]` | Fetch single private event by ID |

### Gallery & Media Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `useGallery` | `use-gallery.ts` | `["gallery", destination?]` | Fetch gallery images with destination filter |
| `useEventPictures` | `use-event-pictures.ts` | `["eventPictures"]` | Fetch event pictures from Sanity |
| `usePrivateEventPictures` | `use-private-event-pictures.ts` | `["privateEventPictures"]` | Fetch private event pictures |

### Payment Hooks

| Hook | File | Query Key | Purpose |
|------|------|-----------|---------|
| `usePaymentConfig` | `use-payment-config.ts` | `["paymentConfig"]` | Fetch Square payment configuration |
| `usePaymentErrors` | `use-payment-errors.ts` | `["paymentErrors", limit?, eventId?, customerEmail?]` | Fetch payment error logs |

### Barrel Export

**File**: `hooks/queries/index.ts`

```typescript
// Core hooks
export { useHours } from "./use-hours";
export { usePageContent, useInvalidatePageContent } from "./use-page-content";

// Events & Customers
export { useEvents } from "./use-events";
export { useEvent } from "./use-event";
export { useCustomers } from "./use-customers";

// Reservations
export { useReservations } from "./use-reservations";
export { useReservation } from "./use-reservation";

// Private Events
export { usePrivateEvents } from "./use-private-events";
export { usePrivateEvent } from "./use-private-event";

// Gallery & Pictures
export { useGallery } from "./use-gallery";
export { useEventPictures } from "./use-event-pictures";
export { usePrivateEventPictures } from "./use-private-event-pictures";

// Payment
export { usePaymentConfig } from "./use-payment-config";
export { usePaymentErrors } from "./use-payment-errors";
```

---

## Mutation Hooks Created

All mutation hooks are located in `hooks/mutations/` with a barrel export at `hooks/mutations/index.ts`.

### Event Mutations

| Hook | File | Invalidates | Purpose |
|------|------|-------------|---------|
| `useCreateEvent` | `use-create-event.ts` | `["events"]` | Create new event |
| `useUpdateEvent` | `use-update-event.ts` | `["events"]`, `["event", id]` | Update existing event |
| `useDeleteEvent` | `use-delete-event.ts` | `["events"]` | Delete event |

### Customer Mutations

| Hook | File | Invalidates | Purpose |
|------|------|-------------|---------|
| `useCreateCustomer` | `use-create-customer.ts` | `["customers"]`, `["events"]` | Create customer booking |

### Reservation Mutations

| Hook | File | Invalidates | Purpose |
|------|------|-------------|---------|
| `useCreateReservation` | `use-create-reservation.ts` | `["reservations"]` | Create new reservation |
| `useUpdateReservation` | `use-update-reservation.ts` | `["reservations"]`, `["reservation", id]` | Update reservation |
| `useDeleteReservation` | `use-delete-reservation.ts` | `["reservations"]` | Delete reservation |

### Refund Mutations

| Hook | File | Invalidates | Purpose |
|------|------|-------------|---------|
| `useProcessRefund` | `use-process-refund.ts` | `["customers"]` | Process Square refund |

### Admin Mutations

| Hook | File | Invalidates | Purpose |
|------|------|-------------|---------|
| `useUpdateHours` | `use-update-hours.ts` | `["hours"]` | Update business hours |

### Barrel Export

**File**: `hooks/mutations/index.ts`

```typescript
// Event mutations
export { useCreateEvent } from "./use-create-event";
export { useUpdateEvent } from "./use-update-event";
export { useDeleteEvent } from "./use-delete-event";

// Customer mutations
export { useCreateCustomer } from "./use-create-customer";

// Reservation mutations
export { useCreateReservation } from "./use-create-reservation";
export { useUpdateReservation } from "./use-update-reservation";
export { useDeleteReservation } from "./use-delete-reservation";

// Refund mutations
export { useProcessRefund } from "./use-process-refund";

// Hours mutations
export { useUpdateHours } from "./use-update-hours";
```

---

## Components Migrated

### Fully Migrated Components

| Component | File Path | Hooks Used |
|-----------|-----------|------------|
| `Calendar` | `components/landing/Calendar.tsx` | `useEvents`, `useCustomers` |
| `Hero` | `components/landing/Hero.tsx` | `usePageContent` |
| `MainSection` | `components/landing/MainSection.tsx` | `usePageContent` |
| `Offerings` | `components/landing/Offerings.tsx` | `usePageContent` |
| `About` | `components/about/About.tsx` | `usePageContent` |
| `AdultClasses` | `app/events/adult-classes/page.tsx` | `usePageContent` |
| `KidClasses` | `app/events/kid-classes/page.tsx` | `usePageContent` |
| `Camps` | `app/events/camps/page.tsx` | `usePageContent` |
| `Reservations` | `app/reservations/page.tsx` | `usePageContent` |
| `Gallery` | `app/gallery/page.tsx` | `usePageContent` |

### Migration Pattern Used

**Before (manual fetch)**:
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/endpoint')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    });
}, []);
```

**After (React Query)**:
```typescript
import { useEndpoint } from "@/hooks/queries";

const { data, isLoading, error } = useEndpoint();
```

---

## File Structure

```
hooks/
├── queries/
│   ├── index.ts                    # Barrel export
│   ├── use-hours.ts                # Business hours
│   ├── use-page-content.ts         # CMS content
│   ├── use-events.ts               # Events list
│   ├── use-event.ts                # Single event
│   ├── use-customers.ts            # Customer bookings
│   ├── use-reservations.ts         # Reservations list
│   ├── use-reservation.ts          # Single reservation
│   ├── use-private-events.ts       # Private events list
│   ├── use-private-event.ts        # Single private event
│   ├── use-gallery.ts              # Gallery images
│   ├── use-event-pictures.ts       # Event pictures
│   ├── use-private-event-pictures.ts # Private event pictures
│   ├── use-payment-config.ts       # Square config
│   └── use-payment-errors.ts       # Payment errors
│
├── mutations/
│   ├── index.ts                    # Barrel export
│   ├── use-create-event.ts         # Create event
│   ├── use-update-event.ts         # Update event
│   ├── use-delete-event.ts         # Delete event
│   ├── use-create-customer.ts      # Create booking
│   ├── use-create-reservation.ts   # Create reservation
│   ├── use-update-reservation.ts   # Update reservation
│   ├── use-delete-reservation.ts   # Delete reservation
│   ├── use-process-refund.ts       # Process refund
│   └── use-update-hours.ts         # Update hours
│
app/
├── get-query-client.ts             # QueryClient factory
├── providers.tsx                   # QueryClientProvider wrapper
└── layout.tsx                      # Root layout (wraps with Providers)
```

---

## Query Key Hierarchy

The query keys follow a hierarchical structure for efficient cache invalidation:

```
["hours"]
["pageContent"]
["events"]
["events", type]
["event", id]
["customers"]
["customers", eventId, eventType]
["reservations"]
["reservations", type, fromDate, toDate]
["reservation", id]
["privateEvents"]
["privateEvent", id]
["gallery"]
["gallery", destination]
["eventPictures"]
["privateEventPictures"]
["paymentConfig"]
["paymentErrors"]
["paymentErrors", limit, eventId, customerEmail]
```

---

## Configuration Defaults

| Setting | Value | Purpose |
|---------|-------|---------|
| `staleTime` | 60,000ms (1 min) | Data considered fresh for 1 minute |
| `gcTime` | 300,000ms (5 min) | Unused data garbage collected after 5 minutes |
| `retry` | 1 | Retry failed requests once |
| `refetchOnWindowFocus` | true | Refetch when user returns to tab |

---

## Testing Instructions

### 1. Start Development Server
```bash
npm run dev
```

### 2. Verify React Query DevTools
- Look for the React Query logo in the bottom-right corner
- Click to open DevTools panel
- Should show cached queries as you navigate

### 3. Test Key Flows

**Homepage**:
- Verify Hero, MainSection, Offerings load correctly
- Check DevTools for `pageContent` query
- Check Calendar loads with `events` query

**Event Pages**:
- Navigate to `/events/adult-classes`
- Verify page content loads
- Check DevTools for cached queries

**Cache Behavior**:
- Navigate away and back to a page
- Data should load instantly from cache
- No loading spinner on cached data

### 4. Validate Build
```bash
npm run build
```

Build completed successfully with no TypeScript errors.

---

## Deprecated Files

The following file has been deprecated but kept for backwards compatibility:

| File | Status | Replacement |
|------|--------|-------------|
| `hooks/usePageContent.ts` | Deprecated | `hooks/queries/use-page-content.ts` |

The deprecated file now re-exports from the new location with a console warning.

---

## Remaining Work (Phase 8)

### Components Pending Migration

These components still use manual fetch patterns and should be migrated:

1. **Admin Forms**
   - `AddEventForm` - Use `useCreateEvent`
   - `EditEventForm` - Use `useUpdateEvent`, `useEvent`
   - `ReservationForm` - Use `useCreateReservation`, `useUpdateReservation`
   - `PrivateEventForm` - Similar pattern

2. **Admin Lists**
   - `CustomersList` - Use `useCustomers`
   - `ReservationsList` - Use `useReservations`
   - `ErrorLogsList` - Use `usePaymentErrors`

3. **Gallery Components**
   - `GalleryUploadForm` - Use `useGallery` mutations
   - `ImageGallery` - Use `useGallery`

4. **Payment Components**
   - `Payment.tsx` - Use `usePaymentConfig`

### Cleanup Tasks

1. Remove deprecated `hooks/usePageContent.ts` after confirming all imports updated
2. Add error boundary components for query error states
3. Consider adding optimistic updates to mutations
4. Add prefetching for anticipated navigations

---

## Dependencies

**Package**: `@tanstack/react-query` v5.x
**DevTools**: `@tanstack/react-query-devtools` v5.x

Both packages were already installed in the project.

---

## Reference Implementation

The implementation follows patterns from:
- `/Users/benjamincorbett/code/apps/cover-letter-builder/frontend`
- TanStack Query v5 official documentation

---

## Build Verification

```
npm run build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (70/70)
✓ Finalizing page optimization
✓ Collecting build traces
```

No TypeScript errors. Only pre-existing warnings (unrelated to React Query).
