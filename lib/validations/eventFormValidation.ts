/**
 * @fileoverview Zod validation schemas for event form data
 * @module lib/validations/eventFormValidation
 */

import { z } from 'zod';
import { pricingTierSchema } from './reservationValidation';

/**
 * Event type enumeration.
 */
export const eventTypeSchema = z.enum(['class', 'workshop', 'camp', 'artist', 'reservation'] as const);
export type EventType = z.infer<typeof eventTypeSchema>;

/**
 * Recurring pattern enumeration.
 */
export const recurringPatternSchema = z.enum(['daily', 'weekly'] as const);
export type RecurringPattern = z.infer<typeof recurringPatternSchema>;

/**
 * Discount type enumeration.
 */
export const discountTypeSchema = z.enum(['percentage', 'fixed'] as const);
export type DiscountType = z.infer<typeof discountTypeSchema>;

/**
 * Option choice schema for event options.
 */
export const optionChoiceSchema = z.object({
  name: z.string().min(1, 'Choice name is required'),
  price: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Choice price must be a valid number greater than or equal to 0'),
});

export type OptionChoice = z.infer<typeof optionChoiceSchema>;

/**
 * Option category schema for event options system.
 */
export const optionCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  categoryDescription: z.string().optional(),
  choices: z.array(optionChoiceSchema).min(1, 'At least one choice is required'),
});

export type OptionCategory = z.infer<typeof optionCategorySchema>;

/**
 * Discount schema for event pricing discounts.
 */
export const discountSchema = z.object({
  type: discountTypeSchema,
  value: z.string().min(1, 'Discount value is required'),
  minParticipants: z.string().min(1, 'Minimum participants is required'),
  name: z.string().min(1, 'Discount name is required'),
  description: z.string().optional(),
});

export type DiscountData = z.infer<typeof discountSchema>;

/**
 * Reservation settings schema for multi-day reservation events.
 * This matches the Event model's reservationSettings interface.
 */
export const reservationSettingsSchema = z.object({
  dayPricing: z.array(pricingTierSchema),
  dailyCapacity: z.number().int().min(1).optional(),
}).optional();

export type ReservationSettings = z.infer<typeof reservationSettingsSchema>;

/**
 * Time validation helper - validates time format (HH:mm).
 */
const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format');

/**
 * Base event form schema with all common fields.
 */
const baseEventFormSchema = z.object({
  // Basic event information
  eventName: z.string().min(1, 'Event name is required').max(100, 'Event name too long'),
  eventType: eventTypeSchema,
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  
  // Date and time fields
  startDate: z.string().min(1, 'Start date is required').refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate >= new Date(new Date().setHours(0, 0, 0, 0));
  }, 'Start date must be today or in the future'),
  
  startTime: z.string().min(1, 'Start time is required').pipe(timeStringSchema),
  endTime: z.string().min(1, 'End time is required').pipe(timeStringSchema),
  
  // Image upload
  image: z.instanceof(File).optional().nullable(),
  imageUrl: z.string().url({ message: 'Invalid image URL' }).optional(),
});

/**
 * Schema for non-reservation events (class, workshop, camp).
 */
export const standardEventFormSchema = baseEventFormSchema.extend({
  // Pricing and capacity
  price: z.string().min(1, 'Price is required').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Price must be a valid number greater than or equal to 0'),
  
  numberOfParticipants: z.string().min(1, 'Number of participants is required').refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num <= 20;
  }, 'Number of participants must be between 1 and 20'),
  
  // Recurring event fields
  isRecurring: z.boolean().default(false),
  recurringPattern: recurringPatternSchema.optional(),
  recurringEndDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid recurring end date format'),
  
  // Options system
  hasOptions: z.boolean().default(false),
  optionCategories: z.array(optionCategorySchema).optional(),
  
  // Discount system
  isDiscountAvailable: z.boolean().default(false),
  discount: discountSchema.optional(),
});

/**
 * Schema for artist events (no pricing or participant limits).
 */
export const artistEventFormSchema = baseEventFormSchema.extend({
  // Artist events don't have pricing or participant limits
  price: z.string().optional(),
  numberOfParticipants: z.string().optional(),
  isRecurring: z.literal(false),
  hasOptions: z.literal(false),
  isDiscountAvailable: z.literal(false),
});

/**
 * Schema for reservation events (multi-day with special settings).
 */
export const reservationEventFormSchema = baseEventFormSchema.extend({
  // Reservation events don't use standard pricing
  price: z.string().optional(),
  numberOfParticipants: z.string().optional(),
  isRecurring: z.literal(false),
  hasOptions: z.literal(false),
  isDiscountAvailable: z.literal(false),
  
  // Reservation-specific fields
  isReservationEvent: z.literal(true),
  endDate: z.string().min(1, 'End date is required').refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate >= new Date(new Date().setHours(0, 0, 0, 0));
  }, 'End date must be today or in the future'),
  reservationSettings: reservationSettingsSchema.refine((settings) => {
    return settings !== undefined;
  }, 'Reservation settings are required for reservation events'),
});

/**
 * Discriminated union schema that validates based on event type.
 */
export const eventFormSchema = z.discriminatedUnion('eventType', [
  standardEventFormSchema.extend({ eventType: z.literal('class') }),
  standardEventFormSchema.extend({ eventType: z.literal('workshop') }),
  standardEventFormSchema.extend({ eventType: z.literal('camp') }),
  artistEventFormSchema.extend({ eventType: z.literal('artist') }),
  reservationEventFormSchema.extend({ eventType: z.literal('reservation') }),
]).superRefine((data, ctx) => {
  // Additional cross-field validation
  
  // Time validation: end time must be after start time
  if (data.startTime && data.endTime) {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }
  }
  
  // Recurring event validation
  if (data.eventType !== 'artist' && data.eventType !== 'reservation' && 'isRecurring' in data && data.isRecurring) {
    if (!data.recurringEndDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Recurring end date is required for recurring events',
        path: ['recurringEndDate'],
      });
    } else {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.recurringEndDate);
      
      if (endDate <= startDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'Recurring end date must be after the start date',
          path: ['recurringEndDate'],
        });
      }
    }
  }
  
  // Options validation
  if (data.eventType !== 'artist' && data.eventType !== 'reservation' && 'hasOptions' in data && data.hasOptions) {
    if (!data.optionCategories || data.optionCategories.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one option category is required when options are enabled',
        path: ['optionCategories'],
      });
    }
  }
  
  // Discount validation
  if (data.eventType !== 'artist' && data.eventType !== 'reservation' && 'isDiscountAvailable' in data && data.isDiscountAvailable) {
    if (!data.discount) {
      ctx.addIssue({
        code: 'custom',
        message: 'Discount details are required when discount is enabled',
        path: ['discount'],
      });
    } else {
      const discountValue = parseFloat(data.discount.value);
      
      if (data.discount.type === 'percentage' && discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Percentage discount cannot exceed 100%',
          path: ['discount', 'value'],
        });
      }
      
      if (data.discount.type === 'fixed' && 'price' in data && data.price) {
        const price = parseFloat(data.price);
        if (discountValue >= price) {
          ctx.addIssue({
            code: 'custom',
            message: 'Fixed discount cannot be greater than or equal to the price',
            path: ['discount', 'value'],
          });
        }
      }
      
      const minParticipants = parseInt(data.discount.minParticipants, 10);
      if (minParticipants < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Minimum participants must be at least 2',
          path: ['discount', 'minParticipants'],
        });
      }
    }
  }
  
  // Reservation event validation
  if (data.eventType === 'reservation' && 'endDate' in data) {
    if (data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'End date must be after the start date',
          path: ['endDate'],
        });
      }
    }
  }
});

/**
 * Inferred TypeScript type for the event form data.
 */
export type EventFormData = z.infer<typeof eventFormSchema>;

/**
 * Form schema for React Hook Form that accommodates all event types.
 * This uses optional fields to handle all possible event variations.
 */
export const unifiedEventFormSchema = z.object({
  // Base fields (required for all event types)
  eventName: z.string().min(1, 'Event name is required').max(100, 'Event name too long'),
  eventType: eventTypeSchema,
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  startDate: z.string().min(1, 'Start date is required').refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate >= new Date(new Date().setHours(0, 0, 0, 0));
  }, 'Start date must be today or in the future'),
  startTime: z.string().min(1, 'Start time is required').pipe(timeStringSchema),
  endTime: z.string().min(1, 'End time is required').pipe(timeStringSchema),
  
  // Image upload
  image: z.instanceof(File).optional().nullable(),
  imageUrl: z.string().url({ message: 'Invalid image URL' }).optional(),
  
  // Optional fields for different event types
  price: z.string().optional(),
  numberOfParticipants: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: recurringPatternSchema.optional(),
  recurringEndDate: z.string().optional(),
  hasOptions: z.boolean().optional(),
  optionCategories: z.array(optionCategorySchema).optional(),
  isDiscountAvailable: z.boolean().optional(),
  discount: discountSchema.optional(),
  
  // Reservation-specific fields
  endDate: z.string().optional(),
  isReservationEvent: z.boolean().optional(),
  reservationSettings: reservationSettingsSchema.optional(),
}).superRefine((data, ctx) => {
  // Conditional validation based on event type
  if (data.eventType !== 'artist' && data.eventType !== 'reservation') {
    // Standard events need price and participants
    if (!data.price) {
      ctx.addIssue({
        code: 'custom',
        message: 'Price is required for this event type',
        path: ['price'],
      });
    } else {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Price must be a valid number greater than or equal to 0',
          path: ['price'],
        });
      }
    }

    if (!data.numberOfParticipants) {
      ctx.addIssue({
        code: 'custom',
        message: 'Number of participants is required for this event type',
        path: ['numberOfParticipants'],
      });
    } else {
      const participants = parseInt(data.numberOfParticipants, 10);
      if (isNaN(participants) || participants < 1 || participants > 20) {
        ctx.addIssue({
          code: 'custom',
          message: 'Number of participants must be between 1 and 20',
          path: ['numberOfParticipants'],
        });
      }
    }
  }

  // Reservation event validation
  if (data.eventType === 'reservation') {
    if (!data.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date is required for reservation events',
        path: ['endDate'],
      });
    } else {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate <= startDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'End date must be after the start date',
          path: ['endDate'],
        });
      }
    }
  }

  // Recurring event validation
  if (data.eventType !== 'artist' && data.eventType !== 'reservation' && data.isRecurring) {
    if (!data.recurringEndDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Recurring end date is required for recurring events',
        path: ['recurringEndDate'],
      });
    } else {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.recurringEndDate);
      if (endDate <= startDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'Recurring end date must be after the start date',
          path: ['recurringEndDate'],
        });
      }
    }
  }

  // Options validation
  if (data.eventType !== 'artist' && data.eventType !== 'reservation' && data.hasOptions) {
    if (!data.optionCategories || data.optionCategories.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one option category is required when options are enabled',
        path: ['optionCategories'],
      });
    }
  }

  // Discount validation
  if (data.eventType !== 'artist' && data.isDiscountAvailable) {
    if (!data.discount) {
      ctx.addIssue({
        code: 'custom',
        message: 'Discount details are required when discount is enabled',
        path: ['discount'],
      });
    } else if (data.price) {
      const price = parseFloat(data.price);
      const discountValue = parseFloat(data.discount.value);
      
      if (data.discount.type === 'percentage' && discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Percentage discount cannot exceed 100%',
          path: ['discount', 'value'],
        });
      }
      
      if (data.discount.type === 'fixed' && discountValue >= price) {
        ctx.addIssue({
          code: 'custom',
          message: 'Fixed discount cannot be greater than or equal to the price',
          path: ['discount', 'value'],
        });
      }
    }
  }

  // Time validation: end time must be after start time
  if (data.startTime && data.endTime) {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }
  }
});

/**
 * Unified form type for React Hook Form compatibility.
 */
export type UnifiedEventFormData = z.infer<typeof unifiedEventFormSchema>;

/**
 * Default values for new event form.
 */
export const defaultEventFormValues: Partial<UnifiedEventFormData> = {
  eventName: '',
  eventType: 'class',
  description: '',
  price: '',
  numberOfParticipants: '',
  startDate: '',
  startTime: '',
  endTime: '',
  isRecurring: false,
  recurringPattern: 'weekly',
  recurringEndDate: '',
  hasOptions: false,
  optionCategories: [{
    categoryName: '',
    categoryDescription: '',
    choices: [{ name: '', price: '' }],
  }],
  image: null,
  imageUrl: undefined,
  isDiscountAvailable: false,
  discount: {
    type: 'percentage',
    value: '',
    minParticipants: '2',
    name: '',
    description: '',
  },
};

/**
 * Default values for reservation events.
 */
export const defaultReservationEventFormValues: Partial<UnifiedEventFormData> = {
  ...defaultEventFormValues,
  eventType: 'reservation',
  isReservationEvent: true,
  isRecurring: false,
  hasOptions: false,
  isDiscountAvailable: false,
  endDate: '',
  reservationSettings: {
    dayPricing: [{ numberOfDays: 1, price: 75 }],
    dailyCapacity: undefined,
  },
};

/**
 * Utility function to get default values based on event type.
 */
export function getDefaultValuesForEventType(eventType: EventType): Partial<UnifiedEventFormData> {
  switch (eventType) {
    case 'reservation':
      return defaultReservationEventFormValues;
    case 'artist':
      return {
        ...defaultEventFormValues,
        eventType: 'artist',
        price: undefined,
        numberOfParticipants: undefined,
        isRecurring: false,
        hasOptions: false,
        isDiscountAvailable: false,
      };
    default:
      return {
        ...defaultEventFormValues,
        eventType,
      };
  }
}