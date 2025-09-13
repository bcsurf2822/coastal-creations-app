/**
 * @fileoverview Event and form types for the application
 * @module lib/types/eventTypes
 */

/**
 * Event type enumeration.
 */
export type EventType = "class" | "workshop" | "camp" | "artist";

/**
 * Recurring pattern enumeration.
 */
export type RecurringPattern = "daily" | "weekly";

/**
 * Discount type enumeration.
 */
export type DiscountType = "percentage" | "fixed";

/**
 * Option choice interface for event options.
 */
export interface OptionChoice {
  name: string;
  price?: string; // String for form input, converted to number later
}

/**
 * Option category interface for event options system.
 */
export interface OptionCategory {
  categoryName: string;
  categoryDescription?: string;
  choices: OptionChoice[];
}

/**
 * Discount interface for event pricing discounts.
 */
export interface DiscountData {
  type: DiscountType;
  value: string; // String for form input, converted to number later
  minParticipants: string; // String for form input, converted to number later
  name: string;
  description?: string;
}

/**
 * Event form data interface for all event types.
 */
export interface EventFormData {
  // Basic event information
  eventName: string;
  eventType: EventType;
  description: string;

  // Date and time fields
  startDate: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format

  // Optional fields for different event types
  price?: string; // String for form input
  numberOfParticipants?: string; // String for form input

  // Recurring event fields
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  recurringEndDate?: string; // YYYY-MM-DD format

  // Options system
  hasOptions?: boolean;
  optionCategories?: OptionCategory[];

  // Discount system
  isDiscountAvailable?: boolean;
  discount?: DiscountData;

  // Image upload
  image?: File | null;
  imageUrl?: string;
}

export interface Participant {
  firstName: string;
  lastName: string;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
}

/**
 * Billing information interface.
 */
export interface BillingInfo {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  emailAddress?: string;
  phoneNumber?: string;
}

/**
 * Customer booking interface.
 */
export interface CustomerBookingData {
  event: string; // Event ID
  quantity: number;
  isSigningUpForSelf: boolean;
  participants: Participant[];
  billingInfo: BillingInfo;
}

/**
 * Day selection data interface for calendar interface.
 */
export interface DaySelectionData {
  eventId: string;
  availableDateRange: {
    startDate: Date;
    endDate: Date;
  };
  selectedDates: Date[];
  requireConsecutive?: boolean;
}

/**
 * Form validation result interface.
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  firstError?: string;
}

/**
 * Simple validation helper functions.
 */
export const validators = {
  required: (
    value: string | undefined | null,
    fieldName: string
  ): string | null => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value: string | undefined): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email address";
    }
    return null;
  },

  minLength: (
    value: string | undefined,
    min: number,
    fieldName: string
  ): string | null => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (
    value: string | undefined,
    max: number,
    fieldName: string
  ): string | null => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} cannot exceed ${max} characters`;
    }
    return null;
  },

  number: (value: string | undefined, fieldName: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  positiveNumber: (
    value: string | undefined,
    fieldName: string
  ): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  integer: (value: string | undefined, fieldName: string): string | null => {
    if (!value) return null;
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${fieldName} must be a whole number`;
    }
    return null;
  },

  range: (
    value: string | undefined,
    min: number,
    max: number,
    fieldName: string
  ): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  dateFormat: (value: string | undefined, fieldName: string): string | null => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return `${fieldName} must be in YYYY-MM-DD format`;
    }
    return null;
  },

  timeFormat: (value: string | undefined, fieldName: string): string | null => {
    if (!value) return null;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return `${fieldName} must be in HH:MM format`;
    }
    return null;
  },

  futureDate: (value: string | undefined, fieldName: string): string | null => {
    if (!value) return null;
    const selectedDate = new Date(value + "T00:00:00.000Z");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return `${fieldName} must be today or in the future`;
    }
    return null;
  },

  endTimeAfterStart: (
    startTime: string | undefined,
    endTime: string | undefined
  ): string | null => {
    if (!startTime || !endTime) return null;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      return "End time must be after start time";
    }
    return null;
  },

  endDateAfterStart: (
    startDate: string | undefined,
    endDate: string | undefined
  ): string | null => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return "End date must be after start date";
    }
    return null;
  },
};

/**
 * Default values for new event form.
 */
export const defaultEventFormValues: Partial<EventFormData> = {
  eventName: "",
  eventType: "class",
  description: "",
  price: "",
  numberOfParticipants: "",
  startDate: "",
  startTime: "",
  endTime: "",
  isRecurring: false,
  recurringPattern: "weekly",
  recurringEndDate: "",
  hasOptions: false,
  optionCategories: [
    {
      categoryName: "",
      categoryDescription: "",
      choices: [{ name: "", price: "" }],
    },
  ],
  image: null,
  imageUrl: "",
  isDiscountAvailable: false,
  discount: {
    type: "percentage",
    value: "",
    minParticipants: "2",
    name: "",
    description: "",
  },
};

/**
 * Utility function to get default values based on event type.
 */
export function getDefaultValuesForEventType(
  eventType: EventType
): Partial<EventFormData> {
  switch (eventType) {
    case "artist":
      return {
        ...defaultEventFormValues,
        eventType: "artist" as const,
        price: "",
        numberOfParticipants: "",
        isRecurring: false,
        hasOptions: false,
        isDiscountAvailable: false,
      };
    case "class":
      return {
        ...defaultEventFormValues,
        eventType: "class" as const,
      };
    case "workshop":
      return {
        ...defaultEventFormValues,
        eventType: "workshop" as const,
      };
    case "camp":
      return {
        ...defaultEventFormValues,
        eventType: "camp" as const,
      };
  }
}
