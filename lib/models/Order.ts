import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Online store order (physical products sold through the Shop).
 *
 * This model is the heart of the e-commerce order flow (Square + Shippo). It is
 * ADDITIVE and independent from the existing Event/Customer/Reservation booking
 * system. See spec/ecommerce/INITIAL.md.
 *
 * Money is stored in CENTS (Square-native). Convert at the UI boundary via
 * lib/utils/moneyHelpers.ts.
 */

// Order lifecycle status. Drives both the customer flow and the admin Shipments tracker.
export type OrderStatus =
  | "pending" // created, payment not yet confirmed
  | "paid" // Square payment captured
  | "label_created" // Shippo label purchased, ready to print
  | "shipped" // merchant tapped "Mark Shipped" (diagram step 7)
  | "delivered" // Shippo tracking webhook reported delivery (diagram step 8)
  | "cancelled"
  | "refunded";

// v1 supports full refunds only; "partial" is reserved for future use.
export type OrderRefundStatus = "none" | "partial" | "full";

// Snapshot of a custom option chosen at purchase (mirrors Customer.ts SelectedOption).
export interface IOrderSelectedOption {
  categoryName: string;
  choiceName: string;
}

// A single purchased line item. Stored as a SNAPSHOT so historical orders stay
// accurate even if the Square catalog item later changes or is deleted.
export interface IOrderItem {
  squareCatalogItemId: string; // Square Catalog ITEM id
  squareVariationId: string; // chosen ItemVariation id
  name: string; // item name at time of purchase
  variationName?: string; // e.g. "Large", "Blue"
  selectedOptions?: IOrderSelectedOption[];
  quantity: number;
  unitPriceCents: number; // price at time of purchase
  refundedQuantity?: number; // cumulative units refunded across all refund events (default 0)
}

// A single refund event against the order (item-level, no shipping). Stored as a
// log so multiple partial refunds over time keep a full audit trail.
export interface IOrderRefund {
  squareRefundId?: string; // Square PaymentRefund id
  amountCents: number; // amount refunded in this event
  reason?: string;
  items: Array<{
    squareVariationId: string;
    name: string;
    quantity: number; // units refunded for this line in this event
  }>;
  createdAt: Date;
}

// Shipping / billing address. Shape aligns with the Shippo address object.
export interface IOrderAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface IOrder extends Document {
  orderNumber: string; // human-friendly, unique (e.g. "CC-LXYZ-4821")
  // Durable link to the authenticated user who placed this order, when signed in.
  // Guest orders have none — they are still reconciled to a user by email at read
  // time (see lib/account/queries.ts). Stamped at checkout from the session.
  userId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  square: {
    paymentId?: string;
    orderId?: string;
    customerId?: string;
    receiptUrl?: string; // Square-hosted payment receipt
  };
  /** A gift card redeemed against this order (amount in cents). */
  giftCard?: {
    giftCardId: string;
    amountCents: number;
  };
  shippo: {
    shipmentId?: string;
    rateId?: string;
    transactionId?: string;
    labelUrl?: string; // print-ready label PDF
    trackingNumber?: string;
    trackingUrlProvider?: string; // carrier tracking link sent to customer
    carrier?: string; // e.g. "ups", "fedex"
    serviceLevel?: string; // e.g. "ups_ground"
  };
  status: OrderStatus;
  refundStatus: OrderRefundStatus;
  refundAmountCents?: number;
  refundedAt?: Date;
  refunds?: IOrderRefund[]; // per-event refund log (item-level)
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SelectedOptionSchema = new Schema<IOrderSelectedOption>(
  {
    categoryName: { type: String, required: true, trim: true },
    choiceName: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    squareCatalogItemId: { type: String, required: true, trim: true },
    squareVariationId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    variationName: { type: String, trim: true },
    selectedOptions: { type: [SelectedOptionSchema], default: [] },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    refundedQuantity: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const OrderRefundSchema = new Schema<IOrderRefund>(
  {
    squareRefundId: { type: String, trim: true },
    amountCents: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    items: {
      type: [
        new Schema(
          {
            squareVariationId: { type: String, required: true, trim: true },
            name: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AddressSchema = new Schema<IOrderAddress>(
  {
    name: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    stateProvince: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "US" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => Array.isArray(items) && items.length > 0,
        message: "An order must contain at least one item",
      },
    },
    subtotalCents: { type: Number, required: true, min: 0 },
    shippingCents: { type: Number, required: true, min: 0, default: 0 },
    taxCents: { type: Number, required: true, min: 0, default: 0 },
    totalCents: { type: Number, required: true, min: 0 },
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
    },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: false },
    square: {
      paymentId: { type: String, trim: true },
      orderId: { type: String, trim: true },
      customerId: { type: String, trim: true },
      receiptUrl: { type: String, trim: true },
    },
    giftCard: {
      giftCardId: { type: String, trim: true },
      amountCents: { type: Number, min: 0 },
    },
    shippo: {
      shipmentId: { type: String, trim: true },
      rateId: { type: String, trim: true },
      transactionId: { type: String, trim: true },
      labelUrl: { type: String, trim: true },
      trackingNumber: { type: String, trim: true },
      trackingUrlProvider: { type: String, trim: true },
      carrier: { type: String, trim: true },
      serviceLevel: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "label_created",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      required: true,
      default: "pending",
    },
    refundStatus: {
      type: String,
      enum: ["none", "partial", "full"],
      required: true,
      default: "none",
    },
    refundAmountCents: { type: Number, min: 0, default: 0 },
    refundedAt: { type: Date },
    refunds: { type: [OrderRefundSchema], default: [] },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Generate a human-friendly, reasonably-unique order number if one is not supplied.
// Format: CC-<base36 timestamp>-<random 3 chars>. The unique index is the real guard.
OrderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    this.orderNumber = `CC-${time}-${rand}`;
  }
  next();
});

// Indexes for the admin Sales page + Shipments tracker queries.
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "customer.email": 1, createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "square.paymentId": 1 });
OrderSchema.index({ "shippo.trackingNumber": 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
