import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPrivateEvent extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Define subdocument schemas for options
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

const PrivateEventSchema = new Schema<IPrivateEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    options: {
      type: [OptionSchema],
      required: false,
    },
    isDepositRequired: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
    },
    instagramEmbedCode: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
PrivateEventSchema.index({ title: 1 });

PrivateEventSchema.statics.testConnection = function () {
  return this.findOne().limit(1);
};

// Prevent duplicate models in development
// Clear the model if it exists to ensure we get the updated schema
if (mongoose.models.PrivateEvent) {
  delete mongoose.models.PrivateEvent;
}

const PrivateEvent: Model<IPrivateEvent> = mongoose.model<IPrivateEvent>("PrivateEvent", PrivateEventSchema);

export default PrivateEvent;
