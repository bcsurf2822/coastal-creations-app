import type { HoursOfOperation } from "@/types/hours";
import type { PageContent, PortableTextContent } from "@/types/pageContent";
import type { ApiEvent, ICustomer, PictureGalleryItem } from "@/types/interfaces";
import type { Reservation } from "@/lib/types/reservationTypes";

// Minimal valid PortableText block helper for description fields.
const portableText = (text: string): PortableTextContent => [
  {
    _type: "block",
    _key: "block-0",
    children: [{ _type: "span", _key: "span-0", text }],
  },
];

// Hours mock data
export const mockHoursData: HoursOfOperation = {
  _id: "test-hours-id",
  _type: "hoursOfOperation",
  monday: { isClosed: false, hours: { open: "10:00 AM", close: "6:00 PM" } },
  tuesday: { isClosed: false, hours: { open: "10:00 AM", close: "6:00 PM" } },
  wednesday: { isClosed: false, hours: { open: "10:00 AM", close: "6:00 PM" } },
  thursday: { isClosed: false, hours: { open: "10:00 AM", close: "6:00 PM" } },
  friday: { isClosed: false, hours: { open: "10:00 AM", close: "8:00 PM" } },
  saturday: { isClosed: false, hours: { open: "9:00 AM", close: "5:00 PM" } },
  sunday: { isClosed: true },
};

// Page content mock data
export const mockPageContent: PageContent = {
  _id: "test-page-content-id",
  _type: "pageContent",
  homepage: {
    hero: {
      heading: "Welcome to Coastal Creations",
      ctaButton1: "Book a Class",
      ctaButton2: "View Gallery",
    },
    offerings: {
      sectionTitle: "Our Offerings",
      sectionSubtitle: portableText("Explore our classes"),
    },
  },
  eventPages: {
    adultClasses: { title: "Adult Classes", description: portableText("Classes for adults") },
    kidClasses: { title: "Kid Classes", description: portableText("Classes for kids") },
    camps: { title: "Camps", description: portableText("Summer camps") },
  },
  otherPages: {
    about: { title: "About Us", description: portableText("Learn about us") },
    gallery: { title: "Gallery", description: portableText("View our gallery") },
    reservations: { title: "Reservations", description: portableText("Book a reservation") },
  },
};

// Event mock data
export const mockEvent: ApiEvent = {
  _id: "test-event-id-1",
  eventName: "Paint & Sip Night",
  eventType: "class",
  description: "Join us for a fun painting class",
  price: 45,
  numberOfParticipants: 20,
  time: {
    startTime: "6:00 PM",
    endTime: "8:00 PM",
  },
  dates: {
    startDate: "2024-12-20",
    endDate: "2024-12-20",
    isRecurring: false,
  },
  image: "https://example.com/image.jpg",
  options: [],
  createdAt: "2024-11-01T10:00:00Z",
  updatedAt: "2024-11-01T10:00:00Z",
};

export const mockEvents: ApiEvent[] = [
  mockEvent,
  {
    ...mockEvent,
    _id: "test-event-id-2",
    eventName: "Kids Art Class",
    eventType: "class",
    price: 30,
  },
  {
    ...mockEvent,
    _id: "test-event-id-3",
    eventName: "Summer Art Camp",
    eventType: "camp",
    price: 200,
  },
];

// Customer mock data
export const mockCustomer: ICustomer = {
  _id: "test-customer-id-1",
  event: {
    _id: "test-event-id-1",
    eventName: "Paint & Sip Night",
    eventType: "class",
    price: 45,
  },
  eventType: "Event",
  quantity: 2,
  total: 90,
  isSigningUpForSelf: true,
  participants: [
    { firstName: "John", lastName: "Doe" },
  ],
  billingInfo: {
    firstName: "John",
    lastName: "Doe",
    addressLine1: "123 Main St",
    city: "Ocean City",
    stateProvince: "NJ",
    postalCode: "08226",
    country: "US",
    emailAddress: "john@example.com",
    phoneNumber: "555-1234",
  },
  squarePaymentId: "sq-payment-123",
  refundStatus: "none",
};

export const mockCustomers: ICustomer[] = [
  mockCustomer,
  {
    ...mockCustomer,
    _id: "test-customer-id-2",
    billingInfo: {
      ...mockCustomer.billingInfo,
      firstName: "Jane",
      emailAddress: "jane@example.com",
    },
  },
];

// Reservation mock data
export const mockReservation: Reservation = {
  _id: "test-reservation-id-1",
  eventName: "Walk-In Painting",
  eventType: "reservation",
  description: "Drop-in painting session",
  pricePerDayPerParticipant: 25,
  dates: {
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-31"),
    excludeDates: [],
  },
  timeType: "same",
  time: {
    startTime: "10:00 AM",
    endTime: "6:00 PM",
  },
  dailyAvailability: [
    {
      date: new Date("2024-12-15"),
      maxParticipants: 10,
      currentBookings: 3,
      isAvailable: true,
    },
  ],
  options: [],
  createdAt: new Date("2024-11-01T10:00:00Z"),
  updatedAt: new Date("2024-11-01T10:00:00Z"),
};

export const mockReservations: Reservation[] = [
  mockReservation,
  {
    ...mockReservation,
    _id: "test-reservation-id-2",
    eventName: "Weekend Special",
    pricePerDayPerParticipant: 30,
  },
];

// Private event mock data
export const mockPrivateEvent = {
  _id: "test-private-event-id-1",
  eventName: "Birthday Party Package",
  eventType: "private-event",
  description: "Perfect for birthday celebrations",
  basePrice: 300,
  deposit: 100,
  options: [
    { name: "Extra Hour", price: 50 },
    { name: "Catering", price: 100 },
  ],
  image: "https://example.com/party.jpg",
};

export const mockPrivateEvents = [
  mockPrivateEvent,
  {
    ...mockPrivateEvent,
    _id: "test-private-event-id-2",
    eventName: "Corporate Team Building",
    basePrice: 500,
  },
];

// Gallery mock data
export const mockGalleryItem: PictureGalleryItem = {
  _id: "test-gallery-id-1",
  _type: "pictureGallery",
  title: "Summer Camp Art",
  description: "Art from summer camp 2024",
  destination: ["camp", "kid-class"],
  image: {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: "image-gallery1",
      url: "https://example.com/gallery1.jpg",
    },
  },
  _createdAt: "2024-08-01T10:00:00Z",
  _updatedAt: "2024-08-01T10:00:00Z",
};

export const mockGalleryItems: PictureGalleryItem[] = [
  mockGalleryItem,
  {
    ...mockGalleryItem,
    _id: "test-gallery-id-2",
    title: "Adult Class Projects",
    destination: ["adult-class"],
  },
];

// Event pictures mock data
export const mockEventPictures = [
  { _id: "pic-1", title: "Event 1", imageUrl: "https://example.com/event1.jpg" },
  { _id: "pic-2", title: "Event 2", imageUrl: "https://example.com/event2.jpg" },
];

// Private event pictures mock data
export const mockPrivateEventPictures = [
  { _id: "pic-1", title: "Party 1", imageUrl: "https://example.com/party1.jpg" },
  { _id: "pic-2", title: "Party 2", imageUrl: "https://example.com/party2.jpg" },
];

// Payment config mock data
export const mockPaymentConfig = {
  applicationId: "sq-app-id-123",
  locationId: "sq-location-id-456",
};

// Payment errors mock data (PaymentErrorLog interface)
export const mockPaymentErrors = [
  {
    _id: "error-1",
    eventId: "test-event-id-1",
    eventTitle: "Test Event 1",
    customerEmail: "test@example.com",
    customerPhone: "555-1234",
    customerName: "Test User",
    paymentAmount: 50.0,
    sourceId: "src-1",
    paymentErrors: [
      { code: "CARD_DECLINED", detail: "Card was declined", category: "PAYMENT_METHOD_ERROR" },
    ],
    rawErrorResponse: {
      stack: "Error stack trace",
      message: "Card was declined",
      request: { method: "POST", url: "/api/payments" },
      statusCode: 400,
    },
    errors: [
      { code: "CARD_DECLINED", detail: "Card was declined", category: "PAYMENT_METHOD_ERROR" },
    ],
    attemptedAt: "2024-12-15T10:00:00Z",
    createdAt: "2024-12-15T10:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
    __v: 0,
  },
  {
    _id: "error-2",
    eventId: "test-event-id-2",
    eventTitle: "Test Event 2",
    customerEmail: "test2@example.com",
    customerPhone: "555-5678",
    customerName: "Test User 2",
    paymentAmount: 75.0,
    sourceId: "src-2",
    paymentErrors: [
      { code: "INVALID_CARD", detail: "Invalid card number", category: "INVALID_REQUEST_ERROR" },
    ],
    rawErrorResponse: {
      stack: "Error stack trace",
      message: "Invalid card number",
      request: { method: "POST", url: "/api/payments" },
      statusCode: 400,
    },
    errors: [
      { code: "INVALID_CARD", detail: "Invalid card number", category: "INVALID_REQUEST_ERROR" },
    ],
    attemptedAt: "2024-12-14T10:00:00Z",
    createdAt: "2024-12-14T10:00:00Z",
    updatedAt: "2024-12-14T10:00:00Z",
    __v: 0,
  },
];
