# Remaining Work - Phase 8

Components and files that still need to be migrated to use React Query hooks.

---

## Admin Dashboard Components

### Event Management

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| AddEventForm | `components/dashboard/event-form/AddEventForm.tsx` | Manual fetch POST | `useCreateEvent` |
| EditEventForm | `components/dashboard/event-form/EditEventForm.tsx` | Manual fetch GET/PUT | `useEvent`, `useUpdateEvent` |
| EventCustomersList | `app/admin/dashboard/events/[eventId]/page.tsx` | Manual fetch | `useCustomers` |

### Reservation Management

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| AddReservationForm | `components/dashboard/reservation-form/` | Manual fetch POST | `useCreateReservation` |
| EditReservationForm | `components/dashboard/reservation-form/` | Manual fetch GET/PUT | `useReservation`, `useUpdateReservation` |
| ReservationsList | `components/dashboard/reservations/` | Manual fetch | `useReservations` |
| ReservationDetail | `app/admin/dashboard/reservations/[id]/page.tsx` | Manual fetch | `useReservation` |

### Private Event Management

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| AddPrivateEventForm | `components/dashboard/private-event-form/` | Manual fetch POST | Create mutation needed |
| EditPrivateEventForm | `components/dashboard/private-event-form/` | Manual fetch GET/PUT | `usePrivateEvent`, Update mutation needed |
| PrivateOfferingsList | `components/dashboard/private-offerings/` | Manual fetch | `usePrivateEvents` |

### Customer Management

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| CustomersList | `components/dashboard/customers/` | Manual fetch | `useCustomers` |
| RefundForm | (within customers) | Manual fetch POST | `useProcessRefund` |

### Gallery Management

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| GalleryUploadForm | `components/dashboard/upload-images/` | Manual fetch | `useGallery`, Gallery mutations needed |
| ImageGallery | `components/gallery/` | Manual fetch | `useGallery` |

### Hours & Page Content

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| HoursForm | `app/admin/dashboard/hours/` | Manual fetch | `useHours`, `useUpdateHours` |
| PageDescriptions | `app/admin/dashboard/page-descriptions/` | Manual fetch | `usePageContent`, Update mutation needed |

### Error Logs

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| ErrorLogsList | `components/dashboard/errors-logs/` | Manual fetch | `usePaymentErrors` |

---

## Public-Facing Components

### Calendar & Events

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| NewCalendar | `components/calendar/NewCalendar.tsx` | Check if using old pattern | `useEvents` |
| EventsContainer | `components/classes/EventsContainer.tsx` | Manual fetch | `useEvents` |
| EventContainer | `components/classes/EventContainer.tsx` | Manual fetch | `useEvent` |
| EventDetail | `app/calendar/[eventId]/` | Manual fetch | `useEvent` |

### Reservations

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| ReservationBooking | `app/reservations/[reservationId]/` | Manual fetch | `useReservation` |
| ReservationList | `components/reservations/` | Manual fetch | `useReservations` |

### Private Events

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| PrivateEvents | `components/classes/privateEvents/` | Manual fetch | `usePrivateEvents` |

### Gallery

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| GalleryCarousel | `components/gallery/` | Manual fetch | `useGallery` |

### Payment

| Component | Location | Current Pattern | Target Hooks |
|-----------|----------|-----------------|--------------|
| Payment | `components/payment/Payment.tsx` | Manual fetch | `usePaymentConfig` |

---

## Mutations Still Needed

These mutation hooks need to be created:

| Hook | Purpose | Invalidates |
|------|---------|-------------|
| `useCreatePrivateEvent` | Create private event offering | `["privateEvents"]` |
| `useUpdatePrivateEvent` | Update private event | `["privateEvents"]`, `["privateEvent", id]` |
| `useDeletePrivateEvent` | Delete private event | `["privateEvents"]` |
| `useUpdatePageContent` | Update CMS page content | `["pageContent"]` |
| `useUploadGalleryImage` | Upload to gallery | `["gallery"]` |
| `useUpdateGalleryImage` | Update gallery metadata | `["gallery"]` |
| `useDeleteGalleryImage` | Delete gallery image | `["gallery"]` |
| `useDeletePaymentError` | Delete error log | `["paymentErrors"]` |

---

## Cleanup Tasks

1. **Remove Deprecated Hook**
   - Delete `hooks/usePageContent.ts` after confirming no direct imports

2. **Remove Test Page** (if created)
   - Delete `app/test-react-query/` if it was created for testing

3. **Update Type Exports**
   - Ensure all hooks export their types properly

4. **Add Error Boundaries**
   - Consider adding error boundary components for graceful error handling

5. **Documentation**
   - Update AGENTS.md if needed to reference React Query patterns

---

## Priority Order

### High Priority (Core User Flows)
1. EventContainer/EventDetail - Event viewing
2. ReservationBooking - Booking flow
3. Payment - Payment flow
4. CustomersList - Admin customer management

### Medium Priority (Admin Efficiency)
5. AddEventForm/EditEventForm - Event management
6. ReservationForm - Reservation management
7. HoursForm - Hours management

### Low Priority (Secondary Features)
8. Gallery components
9. Error logs
10. Private events

---

## Testing After Each Migration

After migrating each component:

1. Verify the component renders correctly
2. Check React Query DevTools for proper query caching
3. Test mutations trigger cache invalidation
4. Verify loading states display correctly
5. Test error states (disconnect network, etc.)
6. Run `npm run build` to catch type errors
