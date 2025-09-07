name: "Multi-Day Reservation System - TypeScript PRP v1.0"
description: |

---

## Goal

**Feature Goal**: Implement a comprehensive multi-day reservation system that allows administrators to create week-long summer camps with flexible tiered pricing, and enables end users to select specific days within the reservation period with real-time price calculations.

**Deliverable**: Complete multi-day reservation feature including:
- Admin interface for creating multi-day events with flexible pricing tiers
- End user day selection interface with dynamic pricing display
- Enhanced Event and Customer models with reservation-specific fields
- React Hook Form + Zod validation integration
- Payment processing integration with Square
- Comprehensive test coverage

**Success Definition**: 
- Admins can create 7-day summer camp events with pricing tiers (1 day = $75, 2 days = $140, etc.)
- End users can select any combination of days within the reservation period
- System calculates correct price based on number of days selected and applies appropriate discounts
- All data is validated with Zod schemas and persists correctly to MongoDB
- Payment processing works seamlessly with existing Square integration

## User Persona

**Target User**: Creative arts business administrators and summer camp parents

**Use Case**: 
- **Admin**: Creating week-long summer camps with flexible attendance options and tiered pricing
- **End User**: Booking children for specific days within a summer camp week based on schedule and budget

**User Journey**:
1. **Admin**: Creates "Summer Art Camp Week 1" spanning July 15-21 with pricing tiers
2. **Admin**: Sets pricing: 1 day ($75), 2 days ($140), 3 days ($200), full week ($400)
3. **End User**: Views available summer camps and selects "Summer Art Camp Week 1"
4. **End User**: Uses calendar interface to select Tuesday, Wednesday, Friday (3 days)
5. **End User**: Sees price calculation: 3 days = $200 (saves $25 vs individual pricing)
6. **End User**: Completes booking with participant details and payment

**Pain Points Addressed**:
- Current system only supports single-day or fixed-duration events
- No flexible pricing for partial week attendance
- Parents need cost-effective options for partial camp attendance
- Manual price calculation for multi-day events

## Why

- **Business Value**: Increases booking flexibility and revenue potential by offering partial week options with incentive pricing for longer stays
- **User Impact**: Parents can afford camp participation by choosing fewer days while still receiving bulk pricing benefits
- **Integration Benefits**: Extends existing event system without breaking current functionality
- **Market Demand**: Summer camps commonly offer partial week attendance options

## What

Comprehensive multi-day reservation system with the following user-visible behavior:

### Admin Functionality
- Create multi-day reservation events with start and end dates
- Configure flexible pricing tiers for different day counts (1-7 days)
- Set capacity limits and manage bookings dashboard
- View detailed reservation reports with selected days per customer

### End User Functionality  
- Browse available multi-day reservation events
- Interactive calendar to select specific days within reservation period
- Real-time price calculation with discount visualization
- Standard booking flow with participant details and payment

### Technical Requirements
- Extend Event model with reservationSettings field
- Extend Customer model with reservationDetails field
- Implement React Hook Form + Zod for all form validation
- Integrate with existing Square payment processing
- Maintain backward compatibility with existing event types

### Success Criteria

- [ ] Admin can create multi-day events with 7-day duration and flexible pricing tiers
- [ ] End users can select 1-7 days from reservation period via calendar interface
- [ ] Price calculation shows base price, discount amount, and final total
- [ ] All form validation uses Zod schemas with TypeScript type inference
- [ ] Payment processing captures reservation details and selected dates
- [ ] MongoDB stores complete reservation data with proper indexing
- [ ] Comprehensive test coverage (80%+) for all new functionality
- [ ] Existing event types (class, workshop, camp, artist) remain fully functional

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this TypeScript/React/Next.js codebase, would they have everything needed to implement this multi-day reservation system successfully?"_

This PRP provides complete context including existing patterns, specific file references, Zod validation approaches, React Hook Form integration, and MongoDB schema extensions.

### Documentation & References

```yaml
# MUST READ - Include these in your context window

# React Hook Form + Zod Integration
- url: https://react-hook-form.com/get-started#SchemaValidation
  why: Official Zod resolver integration patterns and TypeScript setup
  critical: zodResolver setup with proper TypeScript type inference

- url: https://github.com/react-hook-form/resolvers#zod
  why: @hookform/resolvers package documentation and zodResolver examples
  critical: Installation requirements and TypeScript integration patterns

- url: https://react-hook-form.com/docs/usefieldarray
  why: Dynamic form fields for pricing tier management and day selection
  critical: useFieldArray patterns for complex nested form structures

# Zod Validation Patterns  
- url: https://zod.dev/?id=objects
  why: Object schema validation patterns for nested reservation settings
  critical: Schema composition and type inference with z.infer<typeof schema>

- url: https://zod.dev/?id=arrays
  why: Array validation for pricing tiers and selected dates
  critical: Array schema validation and custom error messages

# Next.js 15 App Router Patterns
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
  why: Server Actions for form submission and data mutations
  critical: Server-side validation and error handling patterns

# Existing Codebase Patterns
- file: lib/models/Event.ts
  why: Current Event schema structure and extension patterns
  pattern: Interface extension, Mongoose schema patterns, validation middleware
  gotcha: Optional fields must be properly typed and validated conditionally

- file: lib/models/Customer.ts  
  why: Customer booking patterns and payment integration
  pattern: Nested object structures, populate patterns, price calculation middleware
  gotcha: Pre-save middleware for total calculation, participant validation

- file: components/dashboard/add-event/EventForm.tsx
  why: Complex form management patterns with dynamic fields
  pattern: Manual state management, validation patterns, conditional rendering
  gotcha: 1,287 lines - needs refactoring with React Hook Form for maintainability

- file: components/payment/BillingForm.tsx
  why: Payment processing integration with Square
  pattern: Dynamic participant management, billing details handling
  gotcha: Complex participant option selection patterns

- file: app/api/events/route.ts
  why: Event CRUD API patterns and error handling
  pattern: MongoDB connection, request validation, response formatting
  gotcha: Manual validation patterns that should be replaced with Zod

# Custom Documentation for Complex Patterns
- docfile: PRPs/ai_docs/react_hook_form_zod_patterns.md  
  why: Comprehensive examples of React Hook Form + Zod integration for complex forms
  section: Dynamic field arrays, nested validation, TypeScript integration

- docfile: PRPs/ai_docs/mongoose_schema_extension.md
  why: Safe MongoDB schema extension patterns for existing models
  section: Optional field addition, backward compatibility, indexing strategies
```

### Current Codebase Tree

```bash
coastal-creations-app/
├── app/
│   ├── api/
│   │   ├── events/route.ts              # Event CRUD operations
│   │   ├── customer/route.ts            # Customer booking operations  
│   │   └── payment-config/route.ts      # Square payment configuration
│   ├── admin/dashboard/
│   │   ├── add-event/page.tsx           # Event creation page
│   │   └── edit-event/[id]/page.tsx     # Event editing page
│   └── calendar/[eventId]/page.tsx      # Event detail and booking page
├── components/
│   ├── dashboard/add-event/
│   │   ├── EventForm.tsx                # Main event creation form (1,287 lines)
│   │   └── EditEvent.tsx                # Event editing component
│   ├── payment/
│   │   ├── BillingForm.tsx              # Customer billing and participant form
│   │   └── PaymentProcessor.tsx         # Square payment integration
│   └── calendar/eventDetails/
│       └── BookingForm.tsx              # Event booking interface
├── lib/
│   ├── models/
│   │   ├── Event.ts                     # Event MongoDB schema
│   │   ├── Customer.ts                  # Customer/booking schema
│   │   └── PaymentError.ts              # Payment error tracking
│   ├── utils.ts                         # Utility functions
│   └── db.ts                            # MongoDB connection
└── types/
    └── interfaces.ts                    # Shared TypeScript types
```

### Desired Codebase Tree with New Files

```bash
coastal-creations-app/
├── lib/
│   ├── validations/                     # NEW - Zod validation schemas
│   │   ├── eventValidation.ts           # Event form validation schemas
│   │   ├── customerValidation.ts        # Customer/reservation validation schemas
│   │   └── reservationValidation.ts     # Reservation-specific validation
│   ├── models/ 
│   │   ├── Event.ts                     # MODIFIED - Add reservationSettings field
│   │   └── Customer.ts                  # MODIFIED - Add reservationDetails field
├── components/
│   ├── dashboard/add-event/
│   │   ├── EventForm.tsx                # REFACTORED - Use React Hook Form + Zod
│   │   ├── ReservationPricingForm.tsx   # NEW - Reservation pricing configuration
│   │   └── ReservationSettings.tsx      # NEW - Reservation settings component
│   ├── reservation/                     # NEW - Reservation-specific components
│   │   ├── DaySelectionCalendar.tsx     # NEW - Multi-day calendar selection
│   │   ├── PriceCalculator.tsx          # NEW - Dynamic pricing display
│   │   └── ReservationSummary.tsx       # NEW - Booking summary component
│   └── forms/                           # NEW - Reusable form components
│       ├── FormField.tsx                # NEW - Reusable form field with Zod
│       └── FormFieldArray.tsx           # NEW - Dynamic field array component
├── hooks/                               # NEW - Custom React hooks
│   ├── useReservationPricing.ts         # NEW - Pricing calculation logic
│   ├── useDaySelection.ts               # NEW - Calendar day selection state
│   └── useEventForm.ts                  # NEW - Event form state management
└── __tests__/                           # NEW - Comprehensive test coverage
    ├── components/reservation/          # NEW - Component tests
    ├── hooks/                           # NEW - Hook tests  
    ├── lib/validations/                 # NEW - Validation schema tests
    └── api/                             # NEW - API route tests
```

### Known Gotchas of Codebase & Library Quirks

```typescript
// CRITICAL: Next.js 15 App Router requirements
// 'use client' directive must be at top of file for client components
// Server Components cannot use useState, useEffect, or event handlers
// API routes must export named functions (GET, POST, etc.)

// CRITICAL: Existing form patterns are manual state management 
// Current codebase does NOT use React Hook Form or Zod
// EventForm.tsx is 1,287 lines with manual validation - needs complete refactor
// All existing forms use useState and custom validation functions

// CRITICAL: TypeScript strict mode enabled
// NEVER use any type - use unknown if type is truly unknown  
// MUST have explicit return types for all functions and components
// Use ReactElement instead of JSX.Element (JSX namespace not available)

// CRITICAL: MongoDB/Mongoose patterns
// Uses connectMongo() helper function for all API routes
// Pre-save middleware for Customer model calculates total price
// Event model has complex nested objects for dates, options, discount
// MUST maintain backward compatibility with existing events

// CRITICAL: Payment integration with Square
// Uses Server Actions for payment processing
// PaymentError model tracks failed transactions with structured data
// Amount conversion required (dollars to cents)
// Idempotency keys prevent duplicate payments

// CRITICAL: Zod validation requirements (NEW ADDITION)
// Use z.infer<typeof schema> for TypeScript type inference
// Validate ALL external data including API requests, form inputs, URL params
// Use branded types for all IDs: z.string().uuid().brand<"EventId">()
// Server-side validation must match client-side Zod schemas exactly
```

## Implementation Blueprint

### Data Models and Structure

Core data models ensuring type safety and consistency with existing patterns:

```typescript
// lib/validations/reservationValidation.ts
import { z } from "zod";

// Branded types for type safety
const EventIdSchema = z.string().min(1).brand<"EventId">();
const CustomerIdSchema = z.string().min(1).brand<"CustomerId">();

// Reservation pricing tier validation
export const pricingTierSchema = z.object({
  numberOfDays: z.number().min(1).max(30),
  price: z.number().min(0),
  label: z.string().optional(), // e.g., "Full Week Special"
});

// Reservation settings for Event model extension
export const reservationSettingsSchema = z.object({
  dayPricing: z.array(pricingTierSchema).min(1, "At least one pricing tier required"),
  maxDays: z.number().min(1).max(30),
  requireConsecutiveDays: z.boolean().optional().default(false),
  dailyCapacity: z.number().min(1).optional(),
}).refine(data => {
  // Validate no duplicate day counts
  const dayCounts = data.dayPricing.map(tier => tier.numberOfDays);
  const uniqueDayCounts = new Set(dayCounts);
  return uniqueDayCounts.size === dayCounts.length;
}, {
  message: "Duplicate day counts not allowed in pricing tiers",
  path: ["dayPricing"]
});

// Reservation details for Customer model extension  
export const reservationDetailsSchema = z.object({
  selectedDates: z.array(z.date()).min(1, "At least one date must be selected"),
  numberOfDays: z.number().min(1),
  appliedPriceTier: z.object({
    numberOfDays: z.number(),
    price: z.number(),
    label: z.string().optional(),
  }),
  isConsecutive: z.boolean(),
  checkInDate: z.date(),
  checkOutDate: z.date().optional(),
});

// Form validation schemas
export const eventFormSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventType: z.enum(["class", "camp", "workshop", "artist", "reservation"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0).optional(),
  numberOfParticipants: z.number().min(1).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  reservationSettings: reservationSettingsSchema.optional(),
  image: z.instanceof(File).optional(),
}).refine(data => {
  if (data.eventType === "reservation") {
    return !!data.reservationSettings && !!data.endDate;
  }
  return true;
}, {
  message: "Reservation events must have reservation settings and end date",
  path: ["reservationSettings"]
});

// Type inference for TypeScript
export type ReservationSettings = z.infer<typeof reservationSettingsSchema>;
export type ReservationDetails = z.infer<typeof reservationDetailsSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
export type PricingTier = z.infer<typeof pricingTierSchema>;
```

### Implementation Tasks (ordered by dependencies)

**Task Organization**: Implementation broken into 18 focused tasks, each designed to take 2-4 hours of development time to stay under 20 total tasks while maintaining comprehensive coverage.

```yaml
Task 1: SETUP - Install dependencies and create validation foundation (2 hours)
  - INSTALL: npm install react-hook-form @hookform/resolvers zod
  - CREATE: lib/validations/reservationValidation.ts with all Zod schemas
  - IMPLEMENT: Branded types, pricing tier validation, reservation settings schema
  - DEPENDENCIES: None
  - COMPLETION: All validation schemas with TypeScript inference ready

Task 2: DATABASE - Extend MongoDB models for reservation support (3 hours)
  - MODIFY: lib/models/Event.ts - Add optional reservationSettings field
  - MODIFY: lib/models/Customer.ts - Add optional reservationDetails field  
  - IMPLEMENT: Mongoose pre-validation middleware for reservation events
  - TEST: MongoDB MCP direct validation of schema changes
  - COMPLETION: Database ready for reservation data with backward compatibility

Task 3: FORMS - Create reusable form components with React Hook Form (4 hours)
  - CREATE: components/forms/FormField.tsx - Base form field with Zod integration
  - CREATE: components/forms/FormFieldArray.tsx - Dynamic field arrays
  - IMPLEMENT: Generic TypeScript interfaces for reusable form patterns
  - TEST: Form validation error handling with edge cases
  - COMPLETION: Reusable form foundation ready for reservation components

Task 4: PRICING - Build pricing calculation logic and hooks (3 hours)
  - CREATE: hooks/useReservationPricing.ts - Core pricing calculation logic
  - IMPLEMENT: Tier matching, discount calculation, edge case handling
  - CREATE: components/reservation/PriceCalculator.tsx - Pricing display
  - TEST: Pricing calculations with various day combinations
  - COMPLETION: Pricing system ready with real-time calculations

Task 5: CALENDAR - Build day selection interface (4 hours)
  - CREATE: components/reservation/DaySelectionCalendar.tsx - Multi-day calendar
  - CREATE: hooks/useDaySelection.ts - Calendar state management
  - IMPLEMENT: Date validation, consecutive day options, basic date constraints
  - TEST: Calendar interaction and date selection logic
  - COMPLETION: Calendar system ready for user day selection

Task 6: ADMIN FORMS - Create reservation configuration interface (4 hours)
  - CREATE: components/dashboard/add-event/ReservationPricingForm.tsx
  - CREATE: components/dashboard/add-event/ReservationSettings.tsx
  - IMPLEMENT: Admin interface for pricing tiers and reservation settings
  - INTEGRATE: React Hook Form + Zod with existing dashboard patterns
  - COMPLETION: Admin can create reservation events with flexible pricing

Task 7: EVENT FORM REFACTOR - Modernize main event creation form (4 hours)
  - REFACTOR: components/dashboard/add-event/EventForm.tsx (1,287 lines)
  - REPLACE: Manual state management with React Hook Form + Zod
  - MAINTAIN: Existing UI patterns and component interface
  - TEST: All existing event types remain functional
  - COMPLETION: Modern form patterns without breaking existing functionality

Task 8: BOOKING INTERFACE - Create user reservation booking components (3 hours)
  - CREATE: components/reservation/ReservationSummary.tsx
  - MODIFY: components/calendar/eventDetails/BookingForm.tsx
  - INTEGRATE: Day selection with booking flow and pricing display
  - TEST: Complete user booking workflow from selection to summary
  - COMPLETION: End-to-end user booking experience ready

Task 9: PAYMENT INTEGRATION - Extend Square payment for reservations (3 hours)
  - MODIFY: components/payment/BillingForm.tsx
  - EXTEND: PaymentProcessor.tsx to handle reservation details
  - IMPLEMENT: Server-side price validation to prevent tampering
  - TEST: Payment flow with reservation metadata and pricing validation
  - COMPLETION: Payment processing captures complete reservation details

Task 10: API ROUTES - Create reservation-specific API endpoints (2 hours)
  - CREATE: app/api/reservations/route.ts
  - IMPLEMENT: CRUD operations with Zod validation and error handling
  - INTEGRATE: MongoDB MCP for direct database operations and testing
  - TEST: API endpoints with curl commands and validation scenarios
  - COMPLETION: Backend API ready for reservation operations

Task 11: EVENT FORM HOOKS - Extract form logic to custom hooks (2 hours)
  - CREATE: hooks/useEventForm.ts - Event form state management
  - REFACTOR: Complex form logic from EventForm.tsx into reusable hooks
  - IMPLEMENT: Form submission, validation, and error handling patterns
  - TEST: Hook behavior with various form states and edge cases
  - COMPLETION: Clean separation of form logic and UI components

Task 12: INTEGRATION TESTING - Test complete reservation workflow (3 hours)
  - TEST: Admin creates reservation event through dashboard
  - TEST: User selects days and completes booking with payment
  - VALIDATE: Data persistence and pricing calculation accuracy
  - USE: Playwright MCP for full browser testing and validation
  - COMPLETION: End-to-end workflow validated in browser environment

Task 13: COMPONENT TESTING - Create comprehensive component tests (3 hours)
  - CREATE: __tests__/components/reservation/ - All reservation component tests
  - CREATE: __tests__/hooks/ - Custom hook tests with edge cases
  - IMPLEMENT: React Testing Library patterns with 80%+ coverage
  - TEST: Form validation, pricing calculations, and user interactions
  - COMPLETION: Comprehensive test coverage for new functionality

Task 14: VALIDATION TESTING - Test Zod schemas and edge cases (2 hours)
  - CREATE: __tests__/lib/validations/ - Schema validation tests
  - TEST: Positive and negative validation scenarios
  - VALIDATE: TypeScript integration and error message clarity
  - EDGE CASES: Simple date validation, basic pricing constraints
  - COMPLETION: Robust validation with clear error handling

Task 15: API TESTING - Validate backend endpoints and data flow (2 hours)
  - TEST: All API routes with curl commands and various payloads
  - VALIDATE: Zod validation on server-side requests
  - TEST: MongoDB data persistence and retrieval
  - USE: MongoDB MCP for direct database validation
  - COMPLETION: Backend API fully validated and tested

Task 16: BROWSER TESTING - Playwright end-to-end validation (3 hours)
  - USE: Playwright MCP for comprehensive browser testing
  - TEST: Complete user workflows in real browser environment
  - VALIDATE: Form interactions, calendar selections, payment flow
  - MONITOR: Browser performance and console errors during testing
  - COMPLETION: Full application validated in browser environment

Task 17: PERFORMANCE VALIDATION - Bundle analysis and optimization (2 hours)
  - RUN: Bundle analysis to measure impact of new dependencies
  - VALIDATE: Build performance and bundle size increases < 10%
  - TEST: Form performance with dynamic pricing calculations
  - OPTIMIZE: Code splitting and lazy loading where beneficial
  - COMPLETION: Performance impact acceptable for production

Task 18: FINAL INTEGRATION - Complete system validation (2 hours)
  - RUN: All validation levels (syntax, unit tests, integration, browser)
  - VALIDATE: Backward compatibility with existing event types
  - TEST: Production build and deployment readiness
  - VERIFY: All success criteria met and documented
  - COMPLETION: Feature ready for production deployment
```

### Implementation Patterns & Key Details

```typescript
// PATTERN: React Hook Form + Zod Integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSettingsSchema, type ReservationSettings } from '@/lib/validations/reservationValidation';

function ReservationPricingForm() {
  const form = useForm<ReservationSettings>({
    resolver: zodResolver(reservationSettingsSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      dayPricing: [{ numberOfDays: 1, price: 0 }],
      maxDays: 7,
      requireConsecutiveDays: false
    }
  });

  // PATTERN: useFieldArray for dynamic pricing tiers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dayPricing"
  });

  // CRITICAL: Error handling with Zod integration
  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...form.register(`dayPricing.${index}.numberOfDays`, { valueAsNumber: true })}
            type="number"
          />
          {errors.dayPricing?.[index]?.numberOfDays && (
            <p className="text-red-600">{errors.dayPricing[index]?.numberOfDays?.message}</p>
          )}
        </div>
      ))}
    </form>
  );
}

// PATTERN: MongoDB Model Extension (Event.ts)
import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
  // Existing fields...
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist" | "reservation";
  // NEW: Optional reservation settings
  reservationSettings?: {
    dayPricing: Array<{
      numberOfDays: number;
      price: number;
      label?: string;
    }>;
    maxDays: number;
    requireConsecutiveDays?: boolean;
    dailyCapacity?: number;
  };
}

// PATTERN: Conditional validation in Mongoose
const EventSchema = new Schema({
  // Existing fields...
  reservationSettings: {
    dayPricing: [{
      numberOfDays: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      label: { type: String },
      _id: false
    }],
    maxDays: { type: Number, min: 1 },
    requireConsecutiveDays: { type: Boolean, default: false },
    dailyCapacity: { type: Number, min: 1 }
  }
});

// CRITICAL: Pre-validation middleware for reservation events
EventSchema.pre("validate", function(next) {
  if (this.eventType === "reservation" && !this.reservationSettings) {
    this.invalidate('reservationSettings', 'Reservation settings required for reservation events');
  }
  next();
});

// PATTERN: API Route with Zod Validation (app/api/events/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { eventFormSchema } from '@/lib/validations/reservationValidation';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // CRITICAL: Server-side validation with Zod
    const validatedData = eventFormSchema.parse(data);
    
    await connectMongo();
    
    const event = new Event(validatedData);
    await event.save();
    
    return NextResponse.json({
      success: true,
      event: event.toObject()
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        validationErrors: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// PATTERN: Custom Hook for Pricing Logic
export function useReservationPricing(dayPricing: PricingTier[]) {
  const calculatePrice = useCallback((selectedDays: number): PricingResult => {
    // Find exact match or closest tier
    const exactTier = dayPricing.find(tier => tier.numberOfDays === selectedDays);
    if (exactTier) {
      return {
        totalPrice: exactTier.price,
        appliedTier: exactTier,
        savings: 0
      };
    }
    
    // Calculate base price and find best tier
    const baseTier = dayPricing.find(tier => tier.numberOfDays === 1);
    const basePrice = baseTier ? baseTier.price * selectedDays : 0;
    
    // Find best applicable tier (largest numberOfDays <= selectedDays)
    const applicableTiers = dayPricing.filter(tier => tier.numberOfDays <= selectedDays);
    const bestTier = applicableTiers.reduce((best, current) => 
      current.numberOfDays > best.numberOfDays ? current : best
    );
    
    return {
      totalPrice: bestTier.price,
      appliedTier: bestTier,
      savings: Math.max(0, basePrice - bestTier.price)
    };
  }, [dayPricing]);

  return { calculatePrice };
}

// PATTERN: Server/Client Component Usage
// Server Component (default) - for data fetching
export default async function ReservationPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id); // Server-side data fetching
  return <ReservationBookingForm event={event} />;
}

// Client Component - for interactivity
'use client';
export function ReservationBookingForm({ event }: { event: IEvent }) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  // Interactive calendar logic here
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add reservationSettings to Event collection, reservationDetails to Customer collection"
  - indexes: "Add compound index on Event.eventType + Event.dates.startDate for reservation queries"
  - client: "lib/db.ts connectMongo() function for all API operations"
  - pattern: "Mongoose models with pre/post middleware for validation and calculations"
  - mcp_access: "MongoDB MCP server available for direct database operations, testing, and validation"
  - testing: "Use MongoDB MCP for schema validation and data persistence testing"

FORM_LIBRARY:
  - install: "npm install react-hook-form @hookform/resolvers zod"
  - pattern: "useForm with zodResolver for all new forms, replace existing manual validation"
  - integration: "Integrate with existing form styling and error display patterns"
  - error_handling: "Basic try-catch patterns with user-friendly error messages"

PAYMENT:
  - extend: "components/payment/PaymentProcessor.tsx to include reservationDetails"
  - pattern: "Server Actions for Square payment processing with reservation metadata"
  - validation: "Server-side price validation to prevent payment tampering"
  - error_handling: "Payment failure handling with retry mechanisms"

CALENDAR:
  - library: "date-fns for date manipulation (already in project)"
  - pattern: "Interactive calendar component with multi-select capabilities"
  - integration: "Calendar state management with React Hook Form field arrays"
  - constraints: "Simple date validation - admin has full control via dashboard for updates/cancellations"
  - edge_cases: "Basic date constraints, no complex holiday or blackout date logic initially"

CONFIG:
  - env: ".env.local - no new environment variables required"
  - types: "Add reservation-specific TypeScript types to existing interfaces.ts"
  - validation: "Extend existing validation patterns with Zod schemas"

ROUTES:
  - api: "app/api/reservations/route.ts for reservation-specific operations"
  - pages: "Extend existing calendar/[eventId]/page.tsx for reservation booking"
  - admin: "Extend existing admin/dashboard/add-event/page.tsx for reservation creation"

TESTING:
  - browser_testing: "Playwright MCP server available for comprehensive browser testing"
  - browser_access: "Full browser control, monitoring tools, and interaction capabilities"
  - automation: "End-to-end workflow testing with real browser environment"
  - performance: "Browser performance monitoring during form interactions and pricing calculations"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Install required dependencies first
npm install react-hook-form @hookform/resolvers zod
npm install -D @types/react-hook-form

# Run after each file creation - fix before proceeding
npm run lint                    # ESLint checks with TypeScript rules
npx tsc --noEmit               # TypeScript type checking (no JS output)
npm run format                 # Prettier formatting

# Project-wide validation
npm run lint:fix               # Auto-fix linting issues  
npm run type-check             # Full TypeScript validation (if available)

# Expected: Zero TypeScript errors, zero ESLint errors
# If errors exist, READ output carefully and fix before proceeding
# Pay special attention to Zod schema TypeScript integration issues
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test each new component as it's created
npm test -- __tests__/components/reservation/DaySelectionCalendar.test.tsx
npm test -- __tests__/components/reservation/PriceCalculator.test.tsx
npm test -- __tests__/hooks/useReservationPricing.test.ts

# Test validation schemas
npm test -- __tests__/lib/validations/reservationValidation.test.ts

# Test form integration
npm test -- __tests__/components/forms/FormField.test.tsx
npm test -- __tests__/components/forms/FormFieldArray.test.tsx

# Coverage validation for new code
npm test -- --coverage --watchAll=false --collectCoverageFrom="components/reservation/**/*.tsx" --collectCoverageFrom="hooks/**/*.ts" --collectCoverageFrom="lib/validations/**/*.ts"

# Expected: All tests pass with 80%+ coverage on new code
# If failing, debug root cause and fix implementation
```

### Level 3: Integration Testing (System Validation)

```bash
# Development server validation
npm run dev &
sleep 10  # Allow Next.js startup time and dependency compilation

# Page load validation - reservation creation
curl -I http://localhost:3000/admin/dashboard/add-event
# Expected: 200 OK response

# Page load validation - reservation booking  
curl -I http://localhost:3000/calendar/test-reservation-id
# Expected: 200 OK response

# API endpoint validation - create reservation event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Summer Art Camp Week 1",
    "eventType": "reservation", 
    "description": "Week-long summer art camp with flexible attendance",
    "startDate": "2024-07-15T09:00:00.000Z",
    "endDate": "2024-07-21T15:00:00.000Z",
    "startTime": "09:00",
    "endTime": "15:00",
    "reservationSettings": {
      "dayPricing": [
        {"numberOfDays": 1, "price": 75},
        {"numberOfDays": 2, "price": 140},
        {"numberOfDays": 7, "price": 400, "label": "Full Week Special"}
      ],
      "maxDays": 7,
      "requireConsecutiveDays": false
    }
  }' \
  | jq .  # Pretty print JSON response
# Expected: 201 Created with event object containing reservationSettings

# API endpoint validation - create reservation booking
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test-reservation-event-id",
    "quantity": 1,
    "isSigningUpForSelf": false,
    "participants": [{"firstName": "Test", "lastName": "Child"}],
    "billingInfo": { "firstName": "Parent", "lastName": "Test", "email": "test@test.com" },
    "reservationDetails": {
      "selectedDates": ["2024-07-15", "2024-07-16", "2024-07-17"],
      "numberOfDays": 3,
      "appliedPriceTier": {"numberOfDays": 3, "price": 200},
      "isConsecutive": true
    }
  }' \
  | jq .
# Expected: 201 Created with customer object containing reservationDetails

# Production build validation
npm run build
# Expected: Successful build with no TypeScript errors or warnings
# Pay attention to any Zod schema compilation issues

# Form validation testing
curl http://localhost:3000/admin/dashboard/add-event | grep -q "reservation"
curl http://localhost:3000/calendar/test-id | grep -q "day-selection"
# Expected: Reservation-specific UI elements present in rendered HTML
```

### Level 4: Creative & Domain-Specific Validation

```bash
# React Hook Form + Zod Integration Validation
# Test form validation with invalid data
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "",
    "eventType": "reservation"
  }' \
  | jq .
# Expected: 400 Bad Request with detailed Zod validation errors

# Dynamic pricing calculation validation
node -e "
const { calculateReservationPrice } = require('./lib/utils');
const pricing = [
  {numberOfDays: 1, price: 75},
  {numberOfDays: 7, price: 400}
];
console.log('1 day:', calculateReservationPrice(1, pricing));
console.log('3 days:', calculateReservationPrice(3, pricing));
console.log('7 days:', calculateReservationPrice(7, pricing));
"
# Expected: Correct price calculations with tier matching

# Database schema validation
# Connect to MongoDB and test reservation data
mongosh "$DATABASE_URL" --eval "
db.events.findOne({eventType: 'reservation'});
db.customers.findOne({'reservationDetails': {\$exists: true}});
"
# Expected: Proper schema structure with reservation fields

# TypeScript strict mode validation  
npx tsc --noEmit --strict
# Expected: Zero TypeScript errors with strict mode enabled

# Bundle analysis for performance impact
npm run build && npx @next/bundle-analyzer .next/static/chunks/
# Expected: Bundle size increase < 10% from new dependencies (React Hook Form, Zod)

# Performance thresholds for monitoring
# - Bundle size increase: < 10% of current size
# - Form render time: < 100ms for pricing calculations  
# - Calendar interactions: < 50ms response time
# - Memory usage: No significant leaks during form interactions

# Playwright MCP browser testing - comprehensive end-to-end validation
# Use Playwright MCP for full browser control and monitoring
# Test complete user workflows: admin creation → user booking → payment
# Monitor browser performance metrics during form interactions
# Validate calendar selection and pricing calculation in real browser environment

# React Hook Form performance validation
# Test form re-render frequency with React DevTools Profiler
# Monitor performance with dynamic pricing calculations
# Expected: Minimal re-renders, good performance with complex reservation forms
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`  
- [ ] No type errors: `npx tsc --noEmit --strict`
- [ ] No formatting issues: `npm run format --check`
- [ ] Production build succeeds: `npm run build`
- [ ] Bundle size impact acceptable (< 10% increase)

### Feature Validation

- [ ] Admin can create multi-day reservation events with flexible pricing tiers
- [ ] End users can select 1-7 days from reservation period via calendar
- [ ] Price calculation shows base price, discount amount, and final total correctly
- [ ] All forms use React Hook Form + Zod with proper validation and error display
- [ ] Payment processing captures complete reservation details
- [ ] MongoDB stores reservation data with proper validation and indexing
- [ ] Existing event types (class, workshop, camp, artist) remain fully functional

### Code Quality Validation

- [ ] Follows existing TypeScript/React patterns and naming conventions
- [ ] File placement matches desired codebase tree structure  
- [ ] React Hook Form + Zod integration follows documented patterns
- [ ] No anti-patterns: no 'any' types, proper error handling, validation consistency
- [ ] Form components are reusable and properly typed with generic interfaces
- [ ] Custom hooks follow established patterns with proper return type interfaces

### TypeScript/Next.js Specific

- [ ] Proper Zod schemas with z.infer<typeof schema> type inference
- [ ] React Hook Form zodResolver integration working correctly
- [ ] Server/Client component patterns followed correctly ('use client' only when needed)
- [ ] API routes follow Next.js App Router patterns with proper error handling
- [ ] No hydration mismatches between server/client rendering
- [ ] MongoDB schema extensions maintain backward compatibility

### Business Logic Validation

- [ ] Pricing calculation logic matches business requirements exactly
- [ ] Day selection logic handles basic date constraints (simple validation only)  
- [ ] Capacity management prevents overbooking when limits are set
- [ ] Discount calculations are accurate and prevent pricing manipulation
- [ ] Payment amount validation prevents tampering with calculated prices
- [ ] Admin retains full control for event updates and cancellations via dashboard

### Documentation & Deployment

- [ ] All new TypeScript interfaces properly documented with JSDoc comments
- [ ] Zod schemas have clear error messages for user-facing validation
- [ ] API endpoints documented with request/response examples
- [ ] Component props interfaces include usage examples and constraints
- [ ] Database schema changes documented with migration notes

---

## Anti-Patterns to Avoid

- ❌ Don't mix manual form validation with React Hook Form - commit fully to new pattern
- ❌ Don't skip Zod validation on server-side - always validate API requests
- ❌ Don't ignore TypeScript errors - fix all type issues before proceeding
- ❌ Don't use 'any' types - use proper Zod schema inference or 'unknown'
- ❌ Don't break existing event functionality - test backward compatibility thoroughly
- ❌ Don't overcomplicate edge cases initially - keep date validation simple, admin controls updates
- ❌ Don't hardcode pricing logic - make it configurable through reservation settings
- ❌ Don't skip basic error handling - use simple try-catch patterns with user-friendly messages
- ❌ Don't create oversized components - keep components under 200 lines as per project standards
- ❌ Don't ignore performance thresholds - monitor bundle size and form performance metrics
- ❌ Don't skip MCP integration - utilize MongoDB MCP and Playwright MCP for comprehensive testing