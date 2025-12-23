# Coastal Creations Studio - Architecture Guide

> Next.js 15 art studio booking & management platform with MongoDB, Square payments, and Sanity CMS

## Project Purpose

Full-featured event booking system for Coastal Creations Studio (Ocean City, NJ):

- **Customer-facing**: Browse/book classes, camps, workshops, private events, reservations with Square payments
- **Admin**: Event management, customer tracking, payment monitoring, refunds, content management
- **Tech Stack**: Next.js 15, React 18, TypeScript, MongoDB (Mongoose), NextAuth, Square, Sanity CMS, Resend, TanStack Query

## Project Structure

```
coastal-creations-app/
├── app/                          # Next.js 15 App Router
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
│   ├── contact-us/               # Contact form
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
│   │   └── page-content/         # CMS page content
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
│   │   └── index.ts              # Barrel export
│   ├── landing/                  # Homepage: Hero, Calendar, Offerings
│   ├── calendar/                 # Calendar views & event details
│   ├── classes/                  # Event display (EventCard, PageHeader, etc.)
│   ├── reservations/             # Reservation booking flow
│   ├── payment/                  # Square payment components
│   ├── gift-cards/               # Gift card UI components
│   ├── gallery/                  # Gallery display
│   ├── contact/                  # Contact form
│   ├── about/                    # About page
│   ├── blog/                     # Blog components
│   ├── email-templates/          # React Email templates
│   ├── layout/                   # Nav & Footer
│   ├── authentication/           # Auth components
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
│   │   └── PaymentError.ts       # Error tracking
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
├── __tests__/                    # Test files
│
├── auth.ts                       # NextAuth configuration
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
| **PaymentError.ts** | Payment failure tracking | error details, customer info |

## API Routes Summary

| Route | Methods | Purpose |
|-------|---------|---------|
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
| `next-auth` | Authentication (Google OAuth) |
| `mongoose` | MongoDB ODM |
| `square` | Payment processing |
| `react-square-web-payments-sdk` | Payment UI |
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
NEXTAUTH_SECRET          # Auth secret
GOOGLE_CLIENT_ID         # OAuth
GOOGLE_CLIENT_SECRET     # OAuth
SQUARE_ACCESS_TOKEN      # Square API
SQUARE_APPLICATION_ID    # Square SDK
SQUARE_LOCATION_ID       # Square location
SANITY_PROJECT_ID        # Sanity CMS
SANITY_DATASET           # Sanity dataset
RESEND_API_KEY           # Email service
```

### Scripts

```bash
npm run dev         # Development with Turbopack
npm run build       # Production build
npm run lint        # ESLint check
npm run test        # Run Vitest tests
npm run test:run    # Run tests once
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
| Payments | - | `/api/payments/`, `/api/refunds/` | `app/payments/` | `components/payment/` |
| Gift Cards | - | `/api/gift-cards/` | `app/gift-cards/` | `components/gift-cards/` |
| Gallery | - | `/api/gallery/` | `app/gallery/` | `components/gallery/` |
| CMS Content | - | `/api/page-content/`, `/api/hours/` | - | `components/dashboard/page-descriptions/` |

## Authentication

- **Provider**: Google OAuth
- **Whitelist**: `crystaledgedev22@gmail.com`, `ashley@coastalcreationsstudio.com`
- **Session**: JWT strategy
- **Protected Routes**: `/admin/*`

## Design System

The application uses a custom design system with CSS variables and reusable UI components. **Always use these components and tokens for consistency.**

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

**Quick Start**: `npm run dev` -> http://localhost:3000
