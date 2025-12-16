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
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
      _id?: string;
    }>;
    _id?: string;
  }>;
  image?: string;
  instagramEmbedCode?: string;
  isDiscountAvailable?: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface PrivateEvent {
  _id: string;
  title: string;
  description: string;
  price: number;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
  isDepositRequired?: boolean;
  depositAmount?: number;
  image?: string;
  instagramEmbedCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the type for Dashboard Private Event display
export interface DashboardPrivateEvent {
  id: string;
  title: string;
  description?: string;
  eventType: "private-event";
  price: number;
  image?: string;
  dates?: Date[];
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
  isDepositRequired?: boolean;
  depositAmount?: number;
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

// Gallery Destination Types
export type GalleryDestination =
  | "adult-class"
  | "kid-class"
  | "event"
  | "camp"
  | "artist"
  | "private-event"
  | "reservation"
  | "home-page"
  | "default-gallery";

// Sanity Image Asset Type
export interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
    _id?: string;
    url?: string;
  };
}

// Picture Gallery Item from Sanity
export interface PictureGalleryItem {
  _id: string;
  _type: "pictureGallery";
  title: string;
  description?: string;
  destination?: string[]; // Optional for backward compatibility with existing images
  image: SanityImageAsset;
  _createdAt: string;
  _updatedAt: string;
}

// Gallery Upload Form Data
export interface GalleryUploadFormData {
  title: string;
  description?: string;
  destinations: GalleryDestination[];
  files: File[];
}

// Gallery Update Data
export interface GalleryUpdateData {
  id: string;
  title: string;
  description?: string;
  destinations: GalleryDestination[];
}

// Customer booking interface
export interface ICustomer {
  _id?: string;
  event: {
    _id: string;
    eventName?: string;
    title?: string;
    eventType: string;
    price: number;
  };
  eventType: "Event" | "PrivateEvent" | "Reservation";
  selectedDates?: Array<{
    date: string;
    numberOfParticipants: number;
  }>;
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
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
  squarePaymentId?: string;
  squareCustomerId?: string;
  refundStatus?: "none" | "partial" | "full";
  refundAmount?: number;
  refundedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
