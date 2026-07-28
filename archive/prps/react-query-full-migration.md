name: "React Query Full Migration PRP - Complete Application Integration"
description: |

## Purpose
Complete migration of all data fetching operations in the coastal-creations-app to TanStack Query v5, replacing manual fetch/useEffect patterns with a unified, cached, and efficient data management solution.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Migrate in phases, validate each phase before proceeding
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Migrate all 32+ API endpoints and 10+ data-fetching components to use TanStack Query v5, establishing consistent patterns for queries, mutations, caching, and invalidation across the entire application.

## Why
- **14 GET endpoints** currently fetched via manual useEffect patterns
- **11 POST, 6 PUT, 6 DELETE endpoints** without mutation state management
- **Duplicate fetches**: Calendar.tsx, EventsContainer.tsx, and NewCalendar.tsx all fetch `/api/events` independently
- **Manual caching**: usePageContent.ts implements custom caching that React Query handles natively
- **No background refetching**: Data becomes stale without user awareness
- **Inconsistent error handling**: Each component implements its own try/catch pattern
- **No optimistic updates**: User waits for server response before UI updates

## What

### Query Hooks to Create (14 total)
| Hook Name | Endpoint | Used By |
|-----------|----------|---------|
| `useHours` | GET /api/hours | DONE (pilot) |
| `usePageContent` | GET /api/page-content | Calendar, Offerings, ReservationsPage |
| `useEvents` | GET /api/events | Calendar, EventsContainer, NewCalendar, EventContainer |
| `useEvent` | GET /api/event/[id] | Event detail pages |
| `useCustomers` | GET /api/customer | Calendar, EventsContainer, Customers, EventContainer |
| `useReservations` | GET /api/reservations | ReservationList |
| `useReservation` | GET /api/reservations/[id] | Reservation detail/edit |
| `usePrivateEvents` | GET /api/private-events | PrivateEvents component |
| `usePrivateEvent` | GET /api/private-events/[id] | Private event detail/edit |
| `useGallery` | GET /api/gallery | ImageGallery, GalleryCarousel |
| `useEventPictures` | GET /api/eventPictures | EventsContainer |
| `usePrivateEventPictures` | GET /api/privateEventPictures | Private event displays |
| `usePaymentConfig` | GET /api/payment-config | Payment components |
| `usePaymentErrors` | GET /api/payment-errors | Error logs dashboard |

### Mutation Hooks to Create (17 total)
| Hook Name | Endpoint | Method | Invalidates |
|-----------|----------|--------|-------------|
| `useCreateEvent` | /api/events | POST | ["events"] |
| `useUpdateEvent` | /api/events/[id] | PUT | ["events"], ["event", id] |
| `useDeleteEvent` | /api/events | DELETE | ["events"] |
| `useCreateCustomer` | /api/customer | POST | ["customers"], ["events"] |
| `useCreateReservation` | /api/reservations | POST | ["reservations"] |
| `useUpdateReservation` | /api/reservations/[id] | PUT | ["reservations"], ["reservation", id] |
| `useDeleteReservation` | /api/reservations | DELETE | ["reservations"] |
| `useCreatePrivateEvent` | /api/private-events | POST | ["private-events"] |
| `useUpdatePrivateEvent` | /api/private-events | PUT | ["private-events"], ["private-event", id] |
| `useDeletePrivateEvent` | /api/private-events | DELETE | ["private-events"] |
| `useUploadGalleryImages` | /api/gallery | POST | ["gallery"] |
| `useUpdateGalleryImage` | /api/gallery | PUT | ["gallery"] |
| `useDeleteGalleryImage` | /api/gallery | DELETE | ["gallery"] |
| `useProcessRefund` | /api/refunds | POST | ["customers"], ["refunds"] |
| `useUpdatePageContent` | /api/page-content | PUT | ["page-content"] |
| `useUpdateHours` | /api/hours | PUT | ["hours"] |
| `useContactForm` | /api/contact | POST | None |

### Success Criteria
- [ ] All 14 query hooks created and typed
- [ ] All 17 mutation hooks created with proper invalidation
- [ ] usePageContent.ts deprecated and replaced
- [ ] All components migrated to use hooks
- [ ] No duplicate API calls (verified via Network tab)
- [ ] Build passes without errors
- [ ] Lint passes without errors
- [ ] Manual testing of all migrated features

## All Needed Context

### Documentation & References
```yaml
# Primary source of truth
- url: https://tanstack.com/query/v5/docs/framework/react/guides/queries
  why: Query patterns, staleTime, enabled, select

- url: https://tanstack.com/query/v5/docs/framework/react/guides/mutations
  why: Mutation patterns, onSuccess, invalidation

- url: https://tanstack.com/query/v5/docs/framework/react/guides/query-keys
  why: Query key structure, hierarchical invalidation

- url: https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation
  why: Cache invalidation strategies

# Existing Files (Read Before Implementing)
- file: hooks/queries/use-hours.ts
  why: Reference implementation pattern (already created)

- file: hooks/usePageContent.ts
  why: Manual caching to replace - preserve API for backwards compatibility

- file: components/landing/Calendar.tsx
  why: Multiple fetches pattern - needs consolidation

- file: components/dashboard/customers/Customers.tsx
  why: Complex component with GET + POST refunds

- file: types/hours.ts
  why: Type patterns for API responses

- file: types/interfaces.ts
  why: Shared interfaces (IEvent, ICustomer, etc.)

- file: lib/types/eventTypes.ts
  why: Event type definitions

- file: lib/types/reservationTypes.ts
  why: Reservation type definitions
```

### Query Key Convention
```typescript
// STANDARD: Use hierarchical arrays for all query keys
// This enables efficient invalidation

// List queries (no ID)
queryKey: ["events"]                          // All events
queryKey: ["events", { type: "class" }]       // Filtered events
queryKey: ["customers"]                       // All customers
queryKey: ["customers", { eventId: "123" }]   // Filtered customers

// Single item queries (with ID)
queryKey: ["event", eventId]                  // Single event
queryKey: ["reservation", reservationId]      // Single reservation
queryKey: ["private-event", privateEventId]   // Single private event

// Special queries
queryKey: ["page-content"]                    // Singleton (no ID)
queryKey: ["hours"]                           // Singleton (no ID)
queryKey: ["payment-config"]                  // Singleton (no ID)
queryKey: ["gallery", { destination }]        // Filtered by destination

// INVALIDATION EXAMPLES:
// invalidateQueries({ queryKey: ["events"] })     // Invalidates ALL event queries
// invalidateQueries({ queryKey: ["event", id] })  // Invalidates specific event only
```

### API Response Patterns
```typescript
// SUCCESS RESPONSES (standardized across API):
{ success: true, data: T }              // Single item
{ success: true, events: T[] }          // Events list
{ success: true, reservations: T[] }    // Reservations list
{ success: true, privateEvents: T[] }   // Private events list

// ERROR RESPONSES:
{ error: "Error message" }
{ success: false, error: "Error message" }

// PATTERN: Extract data in queryFn
async function fetchEvents(): Promise<IEvent[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "API error");
  return result.events; // Extract the actual data
}
```

### Known Gotchas
```typescript
// GOTCHA: Events API returns { events: [] } not { data: [] }
// GOTCHA: Customer API returns { data: [] }
// GOTCHA: Reservations API returns { reservations: [] }
// CHECK each endpoint's response shape before implementing

// GOTCHA: Some components use eventType filter for customers
// /api/customer?eventId=X&eventType=Event|PrivateEvent|Reservation

// GOTCHA: Gallery filter uses comma-separated destinations
// /api/gallery?destination=adult-class,kid-class

// GOTCHA: usePageContent has clearPageContentCache() - components may call it
// Need to expose queryClient.invalidateQueries for admin components

// CRITICAL: Don't break existing component APIs during migration
// Keep prop interfaces the same, just change internal implementation
```

## Implementation Blueprint

### Directory Structure After Migration
```
hooks/
├── queries/
│   ├── index.ts                    # Barrel export all queries
│   ├── use-hours.ts                # DONE
│   ├── use-page-content.ts         # Phase 1
│   ├── use-events.ts               # Phase 2
│   ├── use-event.ts                # Phase 2
│   ├── use-customers.ts            # Phase 2
│   ├── use-reservations.ts         # Phase 3
│   ├── use-reservation.ts          # Phase 3
│   ├── use-private-events.ts       # Phase 3
│   ├── use-private-event.ts        # Phase 3
│   ├── use-gallery.ts              # Phase 4
│   ├── use-event-pictures.ts       # Phase 4
│   ├── use-private-event-pictures.ts # Phase 4
│   ├── use-payment-config.ts       # Phase 4
│   └── use-payment-errors.ts       # Phase 4
├── mutations/
│   ├── index.ts                    # Barrel export all mutations
│   ├── use-create-event.ts         # Phase 5
│   ├── use-update-event.ts         # Phase 5
│   ├── use-delete-event.ts         # Phase 5
│   ├── use-create-customer.ts      # Phase 5
│   ├── use-create-reservation.ts   # Phase 6
│   ├── use-update-reservation.ts   # Phase 6
│   ├── use-delete-reservation.ts   # Phase 6
│   ├── use-create-private-event.ts # Phase 6
│   ├── use-update-private-event.ts # Phase 6
│   ├── use-delete-private-event.ts # Phase 6
│   ├── use-upload-gallery.ts       # Phase 7
│   ├── use-update-gallery.ts       # Phase 7
│   ├── use-delete-gallery.ts       # Phase 7
│   ├── use-process-refund.ts       # Phase 7
│   ├── use-update-page-content.ts  # Phase 7
│   └── use-update-hours.ts         # Phase 7
└── index.ts                        # Re-export queries and mutations
```

---

## Phase 1: Replace usePageContent Hook

### Task 1.1: Create use-page-content.ts Query Hook
```typescript
// hooks/queries/use-page-content.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PageContent } from "@/types/pageContent";

interface PageContentResponse {
  success: boolean;
  data: PageContent;
}

async function fetchPageContent(): Promise<PageContent> {
  const response = await fetch("/api/page-content");
  if (!response.ok) throw new Error("Failed to fetch page content");
  const result: PageContentResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.data;
}

export function usePageContent() {
  return useQuery<PageContent, Error>({
    queryKey: ["page-content"],
    queryFn: fetchPageContent,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches old cache behavior)
    gcTime: 30 * 60 * 1000,   // 30 minutes
  });
}

// For backwards compatibility with clearPageContentCache()
export function useInvalidatePageContent() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["page-content"] });
}
```

### Task 1.2: Update Barrel Export
```typescript
// hooks/queries/index.ts
export { useHours } from "./use-hours";
export { usePageContent, useInvalidatePageContent } from "./use-page-content";
```

### Task 1.3: Migrate Calendar.tsx to use usePageContent
MODIFY `components/landing/Calendar.tsx`:
- Replace `import { usePageContent } from "@/hooks/usePageContent"` with `import { usePageContent } from "@/hooks/queries"`
- The API remains the same: `const { content, isLoading } = usePageContent()`
- Note: React Query returns `data` not `content`, may need adapter

### Task 1.4: Deprecate Old Hook
MODIFY `hooks/usePageContent.ts`:
```typescript
// Add deprecation notice at top
/**
 * @deprecated Use usePageContent from @/hooks/queries instead
 * This hook will be removed in a future version
 */
```

---

## Phase 2: Events & Customers Queries (High Impact)

### Task 2.1: Create use-events.ts Query Hook
```typescript
// hooks/queries/use-events.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IEvent } from "@/types/interfaces";

interface EventsResponse {
  success: boolean;
  events: IEvent[];
}

interface UseEventsOptions {
  type?: "class" | "camp" | "workshop" | "artist";
  enabled?: boolean;
}

async function fetchEvents(type?: string): Promise<IEvent[]> {
  const url = type ? `/api/events?type=${type}` : "/api/events";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch events");
  const result: EventsResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.events;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { type, enabled = true } = options;

  return useQuery<IEvent[], Error>({
    queryKey: type ? ["events", { type }] : ["events"],
    queryFn: () => fetchEvents(type),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });
}
```

### Task 2.2: Create use-event.ts Query Hook (Single Event)
```typescript
// hooks/queries/use-event.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IEvent } from "@/types/interfaces";

interface EventResponse {
  success: boolean;
  data: IEvent;
}

async function fetchEvent(eventId: string): Promise<IEvent> {
  const response = await fetch(`/api/event/${eventId}`);
  if (!response.ok) throw new Error("Failed to fetch event");
  const result: EventResponse = await response.json();
  return result.data;
}

export function useEvent(eventId: string | null, enabled: boolean = true) {
  return useQuery<IEvent, Error>({
    queryKey: ["event", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID required");
      return fetchEvent(eventId);
    },
    enabled: !!eventId && enabled,
    staleTime: 2 * 60 * 1000,
  });
}
```

### Task 2.3: Create use-customers.ts Query Hook
```typescript
// hooks/queries/use-customers.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { ICustomer } from "@/types/interfaces";

interface CustomersResponse {
  success: boolean;
  data: ICustomer[];
}

interface UseCustomersOptions {
  eventId?: string;
  eventType?: "Event" | "PrivateEvent" | "Reservation";
  enabled?: boolean;
}

async function fetchCustomers(options: UseCustomersOptions): Promise<ICustomer[]> {
  const params = new URLSearchParams();
  if (options.eventId) params.append("eventId", options.eventId);
  if (options.eventType) params.append("eventType", options.eventType);

  const url = params.toString() ? `/api/customer?${params}` : "/api/customer";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch customers");
  const result: CustomersResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.data;
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const { eventId, eventType, enabled = true } = options;

  // Build query key based on filters
  const queryKey = eventId
    ? ["customers", { eventId, eventType }]
    : ["customers"];

  return useQuery<ICustomer[], Error>({
    queryKey,
    queryFn: () => fetchCustomers({ eventId, eventType }),
    staleTime: 1 * 60 * 1000, // 1 minute (customers change more frequently)
    enabled,
  });
}
```

### Task 2.4: Update Barrel Export
```typescript
// hooks/queries/index.ts
export { useHours } from "./use-hours";
export { usePageContent, useInvalidatePageContent } from "./use-page-content";
export { useEvents } from "./use-events";
export { useEvent } from "./use-event";
export { useCustomers } from "./use-customers";
```

### Task 2.5: Migrate Calendar.tsx
MODIFY `components/landing/Calendar.tsx`:
- Remove fetch useEffect for events
- Remove fetch useEffect for customers
- Add: `import { useEvents, useCustomers, usePageContent } from "@/hooks/queries"`
- Replace manual state with hook destructuring
- Combine loading states: `isLoading: eventsLoading || customersLoading || contentLoading`

### Task 2.6: Migrate EventsContainer.tsx
MODIFY `components/classes/EventsContainer.tsx`:
- Similar pattern to Calendar.tsx
- Note: Uses optional `fetchParticipantCounts` config - use `enabled` option

### Task 2.7: Migrate NewCalendar.tsx
MODIFY `components/calendar/NewCalendar.tsx`:
- Same pattern as Calendar.tsx

### Task 2.8: Migrate EventContainer.tsx (Dashboard)
MODIFY `components/dashboard/home/EventContainer.tsx`:
- Uses events + customers
- Also has DELETE - will use mutation in Phase 5

---

## Phase 3: Reservations & Private Events Queries

### Task 3.1: Create use-reservations.ts
```typescript
// hooks/queries/use-reservations.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IReservation } from "@/lib/types/reservationTypes";

interface ReservationsResponse {
  success: boolean;
  reservations: IReservation[];
}

interface UseReservationsOptions {
  type?: string;
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
}

async function fetchReservations(options: UseReservationsOptions): Promise<IReservation[]> {
  const params = new URLSearchParams();
  if (options.type) params.append("type", options.type);
  if (options.fromDate) params.append("fromDate", options.fromDate);
  if (options.toDate) params.append("toDate", options.toDate);

  const url = params.toString() ? `/api/reservations?${params}` : "/api/reservations";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch reservations");
  const result: ReservationsResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.reservations;
}

export function useReservations(options: UseReservationsOptions = {}) {
  const { type, fromDate, toDate, enabled = true } = options;

  return useQuery<IReservation[], Error>({
    queryKey: ["reservations", { type, fromDate, toDate }],
    queryFn: () => fetchReservations({ type, fromDate, toDate }),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}
```

### Task 3.2: Create use-reservation.ts (Single)
```typescript
// hooks/queries/use-reservation.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IReservation } from "@/lib/types/reservationTypes";

async function fetchReservation(id: string): Promise<IReservation> {
  const response = await fetch(`/api/reservations/${id}`);
  if (!response.ok) throw new Error("Failed to fetch reservation");
  const result = await response.json();
  return result.data || result;
}

export function useReservation(id: string | null, enabled: boolean = true) {
  return useQuery<IReservation, Error>({
    queryKey: ["reservation", id],
    queryFn: () => {
      if (!id) throw new Error("Reservation ID required");
      return fetchReservation(id);
    },
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000,
  });
}
```

### Task 3.3: Create use-private-events.ts
```typescript
// hooks/queries/use-private-events.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IPrivateEvent } from "@/types/interfaces";

interface PrivateEventsResponse {
  success: boolean;
  privateEvents: IPrivateEvent[];
}

async function fetchPrivateEvents(): Promise<IPrivateEvent[]> {
  const response = await fetch("/api/private-events");
  if (!response.ok) throw new Error("Failed to fetch private events");
  const result: PrivateEventsResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.privateEvents;
}

export function usePrivateEvents(enabled: boolean = true) {
  return useQuery<IPrivateEvent[], Error>({
    queryKey: ["private-events"],
    queryFn: fetchPrivateEvents,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
```

### Task 3.4: Create use-private-event.ts (Single)
```typescript
// hooks/queries/use-private-event.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { IPrivateEvent } from "@/types/interfaces";

async function fetchPrivateEvent(id: string): Promise<IPrivateEvent> {
  const response = await fetch(`/api/private-events/${id}`);
  if (!response.ok) throw new Error("Failed to fetch private event");
  const result = await response.json();
  return result.data || result;
}

export function usePrivateEvent(id: string | null, enabled: boolean = true) {
  return useQuery<IPrivateEvent, Error>({
    queryKey: ["private-event", id],
    queryFn: () => {
      if (!id) throw new Error("Private event ID required");
      return fetchPrivateEvent(id);
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Task 3.5: Migrate ReservationList.tsx
### Task 3.6: Migrate PrivateEvents.tsx

---

## Phase 4: Gallery & Utility Queries

### Task 4.1: Create use-gallery.ts
```typescript
// hooks/queries/use-gallery.ts
"use client";

import { useQuery } from "@tanstack/react-query";

interface GalleryImage {
  _id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  destinations?: string[];
}

interface GalleryResponse {
  success: boolean;
  data: GalleryImage[];
}

interface UseGalleryOptions {
  destination?: string; // Comma-separated: "adult-class,kid-class"
  enabled?: boolean;
}

async function fetchGallery(destination?: string): Promise<GalleryImage[]> {
  const url = destination ? `/api/gallery?destination=${destination}` : "/api/gallery";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch gallery");
  const result: GalleryResponse = await response.json();
  if (!result.success) throw new Error("API returned unsuccessful response");
  return result.data;
}

export function useGallery(options: UseGalleryOptions = {}) {
  const { destination, enabled = true } = options;

  return useQuery<GalleryImage[], Error>({
    queryKey: destination ? ["gallery", { destination }] : ["gallery"],
    queryFn: () => fetchGallery(destination),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
```

### Task 4.2: Create use-event-pictures.ts
### Task 4.3: Create use-private-event-pictures.ts
### Task 4.4: Create use-payment-config.ts
### Task 4.5: Create use-payment-errors.ts
### Task 4.6: Migrate ImageGallery.tsx
### Task 4.7: Migrate GalleryCarousel.tsx

---

## Phase 5: Event Mutations

### Task 5.1: Create use-create-event.ts
```typescript
// hooks/mutations/use-create-event.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IEvent } from "@/types/interfaces";

interface CreateEventResponse {
  success: boolean;
  data: IEvent;
}

async function createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create event");
  }
  const result: CreateEventResponse = await response.json();
  return result.data;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<IEvent, Error, Partial<IEvent>>({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidate all event queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("[use-create-event] Error:", error.message);
    },
  });
}
```

### Task 5.2: Create use-update-event.ts
```typescript
// hooks/mutations/use-update-event.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IEvent } from "@/types/interfaces";

interface UpdateEventParams {
  id: string;
  data: Partial<IEvent>;
}

async function updateEvent({ id, data }: UpdateEventParams): Promise<IEvent> {
  const response = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update event");
  }
  const result = await response.json();
  return result.data;
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<IEvent, Error, UpdateEventParams>({
    mutationFn: updateEvent,
    onSuccess: (data, variables) => {
      // Invalidate both list and specific event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
    },
    onError: (error) => {
      console.error("[use-update-event] Error:", error.message);
    },
  });
}
```

### Task 5.3: Create use-delete-event.ts
```typescript
// hooks/mutations/use-delete-event.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/events?id=${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete event");
  }
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("[use-delete-event] Error:", error.message);
    },
  });
}
```

### Task 5.4: Create use-create-customer.ts
### Task 5.5: Update mutations barrel export
### Task 5.6: Migrate AddEventForm.tsx
### Task 5.7: Migrate EditEventForm.tsx
### Task 5.8: Migrate EventContainer.tsx (DELETE functionality)

---

## Phase 6: Reservation & Private Event Mutations

### Task 6.1: Create use-create-reservation.ts
### Task 6.2: Create use-update-reservation.ts
### Task 6.3: Create use-delete-reservation.ts
### Task 6.4: Create use-create-private-event.ts
### Task 6.5: Create use-update-private-event.ts
### Task 6.6: Create use-delete-private-event.ts
### Task 6.7: Migrate AddReservationForm.tsx
### Task 6.8: Migrate EditReservationForm.tsx
### Task 6.9: Migrate AddPrivateEventForm.tsx
### Task 6.10: Migrate EditPrivateEventForm.tsx

---

## Phase 7: Gallery & Admin Mutations

### Task 7.1: Create use-upload-gallery.ts (replaces useGalleryUpload)
### Task 7.2: Create use-update-gallery.ts
### Task 7.3: Create use-delete-gallery.ts
### Task 7.4: Create use-process-refund.ts
### Task 7.5: Create use-update-page-content.ts
### Task 7.6: Create use-update-hours.ts
### Task 7.7: Migrate GalleryUploadForm.tsx
### Task 7.8: Migrate Customers.tsx (refund functionality)
### Task 7.9: Migrate admin page content editors
### Task 7.10: Migrate admin hours editor

---

## Phase 8: Cleanup & Deprecation

### Task 8.1: Remove old usePageContent.ts (after all components migrated)
### Task 8.2: Remove useGalleryUpload.ts hook (after migration)
### Task 8.3: Remove all inline fetch() calls from components
### Task 8.4: Update any remaining direct fetch imports
### Task 8.5: Final audit - search for remaining fetch( patterns

---

## Validation Loop

### Level 1: Per-Phase Validation
```bash
# After each phase, run:
npm run lint
npm run build

# Expected: No errors
```

### Level 2: Component Testing
```bash
# After migrating each component:
npm run dev

# Navigate to the affected page
# Verify:
# 1. Data loads correctly
# 2. No console errors
# 3. React Query DevTools shows query
# 4. Network tab shows single request (not duplicate)
```

### Level 3: Cache Verification
```bash
# For each query hook:
# 1. Load page with data
# 2. Navigate away
# 3. Navigate back
# 4. Verify: No new network request (cached)
# 5. Open DevTools > Query shows "fresh" or "stale" (not "fetching")
```

### Level 4: Mutation Verification
```bash
# For each mutation hook:
# 1. Perform the action (create/update/delete)
# 2. Verify: Action completes
# 3. Verify: Related queries are invalidated (list refreshes)
# 4. Verify: Toast notification appears (if applicable)
```

## Final Validation Checklist
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] All 14 query hooks created and exported
- [ ] All 17 mutation hooks created and exported
- [ ] All components migrated (no remaining fetch/useEffect patterns)
- [ ] usePageContent.ts removed or deprecated
- [ ] useGalleryUpload.ts removed or deprecated
- [ ] Network tab shows no duplicate requests
- [ ] React Query DevTools shows all active queries
- [ ] All CRUD operations work correctly
- [ ] Admin dashboard functions properly
- [ ] Customer-facing pages function properly

---

## Anti-Patterns to Avoid
- Do not create new patterns when existing ones work
- Do not skip validation because "it should work"
- Do not ignore failing tests - fix them
- Do not mix old fetch patterns with new React Query patterns in same component
- Do not forget to invalidate queries after mutations
- Do not use overly specific query keys (prefer hierarchical)
- Do not set staleTime to 0 (causes immediate refetch after hydration)
- Do not forget "use client" directive on hook files
