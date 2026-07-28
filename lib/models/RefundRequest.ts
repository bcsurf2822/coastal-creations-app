import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * A customer-submitted refund request. This is a REQUEST, not the refund itself —
 * the admin reviews it in the Refunds queue and issues (or declines) it. Issuing
 * the actual refund still flows through the existing refund routes
 * (/api/admin/store/orders/[id]/refund for orders, /api/refunds for bookings).
 *
 * Covers both store orders and event bookings via `type` + `targetId`.
 * Money is in CENTS (matches Order); booking amounts are converted to cents here.
 */

export type RefundRequestType = "order" | "booking";
export type RefundRequestStatus = "pending" | "approved" | "declined";

export interface IRefundRequestItem {
  squareVariationId: string;
  name: string;
  quantity: number;
}

export interface IRefundRequest extends Document {
  type: RefundRequestType;
  targetId: mongoose.Types.ObjectId; // Order._id or Customer._id
  orderNumber?: string; // denormalized for display (orders)
  referenceLabel: string; // "Order CC-1234" or the event name
  customerName: string;
  customerEmail: string;
  requestedItems?: IRefundRequestItem[]; // orders only
  requestedAmountCents: number; // display estimate (admin can change at issue time)
  reason: string;
  status: RefundRequestStatus;
  adminNote?: string;
  resolvedAt?: Date;
  resolvedByEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRequestItemSchema = new Schema<IRefundRequestItem>(
  {
    squareVariationId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const RefundRequestSchema = new Schema<IRefundRequest>(
  {
    type: { type: String, enum: ["order", "booking"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    orderNumber: { type: String, trim: true },
    referenceLabel: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    requestedItems: { type: [RefundRequestItemSchema], default: [] },
    requestedAmountCents: { type: Number, required: true, min: 0, default: 0 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      required: true,
      default: "pending",
    },
    adminNote: { type: String, trim: true },
    resolvedAt: { type: Date },
    resolvedByEmail: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

RefundRequestSchema.index({ status: 1, createdAt: -1 });
RefundRequestSchema.index({ targetId: 1, status: 1 });
RefundRequestSchema.index({ customerEmail: 1, createdAt: -1 });

const RefundRequest: Model<IRefundRequest> =
  mongoose.models.RefundRequest ||
  mongoose.model<IRefundRequest>("RefundRequest", RefundRequestSchema);

export default RefundRequest;
