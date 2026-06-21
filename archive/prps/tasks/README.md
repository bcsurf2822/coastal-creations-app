# React Query Migration - Task Tracker

## Overview

This folder contains organized tasks for migrating the coastal-creations-app to TanStack Query v5.

**Total Phases**: 8
**Total Tasks**: 68
**Pilot Status**: Complete (useHours hook working)

---

## Phase Summary

| Phase | Focus | Tasks | Status |
|-------|-------|-------|--------|
| **Pilot** | Test implementation with /api/hours | - | Complete |
| **1** | Replace usePageContent Hook | 8 | Not Started |
| **2** | Events & Customers Queries | 10 | Not Started |
| **3** | Reservations & Private Events Queries | 8 | Not Started |
| **4** | Gallery & Utility Queries | 10 | Not Started |
| **5** | Event & Customer Mutations | 9 | Not Started |
| **6** | Reservation & Private Event Mutations | 12 | Not Started |
| **7** | Gallery & Admin Mutations | 12 | Not Started |
| **8** | Cleanup & Final Validation | 7 | Not Started |

---

## Quick Reference

### Query Hooks (14 total)
| Hook | Endpoint | Phase |
|------|----------|-------|
| `useHours` | GET /api/hours | Pilot |
| `usePageContent` | GET /api/page-content | 1 |
| `useEvents` | GET /api/events | 2 |
| `useEvent` | GET /api/event/[id] | 2 |
| `useCustomers` | GET /api/customer | 2 |
| `useReservations` | GET /api/reservations | 3 |
| `useReservation` | GET /api/reservations/[id] | 3 |
| `usePrivateEvents` | GET /api/private-events | 3 |
| `usePrivateEvent` | GET /api/private-events/[id] | 3 |
| `useGallery` | GET /api/gallery | 4 |
| `useEventPictures` | GET /api/eventPictures | 4 |
| `usePrivateEventPictures` | GET /api/privateEventPictures | 4 |
| `usePaymentConfig` | GET /api/payment-config | 4 |
| `usePaymentErrors` | GET /api/payment-errors | 4 |

### Mutation Hooks (17 total)
| Hook | Endpoint | Phase |
|------|----------|-------|
| `useCreateEvent` | POST /api/events | 5 |
| `useUpdateEvent` | PUT /api/events/[id] | 5 |
| `useDeleteEvent` | DELETE /api/events | 5 |
| `useCreateCustomer` | POST /api/customer | 5 |
| `useCreateReservation` | POST /api/reservations | 6 |
| `useUpdateReservation` | PUT /api/reservations/[id] | 6 |
| `useDeleteReservation` | DELETE /api/reservations | 6 |
| `useCreatePrivateEvent` | POST /api/private-events | 6 |
| `useUpdatePrivateEvent` | PUT /api/private-events | 6 |
| `useDeletePrivateEvent` | DELETE /api/private-events | 6 |
| `useUploadGallery` | POST /api/gallery | 7 |
| `useUpdateGallery` | PUT /api/gallery | 7 |
| `useDeleteGallery` | DELETE /api/gallery | 7 |
| `useProcessRefund` | POST /api/refunds | 7 |
| `useUpdatePageContent` | PUT /api/page-content | 7 |
| `useUpdateHours` | PUT /api/hours | 7 |

---

## Directory Structure

```
PRPs/tasks/
├── README.md           # This file
├── phase-1/
│   └── tasks.md        # Replace usePageContent (8 tasks)
├── phase-2/
│   └── tasks.md        # Events & Customers Queries (10 tasks)
├── phase-3/
│   └── tasks.md        # Reservations & Private Events (8 tasks)
├── phase-4/
│   └── tasks.md        # Gallery & Utility Queries (10 tasks)
├── phase-5/
│   └── tasks.md        # Event Mutations (9 tasks)
├── phase-6/
│   └── tasks.md        # Reservation & Private Event Mutations (12 tasks)
├── phase-7/
│   └── tasks.md        # Gallery & Admin Mutations (12 tasks)
└── phase-8/
    └── tasks.md        # Cleanup & Validation (7 tasks)
```

---

## Validation Commands

```bash
# Per-phase validation
npm run lint
npm run build

# Search for remaining fetch patterns (Phase 8)
grep -r "fetch(\"/api" --include="*.tsx" --include="*.ts" components/ app/

# Start dev server for manual testing
npm run dev
```

---

## Notes

- Each phase should be completed and validated before moving to the next
- Always run `npm run lint && npm run build` after completing a phase
- Use React Query DevTools to verify queries are working correctly
- Check Network tab to ensure no duplicate API calls
