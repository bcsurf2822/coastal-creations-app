import { connectMongo } from "@/lib/mongoose";
import Order, { type IOrder } from "@/lib/models/Order";
import Customer, { type ICustomer } from "@/lib/models/Customer";
import RefundRequest, {
  type IRefundRequest,
} from "@/lib/models/RefundRequest";
// Imported so the refPath populate on `event` ("Event" | "PrivateEvent" |
// "Reservation") can resolve — each import registers its Mongoose model.
import "@/lib/models/Event";
import "@/lib/models/PrivateEvent";
import "@/lib/models/Reservations";

/**
 * Customer-account data access. Every query is scoped to the SIGNED-IN user's email —
 * callers MUST pass `session.user.email`, never a client-supplied value.
 *
 * Emails are matched case-insensitively: bookings/orders store whatever the customer typed
 * at checkout (possibly mixed case), while the session email is normalized to lowercase.
 */

export function emailMatch(email: string): { $regex: string; $options: string } {
  const escaped = email.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { $regex: `^${escaped}$`, $options: "i" };
}

/**
 * Match orders owned by the signed-in user. An order is theirs if it carries their
 * stamped `userId` (orders placed while signed in) OR its buyer email matches the
 * session email (guest orders, and any placed before userId stamping existed).
 * `userId` is optional so callers that only have an email still work.
 */
function orderOwnerMatch(
  sessionEmail: string,
  userId?: string
): Record<string, unknown> {
  const byEmail = { "customer.email": emailMatch(sessionEmail) };
  return userId ? { $or: [{ userId }, byEmail] } : byEmail;
}

/** Store orders belonging to the signed-in user, newest first. */
export async function getMyOrders(
  sessionEmail: string,
  userId?: string
): Promise<IOrder[]> {
  await connectMongo();
  return Order.find(orderOwnerMatch(sessionEmail, userId))
    .sort({ createdAt: -1 })
    .lean<IOrder[]>();
}

/** A single order by number, ONLY if it belongs to the signed-in user (else null). */
export async function getMyOrderByNumber(
  sessionEmail: string,
  orderNumber: string,
  userId?: string
): Promise<IOrder | null> {
  await connectMongo();
  return Order.findOne({
    orderNumber,
    ...orderOwnerMatch(sessionEmail, userId),
  }).lean<IOrder | null>();
}

/**
 * The signed-in user's most recent order, used to prefill checkout (name, phone,
 * shipping address). Returns null when they have no prior order.
 */
export async function getLatestOrderForPrefill(
  sessionEmail: string,
  userId?: string
): Promise<IOrder | null> {
  await connectMongo();
  return Order.findOne(orderOwnerMatch(sessionEmail, userId))
    .sort({ createdAt: -1 })
    .lean<IOrder | null>();
}

/** Event/class bookings belonging to the signed-in user, newest first. */
export async function getMyBookings(sessionEmail: string): Promise<ICustomer[]> {
  await connectMongo();
  return Customer.find({ "billingInfo.emailAddress": emailMatch(sessionEmail) })
    .sort({ createdAt: -1 })
    .populate("event")
    .lean<ICustomer[]>();
}

/** Refund requests belonging to the signed-in user, newest first. */
export async function getMyRefundRequests(
  sessionEmail: string
): Promise<IRefundRequest[]> {
  await connectMongo();
  return RefundRequest.find({ customerEmail: emailMatch(sessionEmail) })
    .sort({ createdAt: -1 })
    .lean<IRefundRequest[]>();
}
