import { z } from "zod";

/**
 * Reservation validation schemas for multi-day booking system.
 * 
 * Provides comprehensive validation for reservation events, pricing tiers,
 * customer booking details, and form inputs with TypeScript type inference.
 * 
 * @module ReservationValidation
 */

// Branded types for type safety
const EventIdSchema = z.string().min(1).brand<"EventId">();

/**
 * Pricing tier schema for reservation events.
 * 
 * Validates individual pricing tiers within reservation settings,
 * including day count, price, and optional labels for special offers.
 * 
 * @example
 * ```ts
 * const tier = { numberOfDays: 7, price: 400, label: "Full Week Special" }
 * const validTier = pricingTierSchema.parse(tier);
 * ```
 */
export const pricingTierSchema = z.object({
  numberOfDays: z.number().min(1, "Must be at least 1 day").max(30, "Cannot exceed 30 days"),
  price: z.number().min(0, "Price cannot be negative"),
  label: z.string().optional(), // e.g., "Full Week Special", "Weekend Package"
});

/**
 * Reservation settings schema for Event model extension.
 * 
 * Validates complete reservation configuration including pricing tiers,
 * capacity limits, and day selection requirements with cross-field validation.
 * 
 * @example
 * ```ts
 * const settings = {
 *   dayPricing: [
 *     { numberOfDays: 1, price: 75 },
 *     { numberOfDays: 7, price: 400 }
 *   ],
 *   maxDays: 7,
 *   requireConsecutiveDays: false
 * };
 * const validSettings = reservationSettingsSchema.parse(settings);
 * ```
 */
export const reservationSettingsSchema = z.object({
  dayPricing: z.array(pricingTierSchema)
    .min(1, "At least one pricing tier required")
    .max(10, "Maximum 10 pricing tiers allowed"),
  maxDays: z.number().min(1, "Must allow at least 1 day").max(30, "Cannot exceed 30 days"),
  requireConsecutiveDays: z.boolean().optional().default(false),
  dailyCapacity: z.number().min(1, "Daily capacity must be at least 1").optional(),
}).refine(data => {
  // Validate no duplicate day counts in pricing tiers
  const dayCounts = data.dayPricing.map(tier => tier.numberOfDays);
  const uniqueDayCounts = new Set(dayCounts);
  return uniqueDayCounts.size === dayCounts.length;
}, {
  message: "Duplicate day counts not allowed in pricing tiers",
  path: ["dayPricing"]
}).refine(data => {
  // Validate maxDays is at least as large as highest pricing tier
  const maxPricingDays = Math.max(...data.dayPricing.map(tier => tier.numberOfDays));
  return data.maxDays >= maxPricingDays;
}, {
  message: "Maximum days must be at least as large as highest pricing tier",
  path: ["maxDays"]
});

/**
 * Reservation details schema for Customer model extension.
 * 
 * Validates customer booking selections including selected dates,
 * applied pricing, and consecutive day requirements.
 * 
 * @example
 * ```ts
 * const details = {
 *   selectedDates: [new Date('2024-07-15'), new Date('2024-07-16')],
 *   numberOfDays: 2,
 *   appliedPriceTier: { numberOfDays: 2, price: 140 },
 *   isConsecutive: true,
 *   checkInDate: new Date('2024-07-15')
 * };
 * const validDetails = reservationDetailsSchema.parse(details);
 * ```
 */
export const reservationDetailsSchema = z.object({
  selectedDates: z.array(z.date())
    .min(1, "At least one date must be selected")
    .max(30, "Cannot select more than 30 days"),
  numberOfDays: z.number().min(1, "Must book at least 1 day"),
  appliedPriceTier: z.object({
    numberOfDays: z.number().min(1),
    price: z.number().min(0),
    label: z.string().optional(),
  }),
  isConsecutive: z.boolean(),
  checkInDate: z.date(),
  checkOutDate: z.date().optional(),
}).refine(data => {
  // Validate numberOfDays matches selectedDates length
  return data.numberOfDays === data.selectedDates.length;
}, {
  message: "Number of days must match selected dates count",
  path: ["numberOfDays"]
}).refine(data => {
  // Validate checkInDate is the earliest selected date
  const earliestDate = new Date(Math.min(...data.selectedDates.map(d => d.getTime())));
  return data.checkInDate.getTime() === earliestDate.getTime();
}, {
  message: "Check-in date must be the earliest selected date",
  path: ["checkInDate"]
});

/**
 * Event form schema with reservation support.
 * 
 * Validates complete event creation including reservation-specific fields,
 * with conditional validation for reservation event types.
 * 
 * @example
 * ```ts
 * const formData = {
 *   eventName: "Summer Art Camp Week 1",
 *   eventType: "reservation",
 *   description: "Week-long art camp with flexible attendance",
 *   startDate: new Date('2024-07-15'),
 *   endDate: new Date('2024-07-21'),
 *   startTime: "09:00",
 *   reservationSettings: { ... }
 * };
 * const validForm = eventFormSchema.parse(formData);
 * ```
 */
export const eventFormSchema = z.object({
  eventName: z.string()
    .min(1, "Event name is required")
    .max(100, "Event name cannot exceed 100 characters")
    .trim(),
  eventType: z.enum(["class", "camp", "workshop", "artist", "reservation"]),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  numberOfParticipants: z.number().min(1, "Must allow at least 1 participant").optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  reservationSettings: reservationSettingsSchema.optional(),
  image: z.instanceof(File).optional(),
}).refine(data => {
  // Reservation events must have reservation settings and end date
  if (data.eventType === "reservation") {
    return !!data.reservationSettings && !!data.endDate;
  }
  return true;
}, {
  message: "Reservation events must have reservation settings and end date",
  path: ["reservationSettings"]
}).refine(data => {
  // Validate end date is after start date
  if (data.endDate) {
    return data.endDate.getTime() > data.startDate.getTime();
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine(data => {
  // Validate end time is after start time for same-day events
  if (data.endTime && (!data.endDate || data.endDate.toDateString() === data.startDate.toDateString())) {
    const startMinutes = parseInt(data.startTime.split(':')[0]) * 60 + parseInt(data.startTime.split(':')[1]);
    const endMinutes = parseInt(data.endTime.split(':')[0]) * 60 + parseInt(data.endTime.split(':')[1]);
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

/**
 * Customer reservation booking schema.
 * 
 * Validates complete customer booking including billing information,
 * participant details, and reservation-specific selections.
 */
export const customerBookingSchema = z.object({
  event: EventIdSchema,
  quantity: z.number().min(1, "Must book at least 1 spot"),
  isSigningUpForSelf: z.boolean(),
  participants: z.array(z.object({
    firstName: z.string().min(1, "First name required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name required").max(50, "Last name too long"),
    selectedOptions: z.array(z.object({
      categoryName: z.string(),
      choiceName: z.string(),
    })).optional(),
  })),
  billingInfo: z.object({
    firstName: z.string().min(1, "First name required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name required").max(50, "Last name too long"),
    addressLine1: z.string().min(1, "Address required").max(100, "Address too long"),
    addressLine2: z.string().max(100, "Address line 2 too long").optional(),
    city: z.string().min(1, "City required").max(50, "City name too long"),
    stateProvince: z.string().min(1, "State/Province required").max(50, "State/Province too long"),
    postalCode: z.string().min(1, "Postal code required").max(20, "Postal code too long"),
    country: z.string().min(1, "Country required").max(50, "Country name too long"),
    emailAddress: z.string().email("Invalid email address").optional(),
    phoneNumber: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
      .optional(),
  }),
  reservationDetails: reservationDetailsSchema.optional(),
}).refine(data => {
  // Either email or phone must be provided
  return data.billingInfo.emailAddress || data.billingInfo.phoneNumber;
}, {
  message: "Either email address or phone number is required",
  path: ["billingInfo"]
});

/**
 * Day selection form schema for calendar interface.
 * 
 * Validates day selection inputs including date range constraints
 * and consecutive day requirements.
 */
export const daySelectionSchema = z.object({
  eventId: EventIdSchema,
  availableDateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  selectedDates: z.array(z.date()).min(1, "Select at least one day"),
  requireConsecutive: z.boolean().optional().default(false),
}).refine(data => {
  // Validate all selected dates are within available range
  const startTime = data.availableDateRange.startDate.getTime();
  const endTime = data.availableDateRange.endDate.getTime();
  return data.selectedDates.every(date => {
    const dateTime = date.getTime();
    return dateTime >= startTime && dateTime <= endTime;
  });
}, {
  message: "All selected dates must be within the available date range",
  path: ["selectedDates"]
}).refine(data => {
  // Validate consecutive dates if required
  if (data.requireConsecutive && data.selectedDates.length > 1) {
    const sortedDates = [...data.selectedDates].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currentDate = sortedDates[i];
      const dayDifference = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDifference !== 1) {
        return false;
      }
    }
  }
  return true;
}, {
  message: "Selected dates must be consecutive when required",
  path: ["selectedDates"]
});

// Type inference exports for TypeScript
export type EventId = z.infer<typeof EventIdSchema>;
export type PricingTier = z.infer<typeof pricingTierSchema>;
export type ReservationSettings = z.infer<typeof reservationSettingsSchema>;
export type ReservationDetails = z.infer<typeof reservationDetailsSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
export type CustomerBookingData = z.infer<typeof customerBookingSchema>;
export type DaySelectionData = z.infer<typeof daySelectionSchema>;

/**
 * Validation error helper for extracting user-friendly error messages.
 * 
 * @param error - Zod validation error
 * @returns Object with field-specific error messages
 */
export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};

/**
 * Safe parsing helper that returns validation results with type safety.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag and data/errors
 */
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: getValidationErrors(result.error) };
  }
};