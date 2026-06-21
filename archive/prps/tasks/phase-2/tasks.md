# Phase 2: Events & Customers Queries

**Goal**: Create query hooks for events and customers - the most heavily used endpoints

**Prerequisites**: Phase 1 complete

---

## Tasks

- [ ] **2.1** Create `hooks/queries/use-events.ts` with type filtering support
- [ ] **2.2** Create `hooks/queries/use-event.ts` for single event fetching
- [ ] **2.3** Create `hooks/queries/use-customers.ts` with eventId/eventType filtering
- [ ] **2.4** Update `hooks/queries/index.ts` to export new hooks
- [ ] **2.5** Migrate `components/landing/Calendar.tsx` to use useEvents and useCustomers
- [ ] **2.6** Migrate `components/calendar/NewCalendar.tsx` to use useEvents and useCustomers
- [ ] **2.7** Migrate `components/classes/EventsContainer.tsx` to use useEvents and useCustomers
- [ ] **2.8** Migrate `components/dashboard/home/EventContainer.tsx` to use useEvents and useCustomers
- [ ] **2.9** Run build and lint validation
- [ ] **2.10** Manual test: Verify no duplicate API calls in Network tab

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: Homepage calendar, /events/* pages, admin dashboard
# Verify: Single /api/events request per page load, DevTools shows queries
```

## Files Modified
- `hooks/queries/use-events.ts` (create)
- `hooks/queries/use-event.ts` (create)
- `hooks/queries/use-customers.ts` (create)
- `hooks/queries/index.ts` (update)
- `components/landing/Calendar.tsx` (update)
- `components/calendar/NewCalendar.tsx` (update)
- `components/classes/EventsContainer.tsx` (update)
- `components/dashboard/home/EventContainer.tsx` (update)
