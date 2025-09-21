import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPrivateEvent extends Document {
  _id: string;
  title: string;
  description: string;
  price: number;
  minimum: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

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
PrivateEventSchema.index({ title: 1 });

PrivateEventSchema.statics.testConnection = function () {
  return this.findOne().limit(1);
};

// Prevent duplicate models in development
const PrivateEvent: Model<IPrivateEvent> =
  mongoose.models.PrivateEvent ||
  mongoose.model<IPrivateEvent>("PrivateEvent", PrivateEventSchema);

export default PrivateEvent;
