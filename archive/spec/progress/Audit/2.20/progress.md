# Progress Report - February 20, 2026

## Summary

Major update spanning UX polish, performance optimization, security hardening, and SEO improvements. Work was done across two connected sessions. The first session focused on diagnosing and fixing a navigation flash/jumpiness issue, then snowballed into skeleton cleanup, entrance animations, a full homepage calendar redesign, SEO metadata, API security, and performance optimizations.

---

## 1. Navigation Flash Fix (LayoutTransition)

### Problem
When navigating between pages, users experienced a visible flash/jump. The root cause was `LayoutTransition.tsx` which used `AnimatePresence` with a `FrozenRouter` pattern from `next/dist/shared/lib/app-router-context.shared-runtime`. This internal Next.js API was unreliable and caused the outgoing page to briefly render stale content before the new page appeared.

### Solution
Stripped `LayoutTransition.tsx` down to a minimal wrapper. Removed:
- `AnimatePresence` and `motion` page transitions
- `FrozenRouter` component (used `LayoutRouterContext` internal API)
- `usePreviousValue` ref hook
- Mobile breakpoint detection for transition tuning
- `useReducedMotion` checks (no longer needed without animations)

The component now only handles `window.scrollTo(0, 0)` on segment change and renders children in a plain `<div>`.

### File Changed
- `components/layout/LayoutTransition.tsx` (82 lines removed, reduced to ~15 lines)

---

## 2. Skeleton Component Cleanup

### Problem
Multiple skeleton loading components existed across the codebase and were tightly coupled to specific layouts. They also contributed to the flash issue because Next.js `loading.tsx` files would show skeleton UI that abruptly switched to the real content.

### Solution
Removed all skeleton components and `loading.tsx` files. Replaced with simple, consistent spinning loaders (a rotating circle using `motion.div`).

### Files Deleted
- `app/calendar/loading.tsx`
- `app/calendar/[eventId]/loading.tsx`
- `app/events/adult-classes/loading.tsx`
- `app/events/adult-classes/[eventId]/loading.tsx`
- `app/events/camps/loading.tsx`
- `app/events/camps/[eventId]/loading.tsx`
- `app/events/classes-workshops/loading.tsx`
- `app/events/classes-workshops/[eventId]/loading.tsx`
- `app/events/events/loading.tsx`
- `app/events/events/[eventId]/loading.tsx`
- `app/events/kid-classes/loading.tsx`
- `app/events/kid-classes/[eventId]/loading.tsx`
- `app/events/live-artist/loading.tsx`
- `app/events/live-artist/[eventId]/loading.tsx`
- `app/events/private-events/loading.tsx`
- `app/gallery/loading.tsx`
- `app/reservations/loading.tsx`
- `components/calendar/eventDetails/EventDetailSkeleton.tsx`
- `components/classes/EventCardSkeleton.tsx`
- `components/classes/EventsPageSkeleton.tsx`
- `components/classes/privateEvents/PrivateEventCardSkeleton.tsx`
- `components/gallery/GalleryCarouselSkeleton.tsx`
- `components/gallery/GallerySkeleton.tsx`
- `components/reservations/ReservationCardSkeleton.tsx`
- `components/ui/Skeleton.tsx`

### Files Modified (loading state changes)
- `components/classes/EventsContainer.tsx` - Removed `EventCardSkeleton`, stagger `containerVariants`, and `motion.div` wrappers. Loading state now shows a centered spinner.
- `components/classes/privateEvents/PrivateEvents.tsx` - Same spinner pattern.
- `components/calendar/eventDetails/EventDetails.tsx` - Removed skeleton import, uses spinner.
- `components/gallery/GalleryCarousel.tsx` - Loading state now returns `null` (renders nothing) instead of a pulsing placeholder.
- `components/ui/index.ts` - Removed `Skeleton` export from barrel file.

---

## 3. Fade-In Entrance Animations

### Problem
After removing page transitions, list pages felt flat with no visual polish on content appearance.

### Solution
Added a CSS-only `fade-in-up` animation with staggered delays based on item index. Each item fades in and slides up 16px over 0.4s. The stagger is 60ms per item.

### CSS Added (`app/globals.css`)
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up { animation: none; }
}
```

### Components Updated
- `components/classes/EventCard.tsx` - Wrapping `<div>` gets `className="animate-fade-in-up"` with `animationDelay: ${index * 60}ms`
- `components/classes/privateEvents/PrivateEventCard.tsx` - Same treatment
- `components/reservations/ReservationList.tsx` - Each `ReservationCard` wrapped in animated `<div>`
- `components/gallery/ImageGallery.tsx` - Each gallery item gets the animation class

---

## 4. Homepage Calendar Redesign

### Problem
The "Upcoming Workshops" section on the homepage originally showed a card grid of up to 4 events. It was redesigned through multiple iterations to look like an actual weekly calendar.

### Solution
Complete redesign of `components/landing/Calendar.tsx` into a 7-day column calendar layout.

### Key Changes

**Data Model**
- Added `DaySlot` interface with `date`, `dateKey`, `weekday`, `dayNum`, `month`, `events` fields
- Added `weekSlots` memo that creates 7 slots starting from today
- Uses `dayjs` with `America/New_York` timezone for all date operations
- Events matched to days by comparing `YYYY-MM-DD` formatted date keys

**Color System**
```typescript
const EVENT_TYPE_COLORS = {
  "adult-class": { bg: "bg-[#326C85]", hover: "hover:bg-[#2a5b71]" },
  "kid-class":   { bg: "bg-[#5b9aab]", hover: "hover:bg-[#4d8999]" },
  camp:          { bg: "bg-[#e8875b]", hover: "hover:bg-[#d6764a]" },
  artist:        { bg: "bg-[#8b6aad]", hover: "hover:bg-[#7a5c9a]" },
  event:         { bg: "bg-[#326C85]", hover: "hover:bg-[#2a5b71]" },
};
```

**Layout Structure**
- Day headers: `grid grid-cols-7` with weekday + day number, today highlighted with a bottom border accent
- Day columns: `grid grid-cols-7 min-h-[260px]` with vertical dividers between columns
- Event cards: Full-height (`flex-1`), color-coded by event type, with hover lift (`-translate-y-0.5`) and shadow
- Each card shows: event type label, event name (EB Garamond font), scrollable description, time, price, and "Sign Up"/"Sold Out" button
- Empty days show `--` centered placeholder

**Event Interaction**
- `handleEventClick()` routes artist events to `/events/live-artist/[id]` and all others to `/payments` with query params
- Sold-out detection based on participant counts vs capacity

**Removed**
- Old `Card` and `Skeleton` imports
- `formatEventDate` helper (replaced by dayjs formatting)
- `previewEvents` slice (now uses `weekSlots` memo)

---

## 5. SEO Metadata

### Problem
The app had minimal metadata - just a generic title and description in the root layout. No per-page titles, no Open Graph tags, no sitemap, no robots.txt.

### Solution

**Root Layout (`app/layout.tsx`)**
- Title changed from plain string to template object: `{ default: "...", template: "%s | Coastal Creations Studio" }`
- Added full description mentioning key services and location
- Added `openGraph` configuration with type, locale, and siteName

**Per-Page Metadata**
Added `layout.tsx` files with `Metadata` exports for every event route:
- `app/events/adult-classes/layout.tsx` - "Adult Workshops"
- `app/events/kid-classes/layout.tsx` - "Kids Art Classes"
- `app/events/camps/layout.tsx` - "Art Camps"
- `app/events/events/layout.tsx` - "Events"
- `app/events/live-artist/layout.tsx` - "Live Artist Events"
- `app/events/classes-workshops/layout.tsx` - "Classes & Workshops"
- `app/events/private-events/layout.tsx` - "Private Events"
- `app/gallery/layout.tsx` - "Gallery"
- `app/reservations/layout.tsx` - "Reservations"

**Dynamic Event Detail Pages**
All `[eventId]/page.tsx` files across event categories now use `generateMetadata()` to fetch the event from MongoDB and produce per-event titles and descriptions.

**Static Page Metadata**
Added metadata exports to: `app/page.tsx`, `app/about/page.tsx`, `app/blog/page.tsx`, `app/calendar/page.tsx`, `app/contact-us/page.tsx`, `app/gift-cards/page.tsx`, `app/gift-cards/balance/page.tsx`

**New Files**
- `app/robots.ts` - Allows all crawlers on public pages, disallows `/admin/`, `/api/`, `/payments/`, `/payment-success/`, `/payment/`. Points to sitemap.
- `app/sitemap.ts` - Generates sitemap with all static pages plus dynamic event and reservation pages from MongoDB. Appropriate `changeFrequency` and `priority` values.

---

## 6. API Security Hardening

### Problem
Multiple API routes that perform mutations (POST, PUT, DELETE) had no authentication checks. Any unauthenticated user could call these endpoints directly.

### Solution
Added `getServerSession(authOptions)` checks to mutating endpoints. Read-only GET requests remain public. If no session is found, the route returns `401 Unauthorized`.

### Routes Updated
- `app/api/events/route.ts` (POST)
- `app/api/events/[id]/route.ts` (PUT, DELETE)
- `app/api/gallery/route.ts` (POST, PUT, DELETE)
- `app/api/hours/route.ts` (PUT)
- `app/api/page-content/route.ts` (PUT)
- `app/api/payment-errors/route.ts` (DELETE)
- `app/api/private-events/route.ts` (POST, PUT, DELETE)
- `app/api/refunds/route.ts` (POST)
- `app/api/reservations/route.ts` (POST, PUT, DELETE)
- `app/api/upload-image/route.ts` (POST)
- `app/api/upload-private-image/route.ts` (POST)
- `app/api/delete-image/route.ts` (POST)

**Not modified** (intentionally public):
- `app/api/customer/route.ts` POST - Customer booking must work without auth
- `app/api/payments/` - Payment processing uses Square tokens, not session auth

---

## 7. Performance Optimizations

### Events Cleanup (`app/api/events/route.ts`)
**Before**: `cleanupPastEvents()` loaded ALL events from MongoDB into memory, iterated each one in JavaScript to determine if it was past, collected IDs, then ran `deleteMany`.

**After**: Single `deleteMany` call with `$or` query that filters at the database level:
- Recurring events: `dates.recurringEndDate < todayStart`
- Non-recurring events: `dates.startDate < todayStart`

This eliminates loading the full collection into Node.js memory.

### Reservation Booking (`app/api/customer/route.ts`)
**Before**: For each selected date in a reservation booking, the code ran a separate `Reservation.findById()` followed by `Reservation.findOneAndUpdate()` -- resulting in 2N database queries for N dates.

**After**: Builds a single `bulkOps` array and executes one `Reservation.bulkWrite()` call. The reservation document is already loaded once at the start, so date/slot matching uses the in-memory object.

---

## 8. Homepage UI Polish

### SectionDivider Component
New component `components/landing/SectionDivider.tsx` that renders a decorative wave SVG between homepage sections. Used between MainSection/Offerings, Offerings/GiftCardBanner, and GiftCardBanner/Calendar.

### Homepage Layout (`app/page.tsx`)
Added `SectionDivider` between the major homepage sections and imported metadata.

### Section Padding
Calendar section padding reduced from `py-16 md:py-24` to `py-10 md:py-16` for tighter spacing.

### Admin Sidebar (`components/dashboard/SideBar.tsx`)
Reordered navigation items - "Error Logs" moved from middle to bottom of the sidebar list, after "Page Descriptions".

---

## Files Changed Summary

| Category | Added | Modified | Deleted |
|----------|-------|----------|---------|
| Layout/Transition | 0 | 1 | 0 |
| Skeletons | 0 | 0 | 10 |
| Loading Pages | 0 | 0 | 17 |
| Entrance Animations | 0 | 5 | 0 |
| Calendar Redesign | 0 | 1 | 0 |
| SEO Layouts | 9 | 0 | 0 |
| SEO Metadata (pages) | 0 | 14 | 0 |
| SEO (robots/sitemap) | 2 | 0 | 0 |
| API Security | 0 | 12 | 0 |
| API Performance | 0 | 2 | 0 |
| Homepage Polish | 1 | 4 | 0 |
| UI Barrel Export | 0 | 1 | 0 |
| SVG Assets | 4 | 0 | 0 |
| **Total** | **16** | **40** | **27** |

**88 files touched, +1167 / -967 lines**
