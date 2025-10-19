import { ReactElement } from "react";

export interface SelectedDate {
  date: Date;
  participants: number;
}

export interface ReservationListConfig {
  title: string;
  titleIcons?: { left: ReactElement; right: ReactElement };
  subtitle?: string;
  layout: "list" | "grid";
  cardConfig: {
    layout: "horizontal" | "vertical";
    showPrice: boolean;
    showImage: boolean;
    buttonText: string;
  };
  baseUrl: string;
}

export interface DayCardProps {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isExcluded: boolean;
  availability: {
    current: number;
    max: number;
  };
  startTime?: string;
  endTime?: string;
  onSelect: () => void;
  participantCount?: number;
  onParticipantChange?: (count: number) => void;
}

export interface BookingSummaryProps {
  selectedDates: SelectedDate[];
  pricePerDayPerParticipant: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minDays: number;
    name: string;
    description?: string;
  };
  optionsTotal: number;
  onContinue: () => void;
}

export interface ParticipantInfo {
  firstName: string;
  lastName: string;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  emailAddress: string;
  phoneNumber: string;
}

export interface ReservationBookingData {
  event: string;
  eventType: "Reservation";
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
  selectedDates: Array<{
    date: string;
    numberOfParticipants: number;
  }>;
  participants: ParticipantInfo[];
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
  billingInfo: BillingInfo;
  squarePaymentId: string;
}
