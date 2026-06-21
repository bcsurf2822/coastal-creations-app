# Files Created and Modified

Complete list of all files created or modified during the React Query integration.

---

## Files Created

### Infrastructure

| File | Purpose |
|------|---------|
| `app/get-query-client.ts` | QueryClient singleton factory for Next.js App Router |
| `app/providers.tsx` | Client component wrapping QueryClientProvider with DevTools |

### Query Hooks

| File | Purpose |
|------|---------|
| `hooks/queries/index.ts` | Barrel export for all query hooks |
| `hooks/queries/use-hours.ts` | Fetch business hours |
| `hooks/queries/use-page-content.ts` | Fetch CMS page content |
| `hooks/queries/use-events.ts` | Fetch events with type filtering |
| `hooks/queries/use-event.ts` | Fetch single event by ID |
| `hooks/queries/use-customers.ts` | Fetch customer bookings |
| `hooks/queries/use-reservations.ts` | Fetch reservations with date filtering |
| `hooks/queries/use-reservation.ts` | Fetch single reservation |
| `hooks/queries/use-private-events.ts` | Fetch private event offerings |
| `hooks/queries/use-private-event.ts` | Fetch single private event |
| `hooks/queries/use-gallery.ts` | Fetch gallery images |
| `hooks/queries/use-event-pictures.ts` | Fetch event pictures from Sanity |
| `hooks/queries/use-private-event-pictures.ts` | Fetch private event pictures |
| `hooks/queries/use-payment-config.ts` | Fetch Square payment config |
| `hooks/queries/use-payment-errors.ts` | Fetch payment error logs |

### Mutation Hooks

| File | Purpose |
|------|---------|
| `hooks/mutations/index.ts` | Barrel export for all mutation hooks |
| `hooks/mutations/use-create-event.ts` | Create new event |
| `hooks/mutations/use-update-event.ts` | Update existing event |
| `hooks/mutations/use-delete-event.ts` | Delete event |
| `hooks/mutations/use-create-customer.ts` | Create customer booking |
| `hooks/mutations/use-create-reservation.ts` | Create reservation |
| `hooks/mutations/use-update-reservation.ts` | Update reservation |
| `hooks/mutations/use-delete-reservation.ts` | Delete reservation |
| `hooks/mutations/use-process-refund.ts` | Process Square refund |
| `hooks/mutations/use-update-hours.ts` | Update business hours |

### PRPs and Documentation

| File | Purpose |
|------|---------|
| `PRPs/react-query-integration.md` | Initial PRP for pilot implementation |
| `PRPs/react-query-full-migration.md` | Full migration PRP with all phases |
| `PRPs/tasks/README.md` | Task organization overview |
| `PRPs/tasks/phase-1/tasks.md` | Phase 1 task list |
| `PRPs/tasks/phase-2/tasks.md` | Phase 2 task list |
| `PRPs/tasks/phase-3/tasks.md` | Phase 3 task list |
| `PRPs/tasks/phase-4/tasks.md` | Phase 4 task list |
| `PRPs/tasks/phase-5/tasks.md` | Phase 5 task list |
| `PRPs/tasks/phase-6/tasks.md` | Phase 6 task list |
| `PRPs/tasks/phase-7/tasks.md` | Phase 7 task list |
| `PRPs/tasks/phase-8/tasks.md` | Phase 8 task list |

---

## Files Modified

### Layout and Providers

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrapped children with `<Providers>` component |

### Components Updated to Use React Query

| File | Change |
|------|--------|
| `components/landing/Calendar.tsx` | Replaced manual fetch with `useEvents` and `useCustomers` |
| `components/landing/Hero.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `components/landing/MainSection.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `components/landing/Offerings.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `components/about/About.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `app/reservations/page.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `app/events/adult-classes/page.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `app/events/kid-classes/page.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `app/events/camps/page.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |
| `app/gallery/page.tsx` | Updated import to use `usePageContent` from `@/hooks/queries` |

### Deprecated Files

| File | Change |
|------|--------|
| `hooks/usePageContent.ts` | Re-exports from new location with deprecation warning |

---

## Directory Structure Created

```
hooks/
├── queries/           # NEW - Query hooks directory
│   ├── index.ts
│   ├── use-hours.ts
│   ├── use-page-content.ts
│   ├── use-events.ts
│   ├── use-event.ts
│   ├── use-customers.ts
│   ├── use-reservations.ts
│   ├── use-reservation.ts
│   ├── use-private-events.ts
│   ├── use-private-event.ts
│   ├── use-gallery.ts
│   ├── use-event-pictures.ts
│   ├── use-private-event-pictures.ts
│   ├── use-payment-config.ts
│   └── use-payment-errors.ts
│
├── mutations/         # NEW - Mutation hooks directory
│   ├── index.ts
│   ├── use-create-event.ts
│   ├── use-update-event.ts
│   ├── use-delete-event.ts
│   ├── use-create-customer.ts
│   ├── use-create-reservation.ts
│   ├── use-update-reservation.ts
│   ├── use-delete-reservation.ts
│   ├── use-process-refund.ts
│   └── use-update-hours.ts

PRPs/
├── tasks/             # NEW - Task tracking directory
│   ├── README.md
│   ├── phase-1/
│   │   └── tasks.md
│   ├── phase-2/
│   │   └── tasks.md
│   ├── phase-3/
│   │   └── tasks.md
│   ├── phase-4/
│   │   └── tasks.md
│   ├── phase-5/
│   │   └── tasks.md
│   ├── phase-6/
│   │   └── tasks.md
│   ├── phase-7/
│   │   └── tasks.md
│   └── phase-8/
│       └── tasks.md

spec/
└── progress/
    └── react-query-implementation/  # NEW - Progress tracking
        ├── implementation-report.md
        ├── hooks-reference.md
        └── files-changed.md
```

---

## Import Path Changes

Components should now import from the new locations:

**Before**:
```typescript
import { usePageContent } from "@/hooks/usePageContent";
```

**After**:
```typescript
import { usePageContent } from "@/hooks/queries";
```

**Mutations**:
```typescript
import { useCreateEvent, useUpdateEvent } from "@/hooks/mutations";
```

---

## Files Count Summary

| Category | Count |
|----------|-------|
| Query hook files created | 15 |
| Mutation hook files created | 10 |
| Infrastructure files created | 2 |
| PRP/task files created | 11 |
| Components modified | 10 |
| **Total new files** | **38** |
| **Total modified files** | **11** |
