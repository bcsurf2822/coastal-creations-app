# Phase 6: Reservation & Private Event Mutations

**Goal**: Create mutation hooks for reservation and private event CRUD operations

**Prerequisites**: Phase 5 complete

---

## Tasks

- [ ] **6.1** Create `hooks/mutations/use-create-reservation.ts`
- [ ] **6.2** Create `hooks/mutations/use-update-reservation.ts`
- [ ] **6.3** Create `hooks/mutations/use-delete-reservation.ts`
- [ ] **6.4** Create `hooks/mutations/use-create-private-event.ts`
- [ ] **6.5** Create `hooks/mutations/use-update-private-event.ts`
- [ ] **6.6** Create `hooks/mutations/use-delete-private-event.ts`
- [ ] **6.7** Update `hooks/mutations/index.ts` to export new hooks
- [ ] **6.8** Migrate `components/dashboard/reservation-form/AddReservationForm.tsx`
- [ ] **6.9** Migrate `components/dashboard/reservation-form/EditReservationForm.tsx`
- [ ] **6.10** Migrate `components/dashboard/private-event-form/AddPrivateEventForm.tsx`
- [ ] **6.11** Migrate `components/dashboard/private-event-form/EditPrivateEventForm.tsx`
- [ ] **6.12** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: Admin dashboard - add/edit/delete reservations and private events
# Verify: Operations succeed, lists refresh automatically
```

## Files Modified
- `hooks/mutations/use-create-reservation.ts` (create)
- `hooks/mutations/use-update-reservation.ts` (create)
- `hooks/mutations/use-delete-reservation.ts` (create)
- `hooks/mutations/use-create-private-event.ts` (create)
- `hooks/mutations/use-update-private-event.ts` (create)
- `hooks/mutations/use-delete-private-event.ts` (create)
- `hooks/mutations/index.ts` (update)
- `components/dashboard/reservation-form/AddReservationForm.tsx` (update)
- `components/dashboard/reservation-form/EditReservationForm.tsx` (update)
- `components/dashboard/private-event-form/AddPrivateEventForm.tsx` (update)
- `components/dashboard/private-event-form/EditPrivateEventForm.tsx` (update)
