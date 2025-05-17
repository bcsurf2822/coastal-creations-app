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
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate total before saving
CustomerSchema.pre("save", async function (next) {
  if (this.isModified("quantity") || this.isNew) {
    if (typeof this.event !== "string") {
      this.total = this.quantity * (this.event as IEvent).price;
    } else {
      // If we only have the event ID, we need to fetch the event to get its price
      try {
        const Event = mongoose.model("Event");
        const event = await Event.findById(this.event);
        if (event) {
          this.total = this.quantity * event.price;
        }
      } catch (error) {
        next(error as Error);
        return;
      }
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
