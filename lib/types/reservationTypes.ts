export interface ReservationDates {
  startDate: Date;
  endDate?: Date;
  excludeDates?: Date[];
}

export interface ReservationTime {
  startTime?: string;
  endTime?: string;
}

export interface DailyAvailability {
  date: Date;
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
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