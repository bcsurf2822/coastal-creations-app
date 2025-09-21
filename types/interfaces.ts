// Define the type for calendar events
export interface CalendarEvent {
  title: string;
  start: Date | string;
  end?: Date | string;
  resourceId?: string;
  allDay?: boolean;
  id?: string;
  extendedProps?: {
    _id?: string;
    description?: string;
    eventType?: string;
    price?: number;
    timeDisplay?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringEndDate?: string | Date;
    originalStartDate?: string;
    isMultiDay?: boolean;
  };
}

// Define the type for API events based on your mongoose model
export interface ApiEvent {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  numberOfParticipants?: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: string;
    recurringEndDate?: string;
    specificDates?: string[];
    excludeDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Define the type for Birthday parties
export interface Birthday {
  _id: string;
  title: string;
  description: string;
  price: number;
  minimum: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

// Define the type for Dashboard Event display
export interface DashboardEvent {
  id: string;
  name: string;
  description?: string;
  eventType?: string;
  price?: number;
  numberOfParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  recurringEndDate?: Date;
  startTime?: string;
  endTime?: string;
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
    }>;
  }>;
  isDiscountAvailable?: boolean;
  discount?: {
    type?: string;
    value?: number;
    description?: string;
  };
}

// Define the type for Dashboard Reservation display
export interface DashboardReservation {
  id: string;
  name: string;
  description?: string;
  eventType: "reservation";
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay: number;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
    }>;
  }>;
  isDiscountAvailable?: boolean;
  discount?: {
    type?: string;
    value?: number;
    description?: string;
  };
  dailyAvailability: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}
