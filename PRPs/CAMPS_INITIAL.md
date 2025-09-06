## FEATURE:

Multi-Day Reservation System with Flexible Pricing

Build a comprehensive reservation system that allows administrators to create multi-day reservation events (like summer camps or week-long workshops) where:
- Admins can create a reservation event spanning multiple days (e.g., "Summer Camp Week 1" covering 7 days)
- Each reservation can have different pricing tiers based on the number of days selected
- End users can choose to book anywhere from 1 day up to the maximum days available
- The system automatically calculates the total price based on the number of days selected
- Pricing structure supports both individual day rates and bundled discounts for multiple days

Key Requirements:
1. Admin can set a reservation duration (e.g., 7 days for a week-long camp)
2. Admin can define pricing for each possible duration (1 day = $50, 2 days = $90, 3 days = $130, etc.)
3. End users see available days and can select their desired duration
4. System displays the appropriate price based on selection
5. Booking captures which specific days were selected within the reservation period

## FUNCTIONALITY:

### Admin Functionality

#### 1. Reservation Event Creation
- **Create Multi-Day Reservation Event**
  - Input: Event name, description, date range (start and end date)
  - Automatically calculate total available days (e.g., 7 days for a week)
  - Set daily schedule (start time, end time)
  - Upload event image

#### 2. Dynamic Pricing Configuration
- **Set Tiered Pricing Structure**
  - Define price for each possible duration (1 to N days)
  - Example pricing structure:
    - 1 day: $75
    - 2 days: $140 (saves $10)
    - 3 days: $200 (saves $25)
    - 4 days: $260 (saves $40)
    - 5 days: $315 (saves $60)
    - 6 days: $365 (saves $85)
    - 7 days (full week): $400 (saves $125)
  - Support both incremental and bundled discount pricing

#### 3. Capacity Management
- **Set Maximum Participants**
  - Define total capacity for the entire reservation period
  - Option to set daily capacity limits
  - Track remaining spots in real-time

#### 4. Reservation Management Dashboard
- **View All Bookings**
  - List of all customers who booked the reservation
  - See which days each customer selected
  - View total revenue and utilization rates
  - Export booking data (CSV/Excel)

### End User Functionality

#### 1. Reservation Browsing
- **View Available Reservations**
  - See reservation name, description, dates, and pricing
  - Visual calendar showing the reservation period
  - Display available spots remaining

#### 2. Day Selection Interface
- **Interactive Day Picker**
  - Calendar view showing all days in the reservation period
  - Select individual days or day ranges
  - Option to select "Full Week" for maximum discount
  - Real-time price calculation as days are selected
  - Show savings compared to individual day pricing

#### 3. Pricing Display
- **Dynamic Price Calculation**
  - Show base price for selected days
  - Display discount amount if applicable
  - Show final total
  - Price breakdown showing per-day cost

#### 4. Booking Process
- **Complete Reservation Booking**
  - Capture participant information
  - Select specific days within the reservation
  - Process payment for calculated total
  - Receive confirmation with selected dates

### Database Schema Updates

#### Event Model (lib/models/Event.ts)
```typescript
// Add to IEvent interface:
reservationSettings?: {
  // Pricing tiers for different day counts
  dayPricing: Array<{
    numberOfDays: number;  // 1, 2, 3, etc.
    price: number;         // Total price for this many days
    label?: string;        // Optional label like "Full Week Special"
  }>;
  
  // Maximum days that can be booked
  maxDays: number;
  
  // Whether customers must book consecutive days
  requireConsecutiveDays?: boolean;
  
  // Daily capacity (optional, uses numberOfParticipants as default)
  dailyCapacity?: number;
}
```

#### Customer Model (lib/models/Customer.ts)
```typescript
// Add to ICustomer interface:
reservationDetails?: {
  // Which days were selected within the reservation period
  selectedDates: Date[];
  
  // Number of days booked
  numberOfDays: number;
  
  // Price tier applied
  appliedPriceTier: {
    numberOfDays: number;
    price: number;
  };
  
  // Whether consecutive days were booked
  isConsecutive: boolean;
}

## DEPENDENCIES

### Core Technologies
- **Next.js 15** - React framework with App Router
- **React 19** - Frontend component library
- **TypeScript** - Type safety and development experience
- **MongoDB** - Primary database for storing events and customer data
- **Mongoose** - MongoDB ODM for schema definition and data modeling

### Database Models & Collections
- **Event Collection** - Stores event details, pricing, dates, and reservation settings
- **Customer Collection** - Stores bookings, participant info, and reservation selections
- **Existing Models**:
  - `lib/models/Event.ts` - Event schema with reservation support
  - `lib/models/Customer.ts` - Customer booking schema with reservation details

### Frontend Dependencies
- **React Hook Form** - Form management and validation
- **Zod** - Runtime type validation and schema parsing
- **Dayjs** - Date manipulation and timezone handling
- **React Hot Toast** - User notification system
- **Tailwind CSS** - Styling and responsive design

### API & Backend
- **Next.js API Routes** - RESTful endpoints for CRUD operations
- **Server Actions** - Form submission and data mutations
- **Image Upload API** - File handling and storage
- **Environment Variables**:
  - `DATABASE_URL` - MongoDB connection string
  - `NEXT_PUBLIC_APP_URL` - Application base URL

### Development Tools
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript compiler** - Type checking
- **Hot reload** - Development experience
- **Jest & React Testing Library** - Unit and integration testing framework
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

### Specific to Reservations Feature
- **Date Range Validation** - Ensure valid reservation periods
- **Price Calculation Logic** - Dynamic pricing based on selected days
- **Calendar Component** - Interactive day selection interface
- **Booking Validation** - Prevent overbooking and validate selections

## SYSTEM PROMPT(S)

You are an expert full-stack developer specializing in Next.js 15, React 19, TypeScript, and MongoDB applications. You are tasked with implementing a sophisticated multi-day reservation system for a creative arts business.

### Core Responsibilities:
1. **Implement the multi-day reservation feature** as specified in the FUNCTIONALITY section above
2. **Maintain code quality standards** following the project's CLAUDE.md guidelines
3. **Ensure type safety** with comprehensive TypeScript and Zod validation
4. **Follow existing patterns** in the codebase for consistency

### Code Quality Standards:
- **MANDATORY**: Use strict TypeScript with no `any` types
- **MANDATORY**: All external data must be validated with Zod schemas
- **MANDATORY**: Components must be under 200 lines, files under 500 lines
- **MANDATORY**: Use `ReactElement` return types, never `JSX.Element`
- **MANDATORY**: Follow existing naming conventions and file structure
- **MANDATORY**: Include comprehensive error handling and loading states

### Implementation Guidelines:

#### Database Schema Implementation:
- Add reservation-specific fields to `lib/models/Event.ts` and `lib/models/Customer.ts`
- Use the MongoDB MCP (available and connected to project database) to:
  - Validate schema changes against existing data
  - Test new field additions
  - Ensure backward compatibility with existing events and customers

#### Form Management:
- Use React Hook Form with Zod resolvers for all form validation
- Implement real-time validation feedback
- Handle complex nested objects for pricing tiers and date selections
- Follow existing form patterns in EventForm.tsx and EditEvent.tsx

#### API Development:
- Create/update API endpoints following existing patterns in `app/api/`
- Implement proper error handling with meaningful error messages
- Use Next.js 15 Server Actions where appropriate
- Ensure all API responses follow the established response format

#### Frontend Components:
- Build reusable components for day selection calendar
- Implement dynamic pricing display with real-time updates
- Create admin interfaces for setting up reservation pricing
- Follow existing styling patterns using Tailwind CSS

### Research and Documentation Guidelines:
When you need additional information or clarification:

1. **First Priority - Archon Knowledge Base**: Use Archon to research documentation for:
   - Zod validation patterns and advanced schemas
   - React Hook Form complex validation scenarios
   - Next.js 15 App Router and Server Actions best practices
   - TypeScript advanced patterns for complex data structures

2. **Second Priority - Brave Search**: If Archon doesn't have the specific information, use Brave Search for:
   - Recent updates or changes to libraries
   - Community solutions to specific implementation challenges
   - Performance optimization techniques

3. **Third Priority - Web Search**: Only as a last resort for:
   - Very specific edge cases not covered elsewhere
   - Debugging complex integration issues

### MongoDB Integration:
- Use the MongoDB MCP tool extensively to:
  - Examine existing data structures before making changes
  - Test schema modifications in a safe way
  - Query existing events and customers to understand data patterns
  - Validate that new fields work with existing data

### Testing Requirements:
- **MANDATORY**: Use Jest with React Testing Library for all unit and integration tests
- **Test Setup**: Follow Next.js Jest configuration with `next/jest` for automatic setup
- Write comprehensive tests for all new functionality
- Test edge cases like: overlapping reservations, capacity limits, pricing calculations
- Ensure backward compatibility with existing event types (class, camp, workshop, artist)
- Test form validation with various input combinations
- **Component Testing**: Test user interactions, form validation, and state management
- **API Testing**: Test server actions and API endpoints with proper error handling
- **Coverage Requirements**: Maintain minimum 80% code coverage for all new features

### Error Handling:
- Implement graceful degradation for network failures
- Provide clear, user-friendly error messages
- Handle edge cases like fully booked days, invalid date selections
- Ensure data integrity throughout the booking process

### Performance Considerations:
- Optimize calendar rendering for large date ranges
- Implement efficient price calculation algorithms
- Use React optimization techniques (useMemo, useCallback) judiciously
- Ensure fast loading times for reservation browsing

### Security Requirements:
- Validate all user inputs server-side with Zod
- Prevent overbooking through proper concurrency handling
- Sanitize all data before database operations
- Implement proper authorization for admin functions

### Success Criteria:
✅ Admins can create multi-day reservations with tiered pricing
✅ End users can select specific days and see dynamic pricing
✅ All data is properly validated and stored in MongoDB
✅ Forms are intuitive and provide real-time feedback
✅ System prevents overbooking and handles edge cases gracefully
✅ Code follows all project standards and is well-documented
✅ Feature integrates seamlessly with existing event system
✅ **All components have comprehensive Jest unit tests with 80%+ coverage**
✅ **Tests validate user interactions, form validation, and edge cases**
✅ **API endpoints are tested with proper error handling scenarios**

### Important Notes:
- This is a complex feature that will touch multiple parts of the application
- Always check existing code patterns before implementing new solutions
- Use the MongoDB MCP to understand the current data structure thoroughly
- Test extensively with various scenarios before considering complete
- Maintain backward compatibility with existing event types at all times

## EXAMPLES:

### React Hook Form + Zod Integration Examples

#### 1. Event Form with Reservation Settings
```typescript
// lib/validations/eventValidation.ts
import { z } from "zod";

export const reservationSettingsSchema = z.object({
  dayPricing: z.array(z.object({
    numberOfDays: z.number().min(1).max(30),
    price: z.number().min(0),
    label: z.string().optional()
  })).min(1),
  maxDays: z.number().min(1).max(30),
  requireConsecutiveDays: z.boolean().optional().default(false),
  dailyCapacity: z.number().min(1).optional()
});

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
  image: z.instanceof(File).optional()
}).refine(data => {
  if (data.eventType === "reservation") {
    return !!data.reservationSettings && data.endDate;
  }
  return true;
}, {
  message: "Reservation events must have reservation settings and end date",
  path: ["reservationSettings"]
});

export type EventFormData = z.infer<typeof eventFormSchema>;
```

#### 2. Dynamic Pricing Form Component
```typescript
// components/dashboard/add-event/ReservationPricingForm.tsx
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSettingsSchema, type ReservationSettings } from "@/lib/validations/eventValidation";

export function ReservationPricingForm() {
  const { control, register, watch, formState: { errors } } = useForm<ReservationSettings>({
    resolver: zodResolver(reservationSettingsSchema),
    defaultValues: {
      dayPricing: [{ numberOfDays: 1, price: 0 }],
      maxDays: 7,
      requireConsecutiveDays: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dayPricing"
  });

  const maxDays = watch("maxDays");

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="maxDays" className="block text-sm font-medium text-gray-700">
          Maximum Days Available
        </label>
        <input
          type="number"
          {...register("maxDays", { valueAsNumber: true })}
          min="1"
          max="30"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.maxDays && (
          <p className="mt-1 text-sm text-red-600">{errors.maxDays.message}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Day Pricing Tiers</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Days
              </label>
              <input
                type="number"
                {...register(`dayPricing.${index}.numberOfDays`, { valueAsNumber: true })}
                min="1"
                max={maxDays}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Price
              </label>
              <input
                type="number"
                {...register(`dayPricing.${index}.price`, { valueAsNumber: true })}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Label (Optional)
              </label>
              <input
                {...register(`dayPricing.${index}.label`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="e.g., 'Full Week Special'"
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ numberOfDays: fields.length + 1, price: 0 })}
          disabled={fields.length >= maxDays}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
        >
          Add Pricing Tier
        </button>
      </div>
    </div>
  );
}
```

#### 3. Jest Testing Configuration & Examples

##### Jest Setup for Next.js 15
```bash
# Install testing dependencies
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest
```

```typescript
// jest.config.ts - Next.js Jest Configuration
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

export default createJestConfig(config)
```

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

##### Component Testing Examples
```typescript
// components/reservation/__tests__/DaySelectionCalendar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DaySelectionCalendar } from '../DaySelectionCalendar'

describe('DaySelectionCalendar', () => {
  const mockProps = {
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-07'),
    maxDays: 7,
    onSelectionChange: jest.fn(),
    onPriceChange: jest.fn(),
    dayPricing: [
      { numberOfDays: 1, price: 75 },
      { numberOfDays: 7, price: 400, label: 'Full Week Special' }
    ]
  }

  it('renders calendar with correct date range', () => {
    render(<DaySelectionCalendar {...mockProps} />)
    expect(screen.getByText('Select Your Days')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('allows day selection and calculates price correctly', async () => {
    const user = userEvent.setup()
    render(<DaySelectionCalendar {...mockProps} />)
    
    const firstDay = screen.getByText('1')
    await user.click(firstDay)
    
    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([new Date('2024-07-01')])
    expect(mockProps.onPriceChange).toHaveBeenCalledWith(75, 1)
  })

  it('respects maxDays limit', async () => {
    const user = userEvent.setup()
    const props = { ...mockProps, maxDays: 2 }
    render(<DaySelectionCalendar {...props} />)
    
    // Select maximum allowed days
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('2'))
    
    // Third day should be disabled
    const thirdDay = screen.getByText('3')
    expect(thirdDay).toHaveClass('cursor-not-allowed', 'opacity-50')
  })
})
```

##### Form Validation Testing
```typescript
// components/dashboard/add-event/__tests__/ReservationPricingForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReservationPricingForm } from '../ReservationPricingForm'

describe('ReservationPricingForm', () => {
  it('validates required pricing tiers', async () => {
    render(<ReservationPricingForm />)
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/at least one pricing tier required/i)).toBeInTheDocument()
    })
  })

  it('prevents duplicate day pricing tiers', async () => {
    const user = userEvent.setup()
    render(<ReservationPricingForm />)
    
    // Add second pricing tier with same day count
    await user.click(screen.getByText('Add Pricing Tier'))
    
    const dayInputs = screen.getAllByLabelText(/number of days/i)
    await user.type(dayInputs[1], '1') // Same as first tier
    
    await waitFor(() => {
      expect(screen.getByText(/duplicate day count not allowed/i)).toBeInTheDocument()
    })
  })
})
```

##### API Testing
```typescript
// app/api/events/__tests__/reservation.test.ts
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/db')
jest.mock('@/lib/models/Event')

describe('/api/events API', () => {
  it('creates reservation event with valid data', async () => {
    const requestData = {
      eventName: 'Summer Art Camp',
      eventType: 'reservation',
      startDate: '2024-07-01',
      endDate: '2024-07-07',
      reservationSettings: {
        dayPricing: [
          { numberOfDays: 1, price: 75 },
          { numberOfDays: 7, price: 400 }
        ],
        maxDays: 7
      }
    }

    const request = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.event.eventType).toBe('reservation')
  })

  it('validates reservation pricing requirements', async () => {
    const invalidData = {
      eventName: 'Invalid Camp',
      eventType: 'reservation',
      // Missing required reservationSettings
    }

    const request = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('reservation settings required')
  })
})
```

#### 4. Multi-Day Date Selection Calendar
```typescript
// components/reservation/DaySelectionCalendar.tsx
import { useState, useMemo } from "react";
import { addDays, format, isSameDay, isWithinInterval } from "date-fns";

interface DaySelectionCalendarProps {
  startDate: Date;
  endDate: Date;
  maxDays: number;
  requireConsecutiveDays?: boolean;
  onSelectionChange: (selectedDates: Date[]) => void;
  onPriceChange: (totalPrice: number, dayCount: number) => void;
  dayPricing: Array<{
    numberOfDays: number;
    price: number;
    label?: string;
  }>;
}

export function DaySelectionCalendar({
  startDate,
  endDate,
  maxDays,
  requireConsecutiveDays = false,
  onSelectionChange,
  onPriceChange,
  dayPricing
}: DaySelectionCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    return dates;
  }, [startDate, endDate]);

  const calculatePrice = (dayCount: number): number => {
    const tier = dayPricing.find(p => p.numberOfDays === dayCount) 
                 || dayPricing[dayPricing.length - 1]; // Fallback to highest tier
    return tier?.price || 0;
  };

  const handleDateClick = (clickedDate: Date) => {
    let newSelection: Date[];

    if (requireConsecutiveDays) {
      // Handle consecutive day selection logic
      if (selectedDates.length === 0) {
        newSelection = [clickedDate];
      } else if (selectedDates.length === 1) {
        const [firstDate] = selectedDates;
        const start = clickedDate < firstDate ? clickedDate : firstDate;
        const end = clickedDate < firstDate ? firstDate : clickedDate;
        
        newSelection = [];
        let current = start;
        while (current <= end && newSelection.length < maxDays) {
          newSelection.push(new Date(current));
          current = addDays(current, 1);
        }
      } else {
        newSelection = [clickedDate];
      }
    } else {
      // Handle non-consecutive day selection
      const isSelected = selectedDates.some(date => isSameDay(date, clickedDate));
      if (isSelected) {
        newSelection = selectedDates.filter(date => !isSameDay(date, clickedDate));
      } else if (selectedDates.length < maxDays) {
        newSelection = [...selectedDates, clickedDate].sort((a, b) => a.getTime() - b.getTime());
      } else {
        return; // Max days reached
      }
    }

    setSelectedDates(newSelection);
    onSelectionChange(newSelection);
    
    const totalPrice = calculatePrice(newSelection.length);
    onPriceChange(totalPrice, newSelection.length);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Select Your Days</h3>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {availableDates.map(date => {
          const isSelected = selectedDates.some(selected => isSameDay(selected, date));
          const isDisabled = !isSelected && selectedDates.length >= maxDays;
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`
                p-3 rounded-md text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">
            Selected: {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
          </p>
          <p className="text-lg font-semibold text-green-600">
            Total: ${calculatePrice(selectedDates.length)}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### 4. Customer Booking with Reservation Details
```typescript
// lib/validations/customerValidation.ts
export const reservationDetailsSchema = z.object({
  selectedDates: z.array(z.date()).min(1, "At least one date must be selected"),
  numberOfDays: z.number().min(1),
  appliedPriceTier: z.object({
    numberOfDays: z.number(),
    price: z.number()
  }),
  isConsecutive: z.boolean()
});

export const customerSchema = z.object({
  event: z.string(),
  quantity: z.number().min(1),
  total: z.number().min(0),
  isSigningUpForSelf: z.boolean(),
  participants: z.array(participantSchema),
  billingInfo: billingInfoSchema,
  reservationDetails: reservationDetailsSchema.optional()
});
```

#### 5. Square Payment Integration with Reservations
```typescript
// components/payment/ReservationPayment.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentProcessor } from "./PaymentProcessor";

export function ReservationPayment({ 
  eventId, 
  selectedDates, 
  totalPrice, 
  eventTitle 
}: ReservationPaymentProps) {
  const { handleSubmit, ...form } = useForm({
    resolver: zodResolver(customerSchema)
  });

  const onSubmit = async (data: CustomerFormData) => {
    const paymentData: PaymentSubmitData = {
      ...data.billingInfo,
      numberOfPeople: data.quantity,
      eventId,
      eventTitle,
      eventPrice: totalPrice.toString(),
      // Add reservation-specific data
      reservationDetails: {
        selectedDates,
        numberOfDays: selectedDates.length,
        appliedPriceTier: calculatePriceTier(selectedDates.length),
        isConsecutive: checkIfConsecutive(selectedDates)
      }
    };

    // Process payment through existing Square integration
    // PaymentProcessor will handle the Square Web SDK
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Billing form fields */}
      <PaymentProcessor 
        config={paymentConfig}
        onPaymentResult={handlePaymentResult}
        submitData={paymentSubmitData}
      />
    </form>
  );
}
```

## DOCUMENTATION:

### Core Libraries & Frameworks

#### React Hook Form
- **Official Documentation**: https://react-hook-form.com/
- **Get Started Guide**: https://react-hook-form.com/get-started
- **Advanced Usage**: https://react-hook-form.com/advanced-usage (Form context, optimization patterns)
- **TypeScript Support**: https://react-hook-form.com/ts
- **API Reference**: https://react-hook-form.com/docs

#### Zod Validation
- **Official Documentation**: https://zod.dev/
- **Basic Usage**: https://zod.dev/README (Schema definition, validation)
- **Advanced Schemas**: https://zod.dev/README#objects (Nested objects, refinements)
- **React Hook Form Integration**: https://react-hook-form.com/docs/useform#resolver
- **Type Inference**: https://zod.dev/README#type-inference

#### Next.js 15 
- **Official Documentation**: https://nextjs.org/docs
- **App Router**: https://nextjs.org/docs/app (Server components, layouts, routing)
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations
- **Form Component**: https://nextjs.org/docs/app/api-reference/components/form
- **Error Handling**: https://nextjs.org/docs/app/building-your-application/routing/error-handling

#### MongoDB & Mongoose
- **Mongoose Documentation**: https://mongoosejs.com/docs/
- **Schema Types**: https://mongoosejs.com/docs/schematypes.html
- **Subdocuments**: https://mongoosejs.com/docs/subdocs.html
- **Validation**: https://mongoosejs.com/docs/validation.html
- **Middleware**: https://mongoosejs.com/docs/middleware.html

#### Square Payments
- **Web SDK Documentation**: https://developer.squareup.com/docs/web-payments/overview
- **Web SDK Setup**: https://developer.squareup.com/docs/web-payments/setup
- **Square MCP Server**: https://developer.squareup.com/docs/mcp (Available in project)
- **Payment Flow**: https://developer.squareup.com/docs/web-payments/take-payments

### UI & Styling
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Tailwind Forms**: https://github.com/tailwindlabs/tailwindcss-forms
- **Headless UI**: https://headlessui.com/ (For complex components)
- **Date-fns**: https://date-fns.org/docs/Getting-Started (Date manipulation)

### Development Tools
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **ESLint Configuration**: https://eslint.org/docs/rules/
- **Prettier Configuration**: https://prettier.io/docs/en/configuration.html

## OTHER CONSIDERATIONS:

### Critical Implementation Gotchas

#### Form Validation & Data Flow
- **ALWAYS use Zod schemas BEFORE React Hook Form implementation** - Design schema first, then build form
- **Use `valueAsNumber: true`** for numeric inputs in `register()` to prevent string/number type mismatches
- **Validate date ranges** - Ensure end date is after start date, max days doesn't exceed total available days
- **Handle timezone conversions carefully** - Use dayjs with timezone plugins consistently across client/server
- **Test form validation with edge cases** - Empty arrays, invalid dates, negative numbers, XSS attempts

#### Database Schema Design
- **NEVER change existing Event/Customer schemas without migration strategy** - Use optional fields initially
- **Index reservation fields** for performance - Add indexes for date ranges and reservation queries
- **Use branded types in TypeScript** for all IDs to prevent mixing event/customer/reservation IDs
- **Validate schema changes with existing data** - Use MongoDB MCP to test before deploying
- **Consider capacity management** - Track daily enrollment vs. total capacity across date ranges

#### State Management & Performance
- **Optimize calendar rendering** - Use `useMemo` for date calculations, `useCallback` for event handlers
- **Debounce pricing calculations** - Don't recalculate on every date selection change
- **Handle large date ranges** - Paginate or virtualize calendar for long-term reservations
- **Prevent memory leaks** - Clean up date watchers and intervals in useEffect cleanup
- **Use React.memo strategically** - Wrap expensive date selection components

#### Payment Integration Concerns
- **Square Web SDK version compatibility** - Ensure existing `@square/web-sdk` works with new flow
- **Payment amount validation** - Server-side validation of calculated prices vs. expected amounts  
- **Concurrent booking prevention** - Handle race conditions when multiple users book same dates
- **Partial payment failures** - Implement rollback for partially created reservations
- **Receipt generation** - Include selected dates in payment confirmation emails

#### Security & Data Validation
- **Server-side price validation** - NEVER trust client-calculated prices, always recalculate on server
- **Sanitize all date inputs** - Prevent date injection attacks and invalid date formats
- **Rate limit reservation API calls** - Prevent abuse of booking system
- **Validate business logic** - Ensure max days constraint is enforced server-side
- **Audit trail for reservations** - Log all booking changes with timestamps and user IDs

#### Backward Compatibility
- **Maintain existing event types** - Reservation events must coexist with class/camp/workshop/artist
- **API versioning strategy** - Consider /v2 endpoints if breaking changes needed
- **Database migration plan** - How to handle existing events when adding reservation fields
- **Feature flag implementation** - Allow gradual rollout of reservation functionality
- **Fallback UI for legacy browsers** - Ensure basic functionality without modern calendar features

#### Testing Strategy
- **Test with real date scenarios** - Weekend/weekday combinations, holidays, leap years
- **Cross-timezone testing** - Ensure correct date handling across different user timezones
- **Load testing** - High concurrent bookings, large calendar date ranges
- **Browser compatibility** - Date picker functionality across Safari, Firefox, Chrome
- **Mobile responsive testing** - Calendar usability on small screens

#### Development & Deployment
- **Environment variable setup** - Square sandbox/production config management
- **Database indexing** - Add performance indexes before production deployment
- **Error monitoring** - Track reservation-specific errors in production
- **Logging strategy** - Detailed logs for booking flow debugging
- **Code splitting** - Lazy load calendar components to improve initial page load

#### Specific to This Codebase
- **Follow existing EventForm.tsx patterns** - Don't reinvent form handling, extend current approach
- **Maintain consistency with Payment.tsx** - Use existing Square integration patterns
- **Respect CLAUDE.md guidelines** - File size limits (500 lines), component limits (200 lines)
- **Use existing validation patterns** - Follow current error handling and toast notification patterns
- **Integrate with current routing** - Maintain existing URL structure and navigation patterns

#### Common Pitfalls to Avoid
- **Don't store sensitive payment data** in reservation details - Only store booking metadata
- **Don't hardcode date formats** - Use consistent date formatting throughout application
- **Don't skip form validation** for "internal" admin forms - Validate everything with Zod
- **Don't assume consecutive date selection** - Always handle both consecutive and non-consecutive scenarios
- **Don't ignore edge cases** - Single day reservations, same-day start/end dates, weekend-only bookings
- **Don't overengineer the solution** - Start simple, add complexity only when needed
- **Don't break existing Square integration** - Extend PaymentProcessor.tsx rather than replacing it
- **Don't ignore mobile UX** - Calendar date selection must work well on touch devices