import mongoose, { Document, Model, Schema } from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";
// Time slot interface for granular booking within a day
export interface ITimeSlot {
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  maxParticipants: number;
  currentBookings: number;
  isAvailable: boolean;
}

export interface IReservation extends Document {
  eventName: string;
  eventType: "reservation";
  description: string;
  pricePerDayPerParticipant: number;
  dates: {
    startDate: Date;
    endDate?: Date;
    excludeDates?: Date[];
  };
  timeType: "same" | "custom";
  time: {
    startTime?: string;
    endTime?: string;
  };
  // Time slot configuration (optional - when enabled, clients select specific time blocks)
  enableTimeSlots?: boolean;
  slotDurationMinutes?: 60 | 120 | 240; // 1, 2, or 4 hours only
  maxParticipantsPerSlot?: number;
  dailyAvailability: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
    startTime?: string;
    endTime?: string;
    // Time slots within the day (only populated when enableTimeSlots is true)
    timeSlots?: ITimeSlot[];
  }>;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
  image?: string;
  isDiscountAvailable?: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minDays: number;
    name: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to convert date strings to proper Date objects in local timezone
const convertToLocalDate = (
  value: string | Date | null | undefined
): Date | null | undefined => {
  if (!value) return value as null | undefined;

  // If it's already a Date object, return as-is
  if (value instanceof Date) return value;

  // If it's a string in YYYY-MM-DD format (from HTML date input)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // Create date at start of day in local timezone
    return dayjs.tz(value, LOCAL_TIMEZONE).startOf("day").toDate();
  }

  // For other string formats, parse with timezone awareness
  if (typeof value === "string") {
    return dayjs.tz(value, LOCAL_TIMEZONE).toDate();
  }

  // This should never happen given our input types, but TypeScript needs it
  return null;
};

// Define subdocument schemas
const ReservationDatesSchema = new Schema({
  startDate: {
    type: Date,
    required: true,
    set: convertToLocalDate,
  },
  endDate: {
    type: Date,
    set: convertToLocalDate,
  },
  excludeDates: [
    {
      type: Date,
      set: convertToLocalDate,
    },
  ],
});

// Schema for individual time slots within a day
const TimeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const DailyAvailabilitySchema = new Schema({
  date: {
    type: Date,
    required: true,
    set: convertToLocalDate,
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: String,
    required: false,
  },
  endTime: {
    type: String,
    required: false,
  },
  // Time slots within the day (only used when enableTimeSlots is true)
  timeSlots: {
    type: [TimeSlotSchema],
    required: false,
  },
});

const ReservationTimeSchema = new Schema({
  startTime: {
    type: String,
    required: false,
  },
  endTime: {
    type: String,
    required: false,
  },
});

const OptionChoiceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },
});

// We can leave options same as events making it optional
const OptionSchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryDescription: {
    type: String,
  },
  choices: {
    type: [OptionChoiceSchema],
    required: true,
  },
});

const DiscountSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minDays: {
      type: Number,
      required: true,
      min: 2,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { _id: false }
);

const ReservationSchema = new Schema<IReservation>(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["reservation"],
    },
    description: {
      type: String,
      required: true,
    },
    pricePerDayPerParticipant: {
      type: Number,
      required: true,
      min: 0,
    },
    dates: {
      type: ReservationDatesSchema,
      required: true,
    },
    timeType: {
      type: String,
      enum: ["same", "custom"],
      default: "same",
      required: true,
    },
    time: {
      type: ReservationTimeSchema,
      required: true,
    },
    // Time slot configuration
    enableTimeSlots: {
      type: Boolean,
      default: false,
    },
    slotDurationMinutes: {
      type: Number,
      enum: [60, 120, 240], // 1, 2, or 4 hours only
      required: false,
    },
    maxParticipantsPerSlot: {
      type: Number,
      min: 1,
      required: false,
    },
    dailyAvailability: {
      type: [DailyAvailabilitySchema],
      required: true,
    },
    options: {
      type: [OptionSchema],
      required: false,
    },
    isDiscountAvailable: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: DiscountSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

ReservationSchema.index({ "dates.startDate": 1, eventType: 1 });
ReservationSchema.index({ "dailyAvailability.date": 1, "dailyAvailability.isAvailable": 1 });

// Pre-save validation for time fields based on timeType
ReservationSchema.pre("save", function (next) {
  if (this.timeType === "same") {
    if (!this.time.startTime) {
      return next(new Error("Start time is required when using same time for all days"));
    }
  } else if (this.timeType === "custom") {
    // When using custom times, ensure dailyAvailability has times set
    const missingTimes = this.dailyAvailability.some(
      (day) => !day.startTime || !day.endTime
    );
    if (missingTimes) {
      return next(new Error("All days must have start and end times when using custom times"));
    }
  }
  next();
});

ReservationSchema.statics.testConnection = function () {
  return this.findOne().limit(1);
};

if (mongoose.models.Reservation) {
  delete mongoose.models.Reservation;
}

const Reservation: Model<IReservation> = mongoose.model<IReservation>(
  "Reservation",
  ReservationSchema
);

export default Reservation;
