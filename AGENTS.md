# Coastal Creations Studio - Architecture Guide

> A Next.js 15 art studio booking & management platform with MongoDB, Square payments, and Sanity CMS

## Quick Context

**Purpose**: Full-featured event booking system for Coastal Creations Studio (Ocean City, NJ)

- **Customer-facing**: Browse/book classes, camps, workshops, private events, reservations with Square payments
- **Admin**: Event management, customer tracking, payment monitoring, refunds, content management, error logging
- **Tech Stack**: Next.js 15, React 18, TypeScript, MongoDB (Mongoose), NextAuth, Square, Sanity CMS, Resend

## Core Philosophy

### KISS & YAGNI

- Choose simple solutions over complex ones
- Build only what's needed now, not speculative features
- Validate inputs early, fail fast

### Design Principles

- **Vertical Slice Architecture**: Organize by features, not layers
- **Dependency Inversion**: Depend on abstractions, not implementations
- **Open/Closed**: Open for extension, closed for modification
- **Single Responsibility**: Components/functions do one thing well

## Project Architecture

```
coastal-creations-app/
├── app/                        # Next.js 15 App Router
│   ├── [slug]/                 # CMS dynamic pages (Sanity)
│   ├── about/                  # About page
│   ├── blog/                   # Blog pages
│   ├── calendar/               # Event calendar
│   │   └── [eventId]/          # Event detail pages
│   │
│   ├── events/                 # Event pages by type
│   │   ├── adult-classes/      # Adult class listings
│   │   ├── kid-classes/        # Kid class listings
│   │   ├── camps/              # Camp listings
│   │   ├── live-artist/        # Live artist events
│   │   ├── events/             # General events/workshops
│   │   ├── classes-workshops/  # All events combined
│   │   └── private-events/     # Private party offerings
│   │
│   ├── reservations/           # Day-by-day bookings
│   │   ├── [reservationId]/    # Reservation booking page
│   │   └── confirmation/       # Booking confirmation
│   │
│   ├── contact-us/             # Contact form
│   ├── gallery/                # Photo gallery
│   ├── payments/               # Payment flows
│   ├── payment-success/        # Success redirect
│   └── square-redirect/        # Square OAuth
│   │
│   ├── admin/
│   │   └── dashboard/          # Admin panel (NextAuth protected)
│   │       ├── add-event/
│   │       ├── edit-event/
│   │       ├── add-reservation/
│   │       ├── edit-reservation/
│   │       ├── reservations/
│   │       ├── add-private-event/
│   │       ├── edit-private-event/
│   │       ├── private-offerings/
│   │       ├── customers/
│   │       ├── upload-images/
│   │       ├── page-descriptions/
│   │       ├── hours/
│   │       └── error-logs/
│   │
│   ├── api/                    # API Routes
│   │   ├── auth/[...nextauth]/ # NextAuth endpoints
│   │   ├── events/             # Event CRUD
│   │   ├── event/[id]/         # Individual event operations
│   │   ├── customer/           # Customer bookings
│   │   ├── reservations/       # Reservation CRUD
│   │   ├── private-events/     # Private event offerings CRUD
│   │   ├── payment-config/     # Square config
│   │   ├── payment-errors/     # Error logging
│   │   ├── refunds/            # Square refund processing
│   │   ├── gallery/            # Gallery CRUD
│   │   ├── eventPictures/      # Event photos
│   │   ├── privateEventPictures/ # Private event photos
│   │   ├── upload-image/       # Upload event images
│   │   ├── upload-private-image/ # Upload private event images
│   │   ├── delete-image/       # Delete images
│   │   ├── send/               # Email API (Resend)
│   │   ├── send-confirmation/  # Booking confirmation emails
│   │   ├── contact/            # Contact form submission
│   │   ├── subscribe/          # Newsletter subscription
│   │   ├── hours/              # Business hours management
│   │   └── page-content/       # CMS page content
│   │
│   ├── actions/                # Server Actions
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles (Tailwind)
│
├── components/                 # Feature-organized components
│   ├── landing/                # Homepage: Hero, Calendar, Offerings
│   ├── calendar/               # Calendar views & event details
│   ├── classes/                # Event display components
│   ├── reservations/           # Reservation booking flow
│   ├── dashboard/              # Admin components
│   │   ├── home/               # Dashboard home
│   │   ├── event-form/         # Add/edit events
│   │   ├── reservation-form/   # Reservation management
│   │   ├── reservations/       # Reservation display
│   │   ├── private-event-form/ # Private event management
│   │   ├── private-offerings/  # Private offerings display
│   │   ├── customers/          # Customer management
│   │   ├── upload-images/      # Gallery upload
│   │   ├── page-descriptions/  # Content management
│   │   ├── errors-logs/        # Error monitoring
│   │   └── shared/             # Shared components
│   ├── payment/                # Square payment components
│   ├── layout/                 # Nav & Footer
│   ├── email-templates/        # React Email templates
│   ├── gallery/                # Gallery components
│   ├── contact/                # Contact form
│   ├── about/                  # About page
│   ├── blog/                   # Blog components
│   ├── authentication/         # Auth components
│   └── providers/              # Context providers
│
├── lib/                        # Core utilities
│   ├── models/                 # Mongoose schemas
│   │   ├── Event.ts            # Events (classes, camps, workshops, artist)
│   │   ├── Customer.ts         # Customer bookings with refunds
│   │   ├── Reservations.ts     # Day-by-day reservations
│   │   ├── PrivateEvent.ts     # Private event offerings
│   │   └── PaymentError.ts     # Error tracking
│   ├── types/
│   │   ├── eventTypes.ts       # Event type definitions
│   │   └── reservationTypes.ts # Reservation type definitions
│   ├── mongoose.ts             # MongoDB connection
│   ├── mongodb.ts              # MongoDB client
│   └── gtag.js                 # Google Analytics
│
├── types/
│   ├── interfaces.ts           # Shared TypeScript interfaces
│   ├── hours.ts                # Business hours types
│   └── pageContent.ts          # CMS content types
│
├── hooks/
│   └── useDaySelection.ts      # Custom hooks
│
├── sanity/                     # Sanity CMS
│   └── client.ts               # Sanity client config
│
├── auth.ts                     # NextAuth config
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config (strict mode)
└── package.json                # Dependencies
```

## Data Models (lib/models/)

### Event.ts

**Purpose**: Core event model for classes, camps, workshops, artist sessions
**Key Features**:

- Recurring patterns (daily, weekly, monthly, yearly)
- Timezone handling (America/New_York)
- Pricing with group discounts
- Participant limits
- Options/add-ons with pricing
- Exclude dates for holidays

**Fields**: eventName, eventType, description, price, numberOfParticipants, dates (startDate, endDate, recurring), time (startTime, endTime), options, discount, image

### Customer.ts

**Purpose**: Booking/registration data
**Key Features**:

- Multiple participants per booking
- Self vs. group registration
- Per-participant options
- Billing info with email/phone validation
- Auto-calculates total based on event price
- Polymorphic event references (Event, PrivateEvent, Reservation)
- Refund tracking (status, amount, date)

**Fields**: event (ref), eventType, selectedDates[] (for reservations), quantity, total, isSigningUpForSelf, participants[], selectedOptions[], billingInfo, squarePaymentId, squareCustomerId, refundStatus, refundAmount, refundedAt

### Reservations.ts

**Purpose**: Day-by-day availability tracking for studio reservations
**Key Features**:

- Price per day per participant pricing model
- Daily capacity limits with real-time tracking
- Date-specific availability (excludes holidays)
- Flexible scheduling (same time all days OR custom times per day)
- Daily booking count tracking (currentBookings vs maxParticipants)
- Options/add-ons with pricing
- Group discounts based on minimum days

**Fields**: eventName, eventType, description, pricePerDayPerParticipant, dates (startDate, endDate, excludeDates), timeType, time, dailyAvailability[], options, discount, image

### PrivateEvent.ts

**Purpose**: Private event offerings (birthdays, custom parties)
**Key Features**:

- Customizable options with pricing
- Deposit requirements
- Image upload support

### PaymentError.ts

**Purpose**: Error tracking for payment failures

## API Routes (app/api/)

**Core Patterns**:

- All routes use `connectMongo()` before DB operations
- Error responses: `{ error: "message" }` format
- Success responses: `{ success: true, data: ... }`
- Timezone: America/New_York for all date operations

### Events & Calendar

- `POST /api/events` - Create event (auto-cleanup on GET)
- `GET /api/events?type=` - List events with filtering
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events?id=` - Delete event
- `GET /api/event/[id]` - Get single event
- `PATCH /api/event/[id]` - Update single event

### Customer Bookings

- `POST /api/customer` - Create booking (handles Events, PrivateEvents, Reservations)
- `GET /api/customer?eventId=&eventType=` - List bookings with filtering
  - For reservations: validates dailyAvailability, atomically updates currentBookings
  - Auto-calculates total if not provided

### Reservations

- `POST /api/reservations` - Create reservation (generates dailyAvailability array)
- `GET /api/reservations?type=&fromDate=&toDate=` - List reservations with filtering
- `PUT /api/reservations/[id]` - Update reservation (regenerates dailyAvailability)
- `DELETE /api/reservations?id=` - Delete reservation
- `GET /api/reservations/[id]` - Get single reservation

### Private Events

- `POST /api/private-events` - Create private event offering
- `GET /api/private-events` - List private event offerings
- `PUT /api/private-events?id=` - Update private event offering
- `DELETE /api/private-events?id=` - Delete private event offering
- `GET /api/private-events/[id]` - Get single private event

### Payments (Square)

- `GET /api/payment-config` - Square SDK config (applicationId, locationId)
- `GET /api/payment-errors?limit=&eventId=&customerEmail=` - List payment errors
- `DELETE /api/payment-errors?id=` - Delete payment error
- `POST /api/refunds` - Process refund (customerId, refundAmount, reason)
- `GET /api/refunds?customerId=` - Get refund status/list refunded customers

### Email (Resend)

- `POST /api/contact` - Contact form submission (validation + email to admin)
- `POST /api/send-confirmation` - Booking confirmation (customerId, eventId)
- `POST /api/subscribe` - Newsletter subscription
- `POST /api/send` - Generic test email

### Gallery & Media (Sanity)

- `GET /api/gallery?destination=` - Fetch gallery images by destination
- `POST /api/gallery` - Upload gallery images (FormData: title, description, destinations, files)
- `PUT /api/gallery` - Update gallery metadata (id, title, description, destinations)
- `DELETE /api/gallery?id=` - Delete gallery image
- `GET /api/eventPictures` - Fetch event pictures
- `GET /api/privateEventPictures` - Fetch private event pictures
- `POST /api/upload-image` - Upload event image (FormData: file, title)
- `POST /api/upload-private-image` - Upload private event image (FormData: file, title)
- `DELETE /api/delete-image?imageUrl=` - Delete image by URL

### CMS Content (Sanity)

- `GET /api/hours` - Get business hours
- `PUT /api/hours` - Update business hours (monday-sunday schedule)
- `GET /api/page-content` - Get page content (homepage, eventPages, otherPages)
- `PUT /api/page-content` - Update page content

## Authentication (auth.ts)

**NextAuth Setup**:

- Google OAuth provider
- Email whitelist: `crystaledgedev22@gmail.com`, `ashley@coastalcreationsstudio.com`
- JWT session strategy
- Admin routes protected via middleware

## Payment Integration

**Square Web Payments SDK**:

- Components: `components/payment/`
- Config API: `/api/payment-config`
- Error logging: `/api/payment-errors` → `PaymentError` model
- Success redirect: `/payment-success`
- Refund processing: `/api/refunds` (partial/full refunds with status tracking)

## Email System

**Resend API**:

- Templates: `components/email-templates/` (React Email)
- Booking confirmations: `/api/send-confirmation`
- Contact form: `/api/contact`
- Newsletter: `/api/subscribe`
- Templates: EventEmailTemplate, CustomerDetailsTemplate, CustomerContactTemplate, NewsletterEmailTemplate, ReservationEmailTemplate

## Key Features

### 1. Multiple Event Types

- **Adult Classes**: Filtered display of adult-oriented classes
- **Kid Classes**: Child-focused class offerings
- **Camps**: Multi-day summer camps
- **Live Artist Events**: Free artist demonstrations (no booking required)
- **General Events**: Workshops and special events
- **Private Events**: Custom party offerings (birthdays, corporate events)

### 2. Reservation System

- Day-by-day booking with flexible date selection
- Real-time availability tracking (currentBookings vs maxParticipants)
- Per-day-per-participant pricing model
- Custom time slots per day OR same time for all days
- Automatic capacity management (atomic updates)
- Confirmation page with booking summary

### 3. Admin Content Management

- **Page Content**: Edit all website text via admin dashboard (homepage hero, offerings, page descriptions)
- **Business Hours**: Manage hours of operation for each day
- **Gallery**: Upload/manage images with destination filtering (adult-class, kid-class, camp, etc.)
- **Event Pictures**: Separate galleries for events and private events
- Changes sync with Sanity CMS (5-minute propagation)

### 4. Refund Management

- Process partial or full refunds via Square API
- Refund status tracking: "none", "partial", "full"
- Customer refund history with timestamps
- Admin can view refunded customers and refund amounts

### 5. Gallery System

- Destination-based filtering (adult-class, kid-class, camp, artist, event, private-event, reservation, general)
- Multiple image upload support
- Edit metadata (title, description, destinations)
- Delete images with asset cleanup
- Separate galleries for events, private events, and main gallery

## Key Configuration Files

### tsconfig.json

- **Target**: ES2017
- **Strict mode**: Enabled
- **Path alias**: `@/*` → `./`

### next.config.ts

- **Images**: Sanity CDN (`cdn.sanity.io`)
- **Dev**: Turbopack enabled

### package.json Scripts

```bash
npm run dev    # Development with Turbopack
npm run build  # Production build
npm run lint   # ESLint check
```

## Development Guidelines

### TypeScript (MANDATORY)

- **NEVER use `any`** - use `unknown` if needed
- **MUST use `ReactElement`** not `JSX.Element` for return types
- **MUST have explicit return types** for all functions/components
- **NEVER use `@ts-ignore`** - fix the type issue

### Component Standards

- **Max 200 lines per component** - refactor if larger
- **Max 500 lines per file** - split if approaching
- **Max 50 lines per function** - keep focused
- **Co-locate tests** in `__tests__/` folders

### State Management Hierarchy

1. **Local State** (`useState`) - component-specific only
2. **Context** - cross-component within a feature
3. **URL State** - search params for shareable state
4. **Server State** - TanStack Query for API data
5. **Global State** - Zustand only when truly needed

### Search Commands

```bash
# ✅ Use ripgrep (rg)
rg "pattern"
rg --files -g "*.tsx"

# ❌ Don't use grep/find
grep -r "pattern" .
find . -name "*.tsx"
```

### Logging Format

```typescript
console.log("[FILENAME-FUNCTION] description and log");
```

### Code Style

- **No emojis** unless explicitly requested
- **Arrow functions** for named components
- **Server Components** by default
- **Client Components** only when needed (interactivity)

## Common Patterns

### Database Connection

```typescript
import { connectMongo } from "@/lib/mongoose";
await connectMongo();
```

### Date Handling

```typescript
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);
const date = dayjs.tz(dateString, "America/New_York");
```

### API Error Handling

```typescript
try {
  // operation
  return Response.json({ success: true, data });
} catch (error) {
  console.error("[API-ROUTE] Error:", error);
  return Response.json({ error: "Message" }, { status: 500 });
}
```

## Finding Things Fast

### Events/Calendar

- **Models**: `lib/models/Event.ts`
- **API**: `app/api/events/`, `app/api/event/[id]/`
- **Types**: `lib/types/eventTypes.ts`, `types/interfaces.ts`
- **Pages**: `app/events/adult-classes/`, `app/events/kid-classes/`, `app/events/camps/`, `app/events/live-artist/`, `app/events/events/`, `app/events/classes-workshops/`
- **Calendar UI**: `components/calendar/`, `components/landing/Calendar.tsx`
- **Event Details**: `app/calendar/[eventId]/`, `components/calendar/eventDetails/`
- **Components**: `components/classes/` (EventCard, EventsContainer)

### Bookings/Customers

- **Models**: `lib/models/Customer.ts` (includes refund tracking)
- **API**: `app/api/customer/`
- **Types**: `types/interfaces.ts` (ICustomer)
- **Admin**: `app/admin/dashboard/customers/`, `components/dashboard/customers/`

### Reservations

- **Models**: `lib/models/Reservations.ts` (dailyAvailability tracking)
- **API**: `app/api/reservations/`, `app/api/reservations/[id]/`
- **Types**: `lib/types/reservationTypes.ts`
- **Pages**: `app/reservations/`, `app/reservations/[reservationId]/`, `app/reservations/confirmation/`
- **Components**: `components/reservations/` (booking flow)
- **Admin**: `app/admin/dashboard/reservations/`, `components/dashboard/reservation-form/`, `components/dashboard/reservations/`

### Private Events

- **Models**: `lib/models/PrivateEvent.ts`
- **API**: `app/api/private-events/`, `app/api/private-events/[id]/`
- **Pages**: `app/events/private-events/`
- **Components**: `components/classes/privateEvents/`
- **Admin**: `app/admin/dashboard/private-offerings/`, `components/dashboard/private-event-form/`

### Admin Dashboard

- **Route**: `app/admin/dashboard/`
- **Components**: `components/dashboard/`
- **Auth**: Protected by NextAuth (see `auth.ts`)
- **Pages**: add-event, edit-event, add-reservation, edit-reservation, add-private-event, edit-private-event, customers, upload-images, page-descriptions, hours, error-logs

### Payments & Refunds

- **Components**: `components/payment/`
- **API**: `app/api/payment-config/`, `app/api/refunds/`
- **Error Tracking**: `app/api/payment-errors/`, `lib/models/PaymentError.ts`
- **Pages**: `app/payments/`, `app/payment-success/`

### Email

- **API**: `app/api/send-confirmation/`, `app/api/contact/`, `app/api/subscribe/`
- **Templates**: `components/email-templates/`
- **Provider**: Resend

### Gallery & Media

- **API**: `app/api/gallery/`, `app/api/eventPictures/`, `app/api/privateEventPictures/`, `app/api/upload-image/`, `app/api/upload-private-image/`, `app/api/delete-image/`
- **Page**: `app/gallery/`
- **Components**: `components/gallery/`
- **Admin**: `app/admin/dashboard/upload-images/`, `components/dashboard/upload-images/`

### CMS Content

- **Config**: `sanity/client.ts`
- **API**: `app/api/page-content/`, `app/api/hours/`
- **Types**: `types/pageContent.ts`, `types/hours.ts`
- **Pages**: `app/[slug]/`, `app/blog/`
- **Admin**: `app/admin/dashboard/page-descriptions/`, `app/admin/dashboard/hours/`

## FORBIDDEN Practices

- NEVER ignore TypeScript errors with `@ts-ignore`
- NEVER use `JSX.Element` (use `ReactElement`)
- NEVER store sensitive data in localStorage
- NEVER use `dangerouslySetInnerHTML` without sanitization
- NEVER exceed file/component size limits
- NEVER prop drill beyond 2 levels
- NEVER commit without passing quality checks
- NEVER create documentation unless explicitly asked

## Testing Requirements

- **Minimum 80% coverage** - NO EXCEPTIONS
- **Co-locate tests** in `__tests__/` folders
- **React Testing Library** for component tests
- **Test user behavior**, not implementation
- **Mock external dependencies**

---

**Quick Start**: `npm run dev` → http://localhost:3000
**Admin**: Login via Google OAuth (whitelisted emails only)
