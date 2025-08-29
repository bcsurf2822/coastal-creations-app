import mongoose, { Document, Model, Schema } from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set your local timezone - adjust this to your actual timezone
// Common US timezones: "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"
// For other timezones, see: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
const LOCAL_TIMEZONE = "America/New_York"; // Change this to your timezone

// TypeScript interface for Event document
export interface IEvent extends Document {
  _id: string;
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist";
  description: string;
  price?: number;
  numberOfParticipants?: number;
  dates: {
    startDate: Date;
    endDate?: Date;
    isRecurring: boolean;
    recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurringEndDate?: Date;
    excludeDates?: Date[];
    specificDates?: Date[];
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
    }>;
  }>;
  image?: string;
  isDiscountAvailable?: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
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

  // For other string formats, try to parse normally
  if (typeof value === "string") {
    return dayjs(value).toDate();
  }

  // This should never happen given our input types, but TypeScript needs it
  return null;
};

// Define subdocument schemas
const EventDatesSchema = new Schema({
  startDate: {
    type: Date,
    required: true,
    set: convertToLocalDate,
  },
  endDate: {
    type: Date,
    set: convertToLocalDate,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
  },
  recurringEndDate: {
    type: Date,
    set: convertToLocalDate,
  },
  excludeDates: [
    {
      type: Date,
      set: convertToLocalDate,
    },
  ],
  specificDates: [
    {
      type: Date,
      set: convertToLocalDate,
    },
  ],
});

const EventTimeSchema = new Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
  },
});

const OptionChoiceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

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

const DiscountSchema = new Schema({
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
  minParticipants: {
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
});

// Main Event schema
const EventSchema = new Schema<IEvent>(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["class", "camp", "workshop", "artist"],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
    numberOfParticipants: {
      type: Number,
    },
    dates: {
      type: EventDatesSchema,
      required: true,
    },
    time: {
      type: EventTimeSchema,
      required: true,
    },
    options: {
      type: [OptionSchema],
      required: false,
    },
    image: {
      type: String,
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

// Index for efficient searching
EventSchema.index({ "dates.startDate": 1, eventType: 1 });

// Static method to test connection
EventSchema.statics.testConnection = function () {
  return this.findOne().limit(1);
};

// Prevent duplicate models in development
// Clear the model if it exists to ensure we get the updated schema
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);

export default Event;
