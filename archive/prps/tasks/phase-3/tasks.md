# Phase 3: Reservations & Private Events Queries

**Goal**: Create query hooks for reservations and private events

**Prerequisites**: Phase 2 complete

---

## Tasks

- [ ] **3.1** Create `hooks/queries/use-reservations.ts` with date filtering support
- [ ] **3.2** Create `hooks/queries/use-reservation.ts` for single reservation
- [ ] **3.3** Create `hooks/queries/use-private-events.ts` for list
- [ ] **3.4** Create `hooks/queries/use-private-event.ts` for single item
- [ ] **3.5** Update `hooks/queries/index.ts` to export new hooks
- [ ] **3.6** Migrate `components/reservations/ReservationList.tsx` to use useReservations
- [ ] **3.7** Migrate `components/classes/privateEvents/PrivateEvents.tsx` to use usePrivateEvents
- [ ] **3.8** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: /reservations page, /events/private-events page
# Verify: Data loads correctly, DevTools shows queries
```

## Files Modified
- `hooks/queries/use-reservations.ts` (create)
- `hooks/queries/use-reservation.ts` (create)
- `hooks/queries/use-private-events.ts` (create)
- `hooks/queries/use-private-event.ts` (create)
- `hooks/queries/index.ts` (update)
- `components/reservations/ReservationList.tsx` (update)
- `components/classes/privateEvents/PrivateEvents.tsx` (update)
