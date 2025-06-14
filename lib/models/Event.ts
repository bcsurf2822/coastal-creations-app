import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  _id: string;
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist";
  description: string;
  price?: number;
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
  createdAt: Date;
  updatedAt: Date;
}

// Define subdocument schemas
const EventDatesSchema = new Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
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
  },
  excludeDates: [
    {
      type: Date,
    },
  ],
  specificDates: [
    {
      type: Date,
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
