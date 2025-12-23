export interface ReservationDates {
  startDate: Date;
  endDate?: Date;
  excludeDates?: Date[];
}

export interface ReservationTime {
  startTime?: string;
  endTime?: string;
}

// Time slot within a day (for granular booking)
export interface TimeSlot {
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
}

export interface DailyAvailability {
  date: Date;
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  // Time slots within the day (only present when enableTimeSlots is true)
  timeSlots?: TimeSlot[];
}

// Selected time slot for client bookings
export interface SelectedTimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  participants: number;
}

export interface ReservationOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
    price?: number;
  }>;
}

export interface ReservationDiscount {
  type: "percentage" | "fixed";
  value: number;
  minDays: number;
  name: string;
  description?: string;
}

export interface Reservation {
  _id: string;
  eventName: string;
  eventType: "reservation";
  description: string;
  pricePerDayPerParticipant: number;
  dates: ReservationDates;
  timeType?: "same" | "custom";
  time: ReservationTime;
  // Time slot configuration
  enableTimeSlots?: boolean;
  slotDurationMinutes?: 60 | 120 | 240; // 1, 2, or 4 hours only
  maxParticipantsPerSlot?: number;
  dailyAvailability: DailyAvailability[];
  options?: ReservationOption[];
  image?: string;
  isDiscountAvailable?: boolean;
  discount?: ReservationDiscount;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationData {
  eventName: string;
  description: string;
  pricePerDayPerParticipant: number;
  dates: {
    startDate: string;
    endDate?: string;
    excludeDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  maxParticipantsPerDay: number;
  // Time slot configuration
  enableTimeSlots?: boolean;
  slotDurationMinutes?: 60 | 120 | 240;
  maxParticipantsPerSlot?: number;
  options?: ReservationOption[];
  image?: string;
  isDiscountAvailable?: boolean;
  discount?: ReservationDiscount;
}

export interface CustomerBookingData {
  reservationId: string;
  selectedDates: string[];
  numberOfParticipants: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
    price: number;
  }>;
  totalAmount: number;
  specialRequests?: string;
}

export interface BookingCalculation {
  basePrice: number;
  optionsTotal: number;
  discountAmount: number;
  totalAmount: number;
  numberOfDays: number;
  discountApplied?: {
    name: string;
    type: "percentage" | "fixed";
    value: number;
  };
}

export interface AvailabilityCheck {
  date: string;
  isAvailable: boolean;
  slotsRemaining: number;
  maxParticipants: number;
  currentBookings: number;
}

export interface ReservationApiResponse {
  success: boolean;
  data?: Reservation;
  error?: string;
}

export interface ReservationsListResponse {
  success: boolean;
  data?: Reservation[];
  error?: string;
  total?: number;
}

export interface AvailabilityResponse {
  success: boolean;
  data?: AvailabilityCheck[];
  error?: string;
}