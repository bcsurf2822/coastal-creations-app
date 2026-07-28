# Manual Testing Checklist - React Query Integration

Complete this checklist before merging the `react-query-integration` branch into `develop`.

---

## Pre-Testing Setup

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Run `npm run test:run` to verify all unit tests pass
- [ ] Start the dev server: `npm run dev`
- [ ] Open browser DevTools (F12) and keep Network tab visible

---

## 1. React Query DevTools Verification

**Location**: Bottom-right corner of the page (flower icon)

- [ ] DevTools icon appears on the page
- [ ] Click icon to open DevTools panel
- [ ] Panel shows query list and cache information
- [ ] Queries appear as you navigate the site

---

## 2. Homepage Testing

**URL**: `http://localhost:3000`

### Page Content Loading
- [ ] Hero section loads with correct title and subtitle
- [ ] Offerings section displays correctly
- [ ] Main section content appears
- [ ] Check DevTools: `page-content` query shows in cache
- [ ] No loading spinners stuck indefinitely

### Calendar/Events Loading
- [ ] Calendar component renders
- [ ] Events display on calendar
- [ ] Check DevTools: `events` query shows in cache
- [ ] Participant counts display correctly (if applicable)

### Cache Behavior
- [ ] Navigate away from homepage (e.g., to /about)
- [ ] Navigate back to homepage
- [ ] Page loads instantly (from cache, no loading state)
- [ ] Check DevTools: Query shows as "fresh" or "stale" (not "fetching")

---

## 3. Event Pages Testing

### Adult Classes (`/events/adult-classes`)
- [ ] Page loads without errors
- [ ] Events list displays correctly
- [ ] Page description content loads from CMS
- [ ] Check DevTools: Queries cached properly

### Kid Classes (`/events/kid-classes`)
- [ ] Page loads without errors
- [ ] Events list displays correctly
- [ ] Page description loads

### Camps (`/events/camps`)
- [ ] Page loads without errors
- [ ] Camp events display correctly

### Live Artist (`/events/live-artist`)
- [ ] Page loads without errors
- [ ] Artist events display (if any)

### Single Event Detail (`/calendar/[eventId]`)
- [ ] Click on an event from calendar
- [ ] Event detail page loads
- [ ] All event information displays correctly
- [ ] Check DevTools: `event` query with specific ID cached

---

## 4. Reservations Testing

### Reservations List (`/reservations`)
- [ ] Page loads without errors
- [ ] Page content/description displays
- [ ] Available reservation slots show correctly
- [ ] Check DevTools: `reservations` query cached

### Single Reservation (`/reservations/[reservationId]`)
- [ ] Click on a reservation
- [ ] Booking page loads with correct details
- [ ] Daily availability displays correctly
- [ ] Pricing information correct
- [ ] Check DevTools: `reservation` query with ID cached

---

## 5. Gallery Testing

**URL**: `/gallery`

- [ ] Gallery page loads
- [ ] Images display correctly
- [ ] Page description loads from CMS
- [ ] Check DevTools: `gallery` query cached

---

## 6. About Page Testing

**URL**: `/about`

- [ ] Page loads without errors
- [ ] Content displays from CMS
- [ ] Check DevTools: `page-content` query used

---

## 7. Admin Dashboard Testing

**URL**: `/admin/dashboard`
**Prerequisite**: Must be logged in with whitelisted email

### Dashboard Home
- [ ] Dashboard loads correctly
- [ ] Navigation works between sections

### Events Management (`/admin/dashboard/add-event`, `/admin/dashboard/edit-event`)
- [ ] Event list loads
- [ ] Can create new event (if testing mutations)
- [ ] Can edit existing event
- [ ] After save, events list updates automatically (cache invalidation)

### Reservations Management
- [ ] Reservations list loads
- [ ] Can view reservation details
- [ ] Can edit reservation
- [ ] After save, list updates automatically

### Customers (`/admin/dashboard/customers`)
- [ ] Customer list loads
- [ ] Filtering by event works
- [ ] Customer details display correctly

### Hours Management (`/admin/dashboard/hours`)
- [ ] Current hours load correctly
- [ ] Can update hours
- [ ] After save, hours update without page refresh

### Error Logs (`/admin/dashboard/error-logs`)
- [ ] Error log list loads (may be empty)
- [ ] Filtering works

---

## 8. Error Handling Testing

### Network Errors
- [ ] Open DevTools Network tab
- [ ] Set network to "Offline"
- [ ] Navigate to a new page
- [ ] Error state displays gracefully (not blank page)
- [ ] Set network back to "Online"
- [ ] Data refetches automatically

### API Errors
- [ ] If possible, test with an invalid endpoint
- [ ] Error message displays to user
- [ ] App doesn't crash

---

## 9. Cache Invalidation Testing

### Events Cache
- [ ] Go to admin, create/edit an event
- [ ] Navigate to public events page
- [ ] New/updated event appears without manual refresh

### Hours Cache
- [ ] Update business hours in admin
- [ ] Check footer or hours display
- [ ] Updated hours appear without manual refresh

### Page Content Cache
- [ ] If possible, update CMS content
- [ ] Navigate to affected page
- [ ] New content appears (may take up to 5 minutes due to staleTime)

---

## 10. Performance Testing

### Initial Load
- [ ] Homepage loads within 3 seconds
- [ ] No excessive network requests on initial load

### Navigation Performance
- [ ] Subsequent page navigations are fast
- [ ] Cached data loads instantly
- [ ] Only stale data triggers refetch

### Memory
- [ ] Navigate around the app extensively
- [ ] Check browser memory usage in DevTools
- [ ] No memory leaks (memory should stabilize)

---

## 11. Mobile Testing

**Use browser DevTools device emulation or actual device**

- [ ] Homepage renders correctly on mobile
- [ ] DevTools icon doesn't obstruct content (or is hidden in production)
- [ ] All pages accessible via mobile navigation
- [ ] Touch interactions work correctly

---

## 12. Browser Compatibility

Test in at least these browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on Mac)
- [ ] Edge (latest)

---

## Post-Testing Verification

- [ ] All tests above pass
- [ ] No console errors (except expected warnings)
- [ ] No TypeScript errors: `npm run build`
- [ ] All unit tests pass: `npm run test:run`
- [ ] No ESLint errors: `npm run lint`

---

## Sign-Off

| Tester | Date | Status |
|--------|------|--------|
| | | Pass / Fail |

### Notes

_Record any issues, observations, or edge cases discovered during testing:_

---

---

## Quick Smoke Test (Minimal Testing)

If time is limited, complete at minimum:

1. [ ] Homepage loads with content
2. [ ] DevTools shows queries caching
3. [ ] Navigate to 2-3 pages, verify fast subsequent loads
4. [ ] Admin dashboard loads (if logged in)
5. [ ] `npm run build` passes
6. [ ] `npm run test:run` passes

---

## Rollback Plan

If critical issues are found:

1. `git checkout develop`
2. Deploy previous version
3. Document issues for fix in next iteration
