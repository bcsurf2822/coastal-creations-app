import mongoose, { Document, Model, Schema } from "mongoose";
import { IEvent } from "./Event";

// TypeScript interface for Customer document
export interface ICustomer extends Document {
  _id: string;
  event: IEvent | string; // Reference to Event model
  quantity: number;
  total: number; // price x quantity
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
  // Reservation details for multi-day bookings (optional)
  reservationDetails?: {
    selectedDates: Date[];
    numberOfDays: number;
    appliedPriceTier: {
      numberOfDays: number;
      price: number;
      label?: string;
    };
    isConsecutive: boolean;
    checkInDate: Date;
    checkOutDate?: Date;
    // Enhanced day-by-day participant management
    dailyParticipants?: Array<{
      date: Date;
      participantCount: number;
      participants?: Array<{
        firstName: string;
        lastName: string;
        selectedOptions?: Array<{
          categoryName: string;
          choiceName: string;
        }>;
      }>;
      dailyTotal?: number;
    }>;
    totalReservationCost?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define the BillingInfo schema
const BillingInfoSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  stateProvince: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
});

// Define the SelectedOption schema
const SelectedOptionSchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    choiceName: {
      type: String,
      required: true,
    },
  },
  {
    _id: false, // Don't auto-generate IDs for options
    strict: false,
  }
);

// Define the Participant schema
const ParticipantSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false, // Make this optional
      trim: true,
      default: "Participant",
    },
    lastName: {
      type: String,
      required: false, // Make this optional
      trim: true,
      default: "Unknown",
    },
    selectedOptions: {
      type: [SelectedOptionSchema],
      required: false,
      default: [],
      _id: false, // Don't auto-generate IDs for nested array elements
    },
  },
  {
    _id: false, // Don't auto-generate IDs for participants
    strict: false, // Allow additional fields to be passed through
    autoIndex: false, // Disable auto indexing
  }
);

// Schema for individual day participant information
const DailyParticipantSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  participantCount: {
    type: Number,
    required: true,
    min: 1,
  },
  participants: {
    type: [ParticipantSchema],
    required: false,
    default: [],
  },
  dailyTotal: {
    type: Number,
    required: false,
    min: 0,
  },
}, { _id: false });

// Reservation details schema for multi-day bookings
const ReservationDetailsSchema = new Schema({
  selectedDates: {
    type: [Date],
    required: true,
    validate: {
      validator: function(dates: Date[]) {
        return dates && dates.length > 0;
      },
      message: 'At least one date must be selected'
    }
  },
  numberOfDays: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: function(this: { selectedDates?: Date[] }, value: number) {
        // Validate numberOfDays matches selectedDates length
        return !this.selectedDates || value === this.selectedDates.length;
      },
      message: 'Number of days must match selected dates count'
    }
  },
  appliedPriceTier: {
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      required: false,
    },
    _id: false,
  },
  isConsecutive: {
    type: Boolean,
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: false,
  },
  // Enhanced day-by-day participant management
  dailyParticipants: {
    type: [DailyParticipantSchema],
    required: false,
    default: [],
    validate: {
      validator: function(this: { selectedDates?: Date[] }, dailyParticipants: Array<{date: Date}>) {
        // Validate that dailyParticipants dates match selectedDates
        if (!this.selectedDates || !dailyParticipants) return true;
        
        const selectedDatesStr = this.selectedDates.map(date => date.toISOString().split('T')[0]);
        const dailyParticipantDatesStr = dailyParticipants.map(dp => dp.date.toISOString().split('T')[0]);
        
        // Check if all selected dates have corresponding daily participant entries
        return selectedDatesStr.every(dateStr => dailyParticipantDatesStr.includes(dateStr));
      },
      message: 'Daily participants must be specified for all selected dates'
    }
  },
  totalReservationCost: {
    type: Number,
    required: false,
    min: 0,
  },
}, { _id: false });

// Main Customer schema
const CustomerSchema = new Schema<ICustomer>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    isSigningUpForSelf: {
      type: Boolean,
      required: true,
      default: true,
    },
    participants: {
      type: [ParticipantSchema],
      required: false,
      default: [],
      _id: false, // Don't auto-generate IDs for array elements
      strictPopulate: false,
    },
    selectedOptions: {
      type: [SelectedOptionSchema],
      required: false,
    },
    billingInfo: {
      type: BillingInfoSchema,
      required: true,
    },
    reservationDetails: {
      type: ReservationDetailsSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.pre("save", async function (next) {

  const shouldCalculateTotal = 
    (this.total === undefined || this.total === null || this.total === 0) && 
    (this.isModified("quantity") || this.isModified("reservationDetails") || this.isNew);

  if (shouldCalculateTotal) {
    try {
      let event: IEvent;
      

      if (typeof this.event !== "string") {
        event = this.event;
      } else {
        const Event = mongoose.model("Event");
        const foundEvent = await Event.findById(this.event);
        if (!foundEvent) {
          next(new Error("Event not found"));
          return;
        }
        event = foundEvent as IEvent;
      }

      if (event.eventType === "reservation" && this.reservationDetails) {

        if (this.reservationDetails.dailyParticipants && this.reservationDetails.dailyParticipants.length > 0) {
          const appliedPrice = this.reservationDetails.appliedPriceTier.price;
          let totalReservationCost = 0;
          

          for (const dailyParticipant of this.reservationDetails.dailyParticipants) {
            const dailyTotal = dailyParticipant.participantCount * appliedPrice;
            dailyParticipant.dailyTotal = dailyTotal;
            totalReservationCost += dailyTotal;
          }
          
          this.reservationDetails.totalReservationCost = totalReservationCost;
          this.total = totalReservationCost;
        } else {
          // Fallback to simple calculation if no daily participants specified
          const appliedPrice = this.reservationDetails.appliedPriceTier.price;
          this.total = this.quantity * appliedPrice;
        }
      } else {
        // For regular events, use the event price
        const eventPrice = event.price || 0;
        this.total = this.quantity * eventPrice;
      }
    } catch (error) {
      next(error as Error);
      return;
    }
  }
  next();
});

// Custom validation to ensure either email or phone is provided
CustomerSchema.path("billingInfo").validate(function (value: {
  emailAddress?: string;
  phoneNumber?: string;
}) {
  return value.emailAddress || value.phoneNumber;
}, "Either Email Address or Phone Number is required for contact purposes");

// Validation to ensure participants are specified if not signing up for self
CustomerSchema.pre("validate", function (next) {
  if (
    !this.isSigningUpForSelf &&
    (!this.participants || this.participants.length === 0)
  ) {
    this.invalidate(
      "participants",
      "Participant information is required when not signing up for self"
    );
  }
  next();
});

// Ensure participant count matches quantity for non-self registrations
CustomerSchema.pre("validate", function (next) {
  // Create empty array if participants is missing
  if (!this.participants) {
    this.participants = [];
  }

  // For non-self registrations, ensure participants count matches quantity
  if (!this.isSigningUpForSelf && this.participants.length !== this.quantity) {
    // Instead of invalidating, pad the participants array with placeholder data
    const currentLength = this.participants.length;
    for (let i = currentLength; i < this.quantity; i++) {
      this.participants.push({
        firstName: `Participant ${i + 1}`,
        lastName: "Pending",
        selectedOptions: [],
      });
    }
    // If we have too many participants, trim the array
    if (this.participants.length > this.quantity) {
      this.participants = this.participants.slice(0, this.quantity);
    }
  }

  // For self-registrations with multiple people, ensure participants = quantity - 1
  if (
    this.isSigningUpForSelf &&
    this.quantity > 1 &&
    this.participants.length !== this.quantity - 1
  ) {
    // Instead of invalidating, adjust the participants array
    const targetLength = this.quantity - 1;
    const currentLength = this.participants.length;

    // Add participants if needed
    for (let i = currentLength; i < targetLength; i++) {
      this.participants.push({
        firstName: `Additional Person ${i + 1}`,
        lastName: "Pending",
        selectedOptions: [],
      });
    }

    // Remove extra participants if necessary
    if (this.participants.length > targetLength) {
      this.participants = this.participants.slice(0, targetLength);
    }
  }

  next();
});

// Prevent duplicate models in development
const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
