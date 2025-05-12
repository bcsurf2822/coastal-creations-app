import mongoose, { Document, Model, Schema } from "mongoose";
import { IEvent } from "./Event";

// TypeScript interface for Customer document
export interface ICustomer extends Document {
  _id: string;
  event: IEvent | string; // Reference to Event model
  quantity: number;
  total: number; // price x quantity
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

// Prevent duplicate models in development
const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
