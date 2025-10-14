# Coastal Creations Studio - Architecture Guide

> A Next.js 15 art studio booking & management platform with MongoDB, Square payments, and Sanity CMS

## Quick Context

**Purpose**: Full-featured event booking system for Coastal Creations Studio (Ocean City, NJ)
- **Customer-facing**: Browse/book classes, camps, workshops, private events with Square payments
- **Admin**: Event management, customer tracking, payment monitoring, error logging
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
│   ├── (routes)/
│   │   ├── [slug]/             # CMS dynamic pages
│   │   ├── about/              # About page
│   │   ├── blog/               # Blog pages
│   │   ├── calendar/           # Event calendar
│   │   │   └── [eventId]/      # Event detail pages
│   │   ├── classes/            # Class offerings
│   │   │   ├── live-artist/
│   │   │   ├── private-events/
│   │   │   └── summer-camps/
│   │   ├── contact-us/         # Contact form
│   │   ├── gallery/            # Photo gallery
│   │   ├── payments/           # Payment flows
│   │   ├── payment-success/    # Success redirect
│   │   └── square-redirect/    # Square OAuth
│   │
│   ├── admin/
│   │   └── dashboard/          # Admin panel (NextAuth protected)
│   │
│   ├── api/                    # API Routes
│   │   ├── auth/[...nextauth]/ # NextAuth endpoints
│   │   ├── events/             # Event CRUD
│   │   ├── customer/           # Customer bookings
│   │   ├── reservations/       # Reservation management
│   │   ├── private-events/     # Private event offerings
│   │   ├── payment-config/     # Square config
│   │   ├── payment-errors/     # Error logging
│   │   ├── gallery/            # Gallery images
│   │   ├── send/               # Email API (Resend)
│   │   └── hours/              # Business hours
│   │
│   ├── actions/                # Server Actions
│   ├── layout.tsx              # Root layout (fonts, analytics, toasts)
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles (Tailwind)
│
├── components/                 # Feature-organized components
│   ├── landing/                # Homepage: Hero, MainSection, Offerings, Calendar
│   ├── calendar/               # Calendar views & event details
│   ├── classes/                # Class-specific components
│   │   ├── liveEvents/
│   │   ├── privateEvents/
│   │   └── summer-camps/
│   ├── dashboard/              # Admin components
│   │   ├── home/               # Dashboard home
│   │   ├── event-form/         # Add/edit events
│   │   ├── reservation-form/   # Reservation management
│   │   ├── private-event-form/ # Private event management
│   │   ├── private-offerings/  # Private offerings display
│   │   └── errors-logs/        # Error monitoring
│   ├── payment/                # Square payment components
│   ├── layout/                 # Nav & Footer
│   ├── email-templates/        # React Email templates
│   ├── gallery/                # Gallery components
│   ├── contact/                # Contact form components
│   ├── about/                  # About page components
│   ├── blog/                   # Blog components
│   ├── authentication/         # Auth components
│   └── providers/              # Context providers
│
├── lib/                        # Core utilities
│   ├── models/                 # Mongoose schemas
│   │   ├── Event.ts            # Events (classes, camps, workshops, artist)
│   │   ├── Customer.ts         # Customer bookings
│   │   ├── Reservations.ts     # Reservations
│   │   ├── PrivateEvent.ts     # Private event offerings
│   │   └── PaymentError.ts     # Error tracking
│   ├── types/
│   │   ├── eventTypes.ts       # Event type definitions
│   │   └── reservationTypes.ts # Reservation type definitions
│   ├── mongoose.ts             # MongoDB connection (connectMongo)
│   ├── mongodb.ts              # MongoDB client
│   └── gtag.js                 # Google Analytics
│
├── types/
│   └── interfaces.ts           # Shared TypeScript interfaces
│
├── hooks/
│   └── useDaySelection.ts      # Custom hooks
│
├── sanity/                     # Sanity CMS
│   └── client.ts               # Sanity client config
│
├── auth.ts                     # NextAuth config (Google OAuth, email whitelist)
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

**Fields**: event (ref), quantity, total, isSigningUpForSelf, participants[], selectedOptions[], billingInfo

### Reservations.ts
**Purpose**: Day-by-day availability tracking
**Key Features**:
- Price per day per participant
- Daily capacity limits
- Date-specific availability

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
- Error responses follow: `{ error: "message" }` format
- Success responses: `{ success: true, data: ... }`

### Key Routes
- `POST /api/events` - Create event
- `GET /api/events` - List events (with date filtering)
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/customer` - Create booking
- `GET /api/customer` - List bookings
- `POST /api/reservations` - Create reservation
- `GET /api/payment-config` - Square config
- `POST /api/send` - Send emails via Resend
- `POST /api/gallery` - Upload images
- `GET /api/hours` - Business hours

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

## Email System

**Resend API** (`/api/send`):
- Templates: `components/email-templates/`
- Confirmation emails on booking
- Admin notifications

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
console.log('[FILENAME-FUNCTION] description and log');
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
  console.error('[API-ROUTE] Error:', error);
  return Response.json({ error: "Message" }, { status: 500 });
}
```

## Finding Things Fast

### Events/Calendar
- **Models**: `lib/models/Event.ts`
- **API**: `app/api/events/`
- **Types**: `lib/types/eventTypes.ts`, `types/interfaces.ts`
- **Calendar UI**: `components/calendar/`, `components/landing/Calendar.tsx`
- **Event Details**: `app/calendar/[eventId]/`, `components/calendar/eventDetails/`

### Bookings/Customers
- **Models**: `lib/models/Customer.ts`
- **API**: `app/api/customer/`
- **Types**: `types/interfaces.ts` (ICustomer)

### Reservations
- **Models**: `lib/models/Reservations.ts`
- **API**: `app/api/reservations/`
- **Types**: `lib/types/reservationTypes.ts`
- **Forms**: `components/dashboard/reservation-form/`

### Private Events
- **Models**: `lib/models/PrivateEvent.ts`
- **API**: `app/api/private-events/`
- **Page**: `app/classes/private-events/`
- **Components**: `components/classes/privateEvents/`
- **Forms**: `components/dashboard/private-event-form/`

### Admin Dashboard
- **Route**: `app/admin/dashboard/`
- **Components**: `components/dashboard/`
- **Auth**: Protected by NextAuth (see `auth.ts`)

### Payments
- **Components**: `components/payment/`
- **Config API**: `app/api/payment-config/`
- **Error Tracking**: `app/api/payment-errors/`, `lib/models/PaymentError.ts`

### Email
- **API**: `app/api/send/`
- **Templates**: `components/email-templates/`
- **Provider**: Resend

### Gallery
- **API**: `app/api/gallery/`, `app/api/upload-image/`
- **Page**: `app/gallery/`
- **Components**: `components/gallery/`

### CMS Content
- **Config**: `sanity/client.ts`
- **Dynamic Pages**: `app/[slug]/`

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
