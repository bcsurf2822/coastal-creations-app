# Coastal Creations Studio - Architecture Guide

> Next.js 16 art studio booking & management platform with MongoDB, Square payments, and Sanity CMS

## Project Purpose

Full-featured event booking + e-commerce platform for Coastal Creations Studio (Ocean City, NJ):

- **Customer-facing**: Browse/book classes, camps, workshops, private events, reservations with Square payments; shop physical products (Art Kits, etc.) through a Square-catalog-driven online store with Shippo-rated shipping; optionally sign in (Google or passwordless magic link) to track bookings & orders in a customer account
- **Admin**: Event management, customer tracking, payment monitoring, refunds, content management, store product/order management
- **Tech Stack**: Next.js 16, React 19, TypeScript, MongoDB (Mongoose), NextAuth (Google + magic link, DB-backed roles), Square (Payments + Catalog), Shippo (shipping), Sanity CMS, Resend, shadcn/ui (customer console), TanStack Query

> **Two independent systems share this codebase:** the original **booking** system (Events / Customers / Reservations / Private Events) and an **additive, independent online store** (Square Catalog + Shippo). The store does not touch the booking models. See the [Online Store](#online-store-e-commerce) section.

## Project Structure

```
coastal-creations-app/
├── app/                          # Next.js 16 App Router
│   ├── [slug]/                   # CMS dynamic pages (Sanity)
│   ├── about/                    # About page
│   ├── blog/                     # Blog pages
│   ├── calendar/                 # Event calendar
│   │   └── [eventId]/            # Event detail pages
│   │
│   ├── events/                   # Event pages by type
│   │   ├── adult-classes/        # Adult class listings + [eventId]
│   │   ├── kid-classes/          # Kid class listings + [eventId]
│   │   ├── camps/                # Camp listings + [eventId]
│   │   ├── live-artist/          # Live artist events + [eventId]
│   │   ├── events/               # General events + [eventId]
│   │   ├── classes-workshops/    # All events combined + [eventId]
│   │   └── private-events/       # Private party offerings
│   │
│   ├── reservations/             # Day-by-day bookings
│   │   ├── [reservationId]/      # Reservation booking + /payment
│   │   └── confirmation/         # Booking confirmation
│   │
│   ├── gift-cards/               # Gift card purchase & balance check
│   │   └── balance/              # Balance lookup page
│   │
│   ├── store/                    # Online store (physical products)
│   │   └── [slug]/               # Product detail page
│   ├── cart/                     # Shopping cart page
│   ├── checkout/                 # 3-step checkout (address → rate → payment)
│   ├── order-confirmation/       # Post-purchase confirmation
│   │
│   ├── login/                    # Customer sign-in (Google + magic link)
│   ├── account/                  # Customer console (auth-protected)
│   │   ├── orders/[orderNumber]/ # My Orders + read-only order detail w/ tracking
│   │   ├── bookings/             # My Bookings
│   │   └── profile/              # Profile
│   │
│   ├── contact-us/               # Contact form
│   ├── walk-in/                  # Walk-in offerings (Mosaics, Canvas Mixed Media, Art Kits)
│   ├── gallery/                  # Photo gallery
│   ├── payments/                 # Payment flows
│   ├── payment-success/          # Success redirect
│   ├── payment/cashapp-callback/ # CashApp OAuth callback
│   │
│   ├── admin/dashboard/          # Admin panel (NextAuth protected)
│   │   ├── add-event/            # Create events
│   │   ├── edit-event/           # Edit events
│   │   ├── events/[eventId]/     # Event customers view
│   │   ├── add-reservation/      # Create reservations
│   │   ├── edit-reservation/     # Edit reservations
│   │   ├── reservations/         # Reservation management + [id]
│   │   ├── add-private-event/    # Create private events
│   │   ├── edit-private-event/   # Edit private events
│   │   ├── private-offerings/    # Private event list
│   │   ├── private-events/[id]/customers/ # Private event customers
│   │   ├── customers/            # Customer management
│   │   ├── gift-cards/           # Gift card management
│   │   ├── upload-images/        # Gallery upload
│   │   ├── page-descriptions/    # CMS content editing
│   │   ├── hours/                # Business hours
│   │   ├── store/                # Store admin (products + orders)
│   │   │   ├── products/         # Toggle online-sellable, parcel preset
│   │   │   └── orders/[id]/      # Order detail (auto-refreshing) + status
│   │   └── error-logs/           # Error monitoring
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── events/               # Event CRUD + [id]
│   │   ├── event/[id]/           # Single event operations
│   │   ├── customer/             # Customer bookings
│   │   ├── reservations/         # Reservation CRUD + [id]
│   │   ├── private-events/       # Private event CRUD + [id]
│   │   ├── payments/             # Process payments
│   │   ├── payment-config/       # Square SDK config
│   │   ├── payment-errors/       # Error logging
│   │   ├── refunds/              # Square refund processing
│   │   ├── gift-cards/           # Gift card operations
│   │   │   ├── list/             # List all gift cards
│   │   │   ├── balance/          # Check balance
│   │   │   ├── redeem/           # Redeem gift card
│   │   │   └── [id]/activities/  # Transaction history
│   │   ├── square/customers/     # Square customer sync + [id], /migrate
│   │   ├── gallery/              # Gallery CRUD
│   │   ├── eventPictures/        # Event photos
│   │   ├── privateEventPictures/ # Private event photos
│   │   ├── upload-image/         # Upload event images
│   │   ├── upload-private-image/ # Upload private event images
│   │   ├── delete-image/         # Delete images
│   │   ├── send/                 # Email API (Resend)
│   │   ├── send-confirmation/    # Booking confirmation emails
│   │   ├── contact/              # Contact form submission
│   │   ├── subscribe/            # Newsletter subscription
│   │   ├── hours/                # Business hours management
│   │   ├── page-content/         # CMS page content
│   │   ├── store/                # Store APIs (customer-facing)
│   │   │   ├── products/         # List sellable catalog items + [id]
│   │   │   ├── shipping-rates/   # Shippo live rate quotes
│   │   │   ├── shipping-label/   # Manual label purchase (admin fallback)
│   │   │   └── checkout/         # Square payment + Order + auto-label
│   │   ├── admin/store/          # Admin store APIs (products, orders, status)
│   │   └── webhooks/shippo/      # Shippo tracking webhook receiver
│   │
│   ├── actions/actions.ts        # Server Actions
│   ├── providers.tsx             # React Query + Auth providers
│   ├── get-query-client.ts       # Query client factory
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── components/                   # Feature-organized components
│   ├── ui/                       # Design System UI Components
│   │   ├── Button.tsx            # 5 variants (primary, secondary, ghost, destructive, pill)
│   │   ├── Input.tsx             # Text input with error state
│   │   ├── Textarea.tsx          # Multiline input with error state
│   │   ├── Select.tsx            # Dropdown with custom arrow
│   │   ├── Label.tsx             # Form labels with required indicator
│   │   ├── Card.tsx              # 3 variants (standard, featured, event)
│   │   ├── Badge.tsx             # 5 status variants (available, fewSpots, soldOut, newClass, upcoming)
│   │   ├── PriceBadge.tsx        # Gradient price display
│   │   ├── index.ts              # Barrel export
│   │   └── shadcn/               # shadcn/ui primitives (new-york) — customer console only
│   ├── account/                  # Customer console UI (AccountNav, OrderStatusBadge)
│   ├── landing/                  # Homepage: Hero, Calendar, Offerings
│   ├── calendar/                 # Calendar views & event details
│   ├── classes/                  # Event display (EventCard, PageHeader, etc.)
│   ├── reservations/             # Reservation booking flow
│   ├── walk-in/                  # Walk-in page (WalkIn, WalkInCard, WalkInImageSlot)
│   ├── payment/                  # Square payment components
│   ├── gift-cards/               # Gift card UI components
│   ├── store/                    # Storefront, cart, checkout (CartProvider, CheckoutForm, ShippingRateStep, PaymentStep, etc.)
│   ├── gallery/                  # Gallery display
│   ├── contact/                  # Contact form
│   ├── about/                    # About page
│   ├── blog/                     # Blog components
│   ├── email-templates/          # React Email templates
│   ├── layout/                   # Nav & Footer
│   ├── authentication/           # LoginForm, AccountNavLink, LogoutButton
│   ├── providers/                # Context providers
│   ├── dashboard/                # Admin components
│   │   ├── home/                 # Dashboard home
│   │   ├── event-form/           # Add/edit events
│   │   ├── reservation-form/     # Reservation management
│   │   ├── reservations/         # Reservation display
│   │   ├── private-event-form/   # Private event management
│   │   ├── private-offerings/    # Private offerings display
│   │   ├── customers/            # Customer management
│   │   ├── gift-cards/           # Gift card admin
│   │   ├── upload-images/        # Gallery upload
│   │   ├── page-descriptions/    # Content management
│   │   ├── errors-logs/          # Error monitoring
│   │   └── shared/               # Shared components
│   ├── PageTransition.tsx        # Page transitions
│   └── PageTransitionProvider.tsx
│
├── hooks/                        # Custom React hooks
│   ├── queries/                  # TanStack Query hooks (data fetching)
│   │   ├── index.ts              # Export all query hooks
│   │   ├── use-events.ts         # useEvents, useEvent
│   │   ├── use-customers.ts      # useCustomers
│   │   ├── use-reservations.ts   # useReservations, useReservation
│   │   ├── use-private-events.ts # usePrivateEvents, usePrivateEvent
│   │   ├── use-gallery.ts        # useGallery
│   │   ├── use-event-pictures.ts # useEventPictures
│   │   ├── use-private-event-pictures.ts
│   │   ├── use-payment-config.ts # usePaymentConfig
│   │   ├── use-payment-errors.ts # usePaymentErrors
│   │   ├── use-hours.ts          # useHours
│   │   └── use-page-content.ts   # usePageContent
│   │
│   ├── mutations/                # TanStack Query mutation hooks
│   │   ├── index.ts              # Export all mutation hooks
│   │   ├── use-create-event.ts   # useCreateEvent
│   │   ├── use-update-event.ts   # useUpdateEvent
│   │   ├── use-delete-event.ts   # useDeleteEvent
│   │   ├── use-create-customer.ts
│   │   ├── use-create-reservation.ts
│   │   ├── use-update-reservation.ts
│   │   ├── use-delete-reservation.ts
│   │   ├── use-create-private-event.ts
│   │   ├── use-update-private-event.ts
│   │   ├── use-delete-private-event.ts
│   │   ├── use-process-refund.ts
│   │   ├── use-update-hours.ts
│   │   ├── use-update-page-content.ts
│   │   ├── use-upload-gallery-image.ts
│   │   ├── use-update-gallery-image.ts
│   │   ├── use-delete-gallery-image.ts
│   │   └── use-delete-payment-error.ts
│   │
│   ├── useDaySelection.ts        # Reservation date selection
│   └── usePageContent.ts         # Legacy page content hook
│
├── lib/                          # Core utilities
│   ├── models/                   # Mongoose schemas
│   │   ├── Event.ts              # Events (classes, camps, workshops)
│   │   ├── Customer.ts           # Customer bookings with refunds
│   │   ├── Reservations.ts       # Day-by-day reservations
│   │   ├── PrivateEvent.ts       # Private event offerings
│   │   ├── Order.ts              # Store orders (Square + Shippo lifecycle)
│   │   ├── StoreProductSettings.ts # Website overlay on Square catalog items
│   │   └── PaymentError.ts       # Error tracking
│   │
│   ├── auth/                     # guards.ts (requireAdmin/requireUser + page variants), roles.ts (DB-backed roles)
│   ├── account/                  # queries.ts (session-scoped: getMyOrders/getMyBookings)
│   │
│   ├── shippo/                   # Shippo shipping SDK utilities
│   │   ├── rates.ts             # getShippingRates (live rate quotes)
│   │   └── labels.ts            # purchaseLabelForOrder (buy label)
│   │
│   ├── square/                   # Square SDK utilities (see also below)
│   │   └── catalog.ts           # listCatalogItems, getInventoryCounts
│   │
│   ├── types/                    # Type definitions
│   │   ├── eventTypes.ts         # Event type definitions
│   │   └── reservationTypes.ts   # Reservation type definitions
│   │
│   ├── square/                   # Square SDK utilities
│   │   ├── customers.ts          # Customer management
│   │   ├── gift-cards.ts         # Gift card operations
│   │   └── payment-config.ts     # Payment configuration
│   │
│   ├── utils/                    # Helper utilities
│   │   ├── eventTypeHelpers.ts   # Event type utilities
│   │   ├── slugify.ts            # URL slug generation
│   │   ├── galleryHelpers.ts     # Gallery utilities
│   │   └── portableTextHelpers.ts # Sanity content helpers
│   │
│   ├── constants/                # App constants
│   │   └── defaultPageContent.ts # Default CMS content
│   │
│   ├── mongoose.ts               # MongoDB connection
│   ├── mongodb.ts                # MongoDB client
│   └── gtag.js                   # Google Analytics
│
├── types/                        # Global TypeScript types
│   ├── interfaces.ts             # Shared interfaces (ICustomer, etc.)
│   ├── hours.ts                  # Business hours types
│   ├── pageContent.ts            # CMS content types
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── sanity/                       # Sanity CMS
│   └── client.ts                 # Sanity client config
│
├── __tests__/                    # Test files (incl. __tests__/auth, __tests__/account)
│
├── scripts/                      # One-off scripts (grant-admin.ts — DB-backed admin grant)
├── auth.ts                       # NextAuth configuration (Google + magic link, DB roles)
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── vitest.config.mts             # Vitest test config
├── vitest.setup.ts               # Test setup
└── package.json                  # Dependencies
```

## Data Models (lib/models/)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Event.ts** | Classes, camps, workshops | eventName, eventType, price, dates, time, recurring, options, discount |
| **Customer.ts** | Booking/registration | event (ref), eventType, selectedDates, participants[], billingInfo, squarePaymentId, refundStatus |
| **Reservations.ts** | Day-by-day availability | eventName, pricePerDayPerParticipant, dailyAvailability[], timeType |
| **PrivateEvent.ts** | Private party offerings | options, deposit, image |
| **Order.ts** | Online store orders | orderNumber, items[], customer, shippingAddress, square{}, shippo{}, status, shippedAt, deliveredAt (money in **cents**) |
| **StoreProductSettings.ts** | Website overlay on a Square catalog item | squareItemId, isOnlineSellable, parcelPreset (SMALL/MEDIUM/LARGE), slug, displayOrder |
| **PaymentError.ts** | Payment failure tracking | error details, customer info |

> **Auth collections** (`users`, `accounts`, `sessions`, `verification_tokens`) are managed by the **NextAuth MongoDB adapter**, not Mongoose models. `users` additionally carries `role` / `isAdmin` (see [Authentication](#authentication--authorization)).

## API Routes Summary

> Admin/privileged routes (`/api/admin/*`, plus writes on events/reservations/private-events/refunds/gift-cards/square-customers/send/gallery/uploads/hours/page-content) enforce admin via `requireAdmin` (see Authentication). Customer-facing reads + checkout/booking stay public.

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth — Google + magic-link sign-in, session, callbacks |
| `/api/events` | GET, POST | List/create events |
| `/api/events/[id]` | GET, PUT, DELETE | Single event operations |
| `/api/customer` | GET, POST | Customer bookings |
| `/api/reservations` | GET, POST | Reservation CRUD |
| `/api/reservations/[id]` | GET, PUT, DELETE | Single reservation |
| `/api/private-events` | GET, POST, PUT, DELETE | Private event offerings |
| `/api/payments` | POST | Process Square payments |
| `/api/payment-config` | GET | Square SDK config |
| `/api/refunds` | GET, POST | Process refunds |
| `/api/gift-cards` | GET, POST | Gift card operations |
| `/api/gift-cards/balance` | POST | Check balance by GAN |
| `/api/gift-cards/redeem` | POST | Redeem gift card |
| `/api/square/customers` | GET, POST | Square customer sync |
| `/api/gallery` | GET, POST, PUT, DELETE | Gallery management |
| `/api/hours` | GET, PUT | Business hours |
| `/api/page-content` | GET, PUT | CMS content |
| `/api/send-confirmation` | POST | Booking confirmation email |
| `/api/contact` | POST | Contact form |
| `/api/store/products` | GET | List online-sellable Square catalog items |
| `/api/store/shipping-rates` | POST | Shippo live rate quotes for a destination + cart |
| `/api/store/checkout` | POST | Square payment → create Order → auto-buy label → emails |
| `/api/store/shipping-label` | POST | Manual label purchase (admin fallback) |
| `/api/admin/store/products` | GET, POST, PUT | Manage store product settings (visibility, parcel) |
| `/api/admin/store/orders` | GET | List store orders |
| `/api/admin/store/orders/[id]` | GET, PATCH | Order detail; PATCH `mark_shipped` or status override |
| `/api/webhooks/shippo` | POST | Shippo tracking webhook → drive order status + emails |

## React Query Hooks

All data fetching uses TanStack Query for caching, background refetching, and optimistic updates.

### Query Hooks (hooks/queries/)

```typescript
import { useEvents, useEvent, useCustomers, useReservations, useReservation,
         usePrivateEvents, usePrivateEvent, useGallery, usePaymentConfig,
         usePaymentErrors, useHours, usePageContent } from "@/hooks/queries";

// Examples
const { data: events, isLoading } = useEvents();           // All events
const { data: events } = useEvents("adult-class");         // Filtered
const { data: event } = useEvent(eventId);                 // Single event
const { data: customers } = useCustomers({ eventId });     // With filters
```

### Mutation Hooks (hooks/mutations/)

```typescript
import { useCreateEvent, useUpdateEvent, useDeleteEvent, useCreateCustomer,
         useProcessRefund, useUpdateHours } from "@/hooks/mutations";

// Examples
const { mutate: createEvent, isPending } = useCreateEvent();
createEvent(eventData, { onSuccess: () => router.push("/...") });
```

Cache invalidation is automatic - mutations invalidate related queries.

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management, caching |
| `next-auth` (v4) | Auth: Google OAuth + magic link; DB-backed roles (database sessions) |
| `nodemailer` | Dormant peer dep of NextAuth EmailProvider (we send magic links via Resend, not SMTP) |
| `radix-ui` + `lucide-react` | Primitives/icons for shadcn/ui (customer console) |
| `mongoose` | MongoDB ODM |
| `square` | Payment processing + Catalog (store products) |
| `react-square-web-payments-sdk` | Payment UI |
| `shippo` | Shipping rate quotes, label purchase, tracking webhooks |
| `resend` | Transactional emails |
| `next-sanity` | CMS integration |
| `@fullcalendar/*` | Calendar UI |
| `@mui/material` | UI components |
| `dayjs` | Date handling (America/New_York timezone) |
| `vitest` | Testing framework |

## Configuration

### Environment Variables Required

```
MONGODB_URI              # MongoDB connection
NEXTAUTH_URL             # Base origin only, e.g. http://localhost:3000 (do NOT append /api/auth)
NEXTAUTH_SECRET          # Auth secret
ADMIN_EMAILS             # Comma-separated admin SEED emails (bootstrap only; roles live in the DB)
GOOGLE_CLIENT_ID         # Google OAuth (customer + admin sign-in)
GOOGLE_CLIENT_SECRET     # Google OAuth
SQUARE_ACCESS_TOKEN      # Square API
SQUARE_APPLICATION_ID    # Square SDK
SQUARE_LOCATION_ID       # Square location
SANITY_PROJECT_ID        # Sanity CMS
SANITY_DATASET           # Sanity dataset
RESEND_API_KEY           # Email service (transactional emails + magic-link sign-in)

# --- Online store (Shippo shipping) ---
SHIPPO_API_KEY           # Shippo API (test key for dev/stage, live for prod)
SHIPPO_WEBHOOK_SECRET    # Shared secret echoed in the webhook URL (?token=)
MERCHANT_SHIP_FROM_NAME  # Ship-from origin (rates + labels)
MERCHANT_SHIP_FROM_STREET
MERCHANT_SHIP_FROM_CITY
MERCHANT_SHIP_FROM_STATE
MERCHANT_SHIP_FROM_ZIP
MERCHANT_SHIP_FROM_COUNTRY   # default US
MERCHANT_SHIP_FROM_PHONE     # REQUIRED by USPS or label purchase fails
MERCHANT_SHIP_FROM_EMAIL     # REQUIRED by USPS or label purchase fails

# --- Email routing ---
STUDIO_EMAIL             # Admin/owner recipient in production
DEV_EMAIL                # In dev/stage, ALL store emails redirect here
```

### Scripts

```bash
pnpm run dev         # Development with Turbopack
pnpm run build       # Production build
pnpm run lint        # ESLint check
pnpm run test        # Run Vitest tests
pnpm run test:run    # Run tests once
```

## Development Guidelines

### TypeScript (Strict)

- Never use `any` - use `unknown` if needed
- Use `ReactElement` not `JSX.Element`
- Explicit return types for all functions
- Never use `@ts-ignore`

### Component Standards

- Max 200 lines per component
- Max 500 lines per file
- Max 50 lines per function
- Arrow functions for components
- Server Components by default

### State Management

1. **Local State** (`useState`) - component-specific
2. **React Query** - server state (primary for API data)
3. **URL State** - shareable state via search params
4. **Context** - cross-component within feature

### Logging

```typescript
console.log("[FILENAME-FUNCTION] description");
```

### API Patterns

```typescript
import { connectMongo } from "@/lib/mongoose";
await connectMongo();

// Success: { success: true, data: ... }
// Error: { error: "message" }

// Admin-only route? Guard FIRST (see Authentication & Authorization):
//   import { requireAdmin } from "@/lib/auth/guards";
//   const g = await requireAdmin();
//   if (g instanceof NextResponse) return g;   // 401/403
```

### Date Handling

```typescript
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);
const date = dayjs.tz(dateString, "America/New_York");
```

## Finding Things

| Feature | Models | API | Pages | Components |
|---------|--------|-----|-------|------------|
| Events | `lib/models/Event.ts` | `/api/events/` | `app/events/` | `components/classes/` |
| Customers | `lib/models/Customer.ts` | `/api/customer/` | `app/admin/dashboard/customers/` | `components/dashboard/customers/` |
| Reservations | `lib/models/Reservations.ts` | `/api/reservations/` | `app/reservations/` | `components/reservations/` |
| Private Events | `lib/models/PrivateEvent.ts` | `/api/private-events/` | `app/events/private-events/` | `components/dashboard/private-event-form/` |
| Store Orders | `lib/models/Order.ts` | `/api/store/checkout/`, `/api/admin/store/orders/` | `app/checkout/`, `app/admin/dashboard/store/orders/` | `components/store/` |
| Store Products | `lib/models/StoreProductSettings.ts` | `/api/store/products/`, `/api/admin/store/products/` | `app/store/`, `app/admin/dashboard/store/products/` | `components/store/` |
| Shipping | - | `/api/store/shipping-rates/`, `/api/webhooks/shippo/` | - | `lib/shippo/`, `lib/utils/parcelHelpers.ts` |
| Payments | - | `/api/payments/`, `/api/refunds/` | `app/payments/` | `components/payment/` |
| Gift Cards | - | `/api/gift-cards/` | `app/gift-cards/` | `components/gift-cards/` |
| Gallery | - | `/api/gallery/` | `app/gallery/` | `components/gallery/` |
| CMS Content | - | `/api/page-content/`, `/api/hours/` | - | `components/dashboard/page-descriptions/` |
| Auth & Accounts | NextAuth `users` (`role`) | `/api/auth/*` | `app/login/`, `app/account/` | `lib/auth/`, `lib/account/`, `components/authentication/`, `components/account/` |

## Online Store (E-commerce)

An **additive, independent** physical-product store layered on the existing app. It does **not** touch the Event/Customer/Reservation booking models. Money is stored in **cents** everywhere (Square-native); convert only at the UI boundary via `lib/utils/moneyHelpers.ts`.

### Catalog-driven (Square owns the products)

- **Square Catalog** is the source of truth for products: name, price, photos, variations, inventory.
- **`StoreProductSettings`** (`lib/models/StoreProductSettings.ts`) is a thin website overlay keyed by `squareItemId`, holding only website-only fields: `isOnlineSellable` (the Shop visibility flag), `parcelPreset` (box size for Shippo), optional `slug`, `displayOrder`, and an optional exact shipping override.
- To sell any catalog item online, the merchant flips `isOnlineSellable` — no code change. `/api/store/products` lists items that are both a sellable physical good (`lib/utils/catalogHelpers.ts`) and online-enabled.

### Order lifecycle (`lib/models/Order.ts`, `status` field)

```
pending -> paid -> label_created -> shipped -> delivered
(cancelled and refunded are terminal off-ramps reachable by admin action)
```

| Status | Set by |
|--------|--------|
| `pending` → `paid` | `/api/store/checkout` after Square captures payment |
| `label_created` | Shippo label auto-purchased at checkout (or manual fallback) |
| `shipped` | **Shippo webhook** on first carrier scan (TRANSIT) — auto |
| `delivered` | **Shippo webhook** on DELIVERED — auto |
| `cancelled` / `refunded` | Admin action |

`shipped`/`delivered` are driven automatically by carrier tracking — the admin no longer toggles them manually. A manual status dropdown remains in admin as a fallback/override.

### Shipping (Shippo)

- **Rates**: `lib/shippo/rates.ts` → `getShippingRates()` quotes live rates from the merchant origin (`MERCHANT_SHIP_FROM_*`) to the customer, using the cart's heaviest parcel preset. Rates are sorted cheapest-first; checkout pre-selects the cheapest.
- **Labels**: `lib/shippo/labels.ts` → `purchaseLabelForOrder()` buys the label (idempotent — returns the existing label if already bought). Auto-invoked at checkout; `/api/store/shipping-label` is the admin-only manual fallback.
- **Parcel presets**: SMALL/MEDIUM/LARGE dimensions+weights in `lib/utils/parcelHelpers.ts` (default MEDIUM ~3lb).
- **Tracking webhook**: `/api/webhooks/shippo` receives `track_updated` events and drives the order:
  - `TRANSIT` (first scan) → mark `shipped`, email customer tracking + notify admin
  - `DELIVERED` → mark `delivered`, email customer (backfills `shippedAt` if no prior TRANSIT)
  - `FAILURE` / `RETURNED` → admin-only exception alert, **no** status change
  - Handlers are idempotent on `shippedAt`/`deliveredAt`. Auth: Shippo can't sign requests, so the secret rides in the URL as `?token=` and is checked against `SHIPPO_WEBHOOK_SECRET`. Register the webhook in the Shippo dashboard (Event: Track Updated; **Test** mode for stage, **Live** for prod) pointing at `<origin>/api/webhooks/shippo?token=<secret>`.

### Checkout flow (`components/store/CheckoutForm.tsx`)

3 steps: **Contact & Shipping** (`ShippingAddressStep`) → **Shipping Method** (`ShippingRateStep`, collapsed to the recommended rate with a "choose another" toggle) → **Payment** (`PaymentStep`, Square Web Payments SDK). Cart state lives in `CartProvider` (React Context, persisted client-side).

### Transactional emails (`components/email-templates/`)

| Template | Trigger | Recipient |
|----------|---------|-----------|
| `OrderConfirmationEmail` | checkout success | customer |
| `StoreOrderAdminEmail` | checkout success | admin (label link / action-needed) |
| `ShippingConfirmationEmail` | TRANSIT → shipped | customer + admin |
| `DeliveryConfirmationEmail` | DELIVERED | customer |
| `ShipmentExceptionEmail` | FAILURE / RETURNED | admin only |

In dev/stage, **all** store emails redirect to `DEV_EMAIL`; in production, customer emails go to the customer and admin emails to `STUDIO_EMAIL`.

### Admin

`app/admin/dashboard/store/` — product visibility/parcel management and an order list + detail view. The order detail page **auto-refreshes** (15s polling) so webhook-driven status changes appear without a manual refresh; polling stops on terminal statuses and pauses when the tab is hidden.

## Authentication & Authorization

NextAuth v4 + MongoDB adapter, **`database` session strategy** (NOT JWT). One system serves
both **admins** and **customers**; a DB-backed role decides access. Config lives in `auth.ts`.

### Sign-in (`auth.ts`)
- **Google OAuth** and **passwordless magic link** (NextAuth `EmailProvider` with a custom
  `sendVerificationRequest` that sends via **Resend** — no SMTP; `nodemailer` is only a dormant
  peer dep). Magic links are single-use, ~10-min TTL, with a DB-backed per-email rate limit.
- **Anyone can sign in** (customers + admins). New users default to `role: "customer"`.

### Roles are DB-backed (`lib/auth/roles.ts`)
- The NextAuth `users` collection carries `role: "customer" | "admin"` (+ `isAdmin`).
- Admins are seeded from `ADMIN_EMAILS` via `events.createUser` + a sign-in promotion, with a
  session fallback. **`ADMIN_EMAILS` is a bootstrap SEED ONLY — never the request-time gate.**
- Grant/revoke admin in the DB with `scripts/grant-admin.ts <email> [--revoke]` (no redeploy).

### Authorization is enforced in code, NOT middleware (`lib/auth/guards.ts`)
Because sessions are DB-backed, Edge `middleware.ts` can't read the role — so authz lives in
route handlers and server components:
- API routes: `const g = await requireAdmin(); if (g instanceof NextResponse) return g;`
  (`requireAdmin` → 401 if not signed in, 403 if signed-in-but-not-admin; `requireUser` → 401 only).
- Server components/pages: `requireAdminPage()` / `requireUserPage()` (redirect variants).
- **Every** admin route + the `/admin/dashboard` shell uses these; there is NO `NODE_ENV` dev
  bypass. `__tests__/auth/` asserts a customer session gets 403 on every admin route.

### Customer accounts (`app/login/`, `app/account/`)
- `/login` — Google + magic link (`components/authentication/LoginForm.tsx`).
- `/account` (protected by `requireUserPage`) — **Overview**, **My Orders** (live status + a detail
  page with tracking and an ownership re-check), **My Bookings**, **Profile**. Reads are scoped
  strictly to the session email via `lib/account/queries.ts` (case-insensitive; never client-supplied).
- Nav shows "Sign in / My Account" (`components/authentication/AccountNavLink.tsx`).
- Guest checkout/booking still work without an account. Bookings/orders are linked to a user by
  **email** (a `userId` stamp is a future enhancement); store checkout also sets
  `Order.square.customerId` for unified Square history.
- The customer console uses **shadcn/ui** (`components/ui/shadcn/`), kept separate from the
  storefront `components/ui/*` design system — both coexist (see Design System).

### Protected routes
- `/admin/*` (admin role required) · `/account/*` (any authenticated user).

## Design System

The application uses a custom design system with CSS variables and reusable UI components. **Always use these components and tokens for consistency.**

> **Two UI systems coexist.** The **storefront, booking, and admin** surfaces use this custom design system (`components/ui/*`, `--color-*` tokens). The **customer console** (`/account`, `/login`) uses **shadcn/ui** (`components/ui/shadcn/*`, new-york style) themed on-brand in `app/globals.css` — its shadcn tokens (`--background`, `--foreground`, `--card`, `--primary`, etc.) are defined **without** overwriting the storefront `--color-*` tokens. Use the custom system for storefront/admin work; use shadcn only inside the customer console.

### Design Tokens (app/globals.css)

```css
/* Colors */
--color-primary: #0c4a6e;       /* Sky-900 - main brand */
--color-primary-dark: #073a58;  /* Darker primary */
--color-secondary: #0369a1;     /* Sky-700 */
--color-accent: #fb923c;        /* Orange-400 - CTA buttons */
--color-light: #f0f9ff;         /* Sky-50 - backgrounds */

/* Semantic Colors */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;

/* Gradients */
--gradient-primary: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
--gradient-accent: linear-gradient(135deg, var(--color-accent), #f97316);
--gradient-hero: linear-gradient(180deg, #e0f2fe, #bae6fd, #7dd3fc);

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
--shadow-card: 0 4px 6px -1px rgba(12, 74, 110, 0.1);

/* Border Radii */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.5rem;
--radius-full: 9999px;
```

### UI Components (components/ui/)

Import from the barrel export:
```typescript
import { Button, Input, Textarea, Select, Label, Card, Badge, PriceBadge } from "@/components/ui";
```

| Component | Variants | Usage |
|-----------|----------|-------|
| **Button** | `primary`, `secondary`, `ghost`, `destructive`, `pill` | All buttons, CTAs |
| **Input** | - | Text inputs with error state |
| **Textarea** | - | Multiline inputs with error state |
| **Select** | - | Dropdowns with custom styling |
| **Label** | - | Form labels with required indicator |
| **Card** | `standard`, `featured`, `event` | Content containers |
| **Badge** | `available`, `fewSpots`, `soldOut`, `newClass`, `upcoming` | Status indicators |
| **PriceBadge** | - | Price display with gradient background |

### PageHeader Component (components/classes/PageHeader.tsx)

Used on all event listing pages with centered card-style design:

```typescript
import PageHeader from "@/components/classes/PageHeader";

<PageHeader
  title="Adult Workshops"
  subtitle="Description text here..."
  variant="adult" // adult | kid | events | camps | all
  leftIcon={<FaPalette />}
  rightIcon={<GiPaintBrush />}
/>
```

Each variant has specific SVG decorations from `/public/assets/svg/`.

### Usage Guidelines

1. **Always use UI components** instead of raw HTML elements for forms and buttons
2. **Use CSS variables** for colors, shadows, and spacing
3. **Use Tailwind classes** that reference CSS variables where possible
4. **Maintain consistency** - check existing implementations before creating new patterns

---

