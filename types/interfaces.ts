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
