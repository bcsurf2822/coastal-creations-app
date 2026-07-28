# Phase 5: Event & Customer Mutations

**Goal**: Create mutation hooks for event and customer CRUD operations

**Prerequisites**: Phase 4 complete

---

## Tasks

- [ ] **5.1** Create `hooks/mutations/use-create-event.ts`
- [ ] **5.2** Create `hooks/mutations/use-update-event.ts`
- [ ] **5.3** Create `hooks/mutations/use-delete-event.ts`
- [ ] **5.4** Create `hooks/mutations/use-create-customer.ts`
- [ ] **5.5** Update `hooks/mutations/index.ts` to export new hooks
- [ ] **5.6** Migrate `components/dashboard/event-form/AddEventForm.tsx`
- [ ] **5.7** Migrate `components/dashboard/event-form/EditEventForm.tsx`
- [ ] **5.8** Update `components/dashboard/home/EventContainer.tsx` delete functionality
- [ ] **5.9** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: Admin dashboard - add event, edit event, delete event
# Verify: Operations succeed, lists refresh automatically
```

## Files Modified
- `hooks/mutations/use-create-event.ts` (create)
- `hooks/mutations/use-update-event.ts` (create)
- `hooks/mutations/use-delete-event.ts` (create)
- `hooks/mutations/use-create-customer.ts` (create)
- `hooks/mutations/index.ts` (update)
- `components/dashboard/event-form/AddEventForm.tsx` (update)
- `components/dashboard/event-form/EditEventForm.tsx` (update)
- `components/dashboard/home/EventContainer.tsx` (update)
