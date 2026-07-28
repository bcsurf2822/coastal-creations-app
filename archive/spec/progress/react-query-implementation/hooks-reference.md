# React Query Hooks Reference

Quick reference for all React Query hooks implemented in the project.

---

## Query Hooks

### useHours

Fetches business hours of operation.

```typescript
import { useHours } from "@/hooks/queries";

const { data, isLoading, error } = useHours();

// Returns: HoursOfOperation | undefined
```

---

### usePageContent

Fetches CMS page content. Backwards-compatible API.

```typescript
import { usePageContent } from "@/hooks/queries";

const { content, isLoading } = usePageContent();

// Returns: { content: PageContent | null, isLoading: boolean }
```

**Cache Invalidation Helper**:
```typescript
import { useInvalidatePageContent } from "@/hooks/queries";

const invalidate = useInvalidatePageContent();
// Call invalidate() after content updates
```

---

### useEvents

Fetches events with optional type filtering.

```typescript
import { useEvents } from "@/hooks/queries";

// All events
const { data, isLoading, error } = useEvents();

// Filtered by type
const { data } = useEvents("adult-class");
const { data } = useEvents("kid-class");
const { data } = useEvents("camp");

// Returns: ApiEvent[] | undefined
```

---

### useEvent

Fetches a single event by ID.

```typescript
import { useEvent } from "@/hooks/queries";

const { data, isLoading, error } = useEvent(eventId);

// Disabled when no ID
const { data } = useEvent(eventId ?? "");

// Returns: ApiEvent | undefined
```

---

### useCustomers

Fetches customer bookings with filtering.

```typescript
import { useCustomers } from "@/hooks/queries";

// All customers
const { data, isLoading, error } = useCustomers();

// Filter by event
const { data } = useCustomers({ eventId: "abc123" });

// Filter by event type
const { data } = useCustomers({ eventType: "reservation" });

// Combined filters
const { data } = useCustomers({ eventId: "abc", eventType: "event" });

// Returns: ICustomer[] | undefined
```

---

### useReservations

Fetches reservations with optional filtering.

```typescript
import { useReservations } from "@/hooks/queries";

// All reservations
const { data, isLoading, error } = useReservations();

// Filter by type
const { data } = useReservations({ type: "walk-in" });

// Filter by date range
const { data } = useReservations({
  fromDate: "2024-01-01",
  toDate: "2024-01-31"
});

// Returns: Reservation[] | undefined
```

---

### useReservation

Fetches a single reservation by ID.

```typescript
import { useReservation } from "@/hooks/queries";

const { data, isLoading, error } = useReservation(reservationId);

// Returns: Reservation | undefined
```

---

### usePrivateEvents

Fetches all private event offerings.

```typescript
import { usePrivateEvents } from "@/hooks/queries";

const { data, isLoading, error } = usePrivateEvents();

// Returns: PrivateEvent[] | undefined
```

---

### usePrivateEvent

Fetches a single private event by ID.

```typescript
import { usePrivateEvent } from "@/hooks/queries";

const { data, isLoading, error } = usePrivateEvent(privateEventId);

// Returns: PrivateEvent | undefined
```

---

### useGallery

Fetches gallery images with optional destination filter.

```typescript
import { useGallery } from "@/hooks/queries";

// All gallery images
const { data, isLoading, error } = useGallery();

// Filter by destination
const { data } = useGallery("adult-class");
const { data } = useGallery("kid-class");
const { data } = useGallery("camp");

// Returns: GalleryImage[] | undefined
```

---

### useEventPictures

Fetches event pictures from Sanity CMS.

```typescript
import { useEventPictures } from "@/hooks/queries";

const { data, isLoading, error } = useEventPictures();

// Returns: SanityImage[] | undefined
```

---

### usePrivateEventPictures

Fetches private event pictures from Sanity CMS.

```typescript
import { usePrivateEventPictures } from "@/hooks/queries";

const { data, isLoading, error } = usePrivateEventPictures();

// Returns: SanityImage[] | undefined
```

---

### usePaymentConfig

Fetches Square payment SDK configuration.

```typescript
import { usePaymentConfig } from "@/hooks/queries";

const { data, isLoading, error } = usePaymentConfig();

// Returns: { applicationId: string, locationId: string } | undefined
```

---

### usePaymentErrors

Fetches payment error logs with filtering.

```typescript
import { usePaymentErrors } from "@/hooks/queries";

// Default (limit 50)
const { data, isLoading, error } = usePaymentErrors();

// Custom limit
const { data } = usePaymentErrors({ limit: 100 });

// Filter by event
const { data } = usePaymentErrors({ eventId: "abc123" });

// Filter by customer email
const { data } = usePaymentErrors({ customerEmail: "test@example.com" });

// Returns: PaymentError[] | undefined
```

---

## Mutation Hooks

### useCreateEvent

Creates a new event.

```typescript
import { useCreateEvent } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useCreateEvent();

// Usage
mutate(eventData);
// or
await mutateAsync(eventData);

// Automatically invalidates: ["events"]
```

---

### useUpdateEvent

Updates an existing event.

```typescript
import { useUpdateEvent } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useUpdateEvent();

// Usage
mutate({ id: eventId, data: updatedFields });

// Automatically invalidates: ["events"], ["event", id]
```

---

### useDeleteEvent

Deletes an event.

```typescript
import { useDeleteEvent } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useDeleteEvent();

// Usage
mutate(eventId);

// Automatically invalidates: ["events"]
```

---

### useCreateCustomer

Creates a customer booking.

```typescript
import { useCreateCustomer } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useCreateCustomer();

// Usage
mutate(customerData);

// Automatically invalidates: ["customers"], ["events"]
```

---

### useCreateReservation

Creates a new reservation.

```typescript
import { useCreateReservation } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useCreateReservation();

// Usage
mutate(reservationData);

// Automatically invalidates: ["reservations"]
```

---

### useUpdateReservation

Updates an existing reservation.

```typescript
import { useUpdateReservation } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useUpdateReservation();

// Usage
mutate({ id: reservationId, data: updatedFields });

// Automatically invalidates: ["reservations"], ["reservation", id]
```

---

### useDeleteReservation

Deletes a reservation.

```typescript
import { useDeleteReservation } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useDeleteReservation();

// Usage
mutate(reservationId);

// Automatically invalidates: ["reservations"]
```

---

### useProcessRefund

Processes a Square refund.

```typescript
import { useProcessRefund } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useProcessRefund();

// Usage
mutate({
  customerId: "abc123",
  refundAmount: 50.00,
  reason: "Customer request"
});

// Automatically invalidates: ["customers"]
```

---

### useUpdateHours

Updates business hours.

```typescript
import { useUpdateHours } from "@/hooks/mutations";

const { mutate, mutateAsync, isPending, error } = useUpdateHours();

// Usage
mutate(hoursData);

// Automatically invalidates: ["hours"]
```

---

## Common Patterns

### Loading State

```typescript
const { data, isLoading } = useEvents();

if (isLoading) {
  return <Spinner />;
}
```

### Error Handling

```typescript
const { data, error } = useEvents();

if (error) {
  return <ErrorMessage message={error.message} />;
}
```

### Conditional Fetching

```typescript
// Query disabled when id is empty
const { data } = useEvent(id ?? "");
```

### Mutation with Callbacks

```typescript
const { mutate } = useCreateEvent();

mutate(data, {
  onSuccess: (result) => {
    toast.success("Event created!");
    router.push(`/events/${result._id}`);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

### Async Mutation

```typescript
const { mutateAsync } = useCreateEvent();

try {
  const result = await mutateAsync(data);
  // Handle success
} catch (error) {
  // Handle error
}
```
