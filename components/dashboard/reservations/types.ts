export interface Reservation {
  _id: string;
  eventName: string;
  description?: string;
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay?: number;
  dates?: {
    startDate: string;
    endDate: string;
  };
  time?: {
    startTime: string;
    endTime: string;
  };
  dailyAvailability?: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}

export interface Customer {
  _id: string;
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
  selectedDates?: Array<{
    date: Date;
    numberOfParticipants: number;
  }>;
  participants: Array<{
    firstName: string;
    lastName: string;
    selectedOptions?: Array<{
      categoryName: string;
      choiceName: string;
    }>;
  }>;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
  billingInfo: {
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
  };
  createdAt: string;
}

export interface ParticipantForDate {
  customer: Customer;
  participantNames: string[];
  numberOfParticipants: number;
}
