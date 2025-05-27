import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for Birthday document
export interface IBirthday extends Document {
  _id: string;
  title: string;
  description: string;
  price: number;
  minimum: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

// Main Birthday schema
const BirthdaySchema = new Schema<IBirthday>(
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
    minimum: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
BirthdaySchema.index({ title: 1 });

// Static method to test connection
BirthdaySchema.statics.testConnection = function () {
  return this.findOne().limit(1);
};

// Prevent duplicate models in development
const Birthday: Model<IBirthday> =
  mongoose.models.Birthday ||
  mongoose.model<IBirthday>("Birthday", BirthdaySchema);

export default Birthday;
