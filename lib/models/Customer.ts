import mongoose, { Document, Model, Schema } from "mongoose";
import { IEvent } from "./Event";
import { IPrivateEvent } from "./PrivateEvent";

export interface ICustomer extends Document {
  _id: string;
  event: IEvent | IPrivateEvent | string;
  eventType: "Event" | "PrivateEvent";
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
  refundedAt?: Date;
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

const ParticipantSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: "Participant",
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: "Unknown",
    },
    selectedOptions: {
      type: [SelectedOptionSchema],
      required: false,
      default: [],
      _id: false,
    },
  },
  {
    _id: false,
    strict: false,
    autoIndex: false,
  }
);

// Main Customer schema
const CustomerSchema = new Schema<ICustomer>(
  {
    event: {
      type: Schema.Types.ObjectId,
      refPath: "eventType",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["Event", "PrivateEvent"],
      required: true,
      default: "Event",
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
      _id: false,
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
    squarePaymentId: {
      type: String,
      required: false,
      trim: true,
    },
    squareCustomerId: {
      type: String,
      required: false,
      trim: true,
    },
    refundStatus: {
      type: String,
      enum: ["none", "partial", "full"],
      default: "none",
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    refundedAt: {
      type: Date,
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
    (this.isModified("quantity") || this.isNew);

  if (shouldCalculateTotal) {
    try {
      let event: IEvent | IPrivateEvent;

      if (typeof this.event !== "string") {
        event = this.event;
      } else {
        const ModelToUse =
          this.eventType === "PrivateEvent"
            ? mongoose.model("PrivateEvent")
            : mongoose.model("Event");

        const foundEvent = await ModelToUse.findById(this.event);
        if (!foundEvent) {
          next(
            new Error(
              `${this.eventType === "PrivateEvent" ? "Private event" : "Event"} not found`
            )
          );
          return;
        }
        event = foundEvent as IEvent | IPrivateEvent;
      }

      const eventPrice = event.price || 0;
      this.total = this.quantity * eventPrice;
    } catch (error) {
      next(error as Error);
      return;
    }
  }
  next();
});

CustomerSchema.path("billingInfo").validate(function (value: {
  emailAddress?: string;
  phoneNumber?: string;
}) {
  return value.emailAddress || value.phoneNumber;
}, "Either Email Address or Phone Number is required for contact purposes");

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

CustomerSchema.pre("validate", function (next) {
  if (!this.participants) {
    this.participants = [];
  }

  if (!this.isSigningUpForSelf && this.participants.length !== this.quantity) {
    const currentLength = this.participants.length;
    for (let i = currentLength; i < this.quantity; i++) {
      this.participants.push({
        firstName: `Participant ${i + 1}`,
        lastName: "Pending",
        selectedOptions: [],
      });
    }
    if (this.participants.length > this.quantity) {
      this.participants = this.participants.slice(0, this.quantity);
    }
  }

  if (
    this.isSigningUpForSelf &&
    this.quantity > 1 &&
    this.participants.length !== this.quantity - 1
  ) {
    const targetLength = this.quantity - 1;
    const currentLength = this.participants.length;

    for (let i = currentLength; i < targetLength; i++) {
      this.participants.push({
        firstName: `Additional Person ${i + 1}`,
        lastName: "Pending",
        selectedOptions: [],
      });
    }

    if (this.participants.length > targetLength) {
      this.participants = this.participants.slice(0, targetLength);
    }
  }

  next();
});

if (mongoose.models.Customer) {
  delete mongoose.models.Customer;
}

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema
);

export default Customer;
