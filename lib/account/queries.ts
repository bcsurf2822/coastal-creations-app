import { connectMongo } from "@/lib/mongoose";
import Order, { type IOrder } from "@/lib/models/Order";
import Customer, { type ICustomer } from "@/lib/models/Customer";

/**
 * Customer-account data access. Every query is scoped to the SIGNED-IN user's email —
 * callers MUST pass `session.user.email`, never a client-supplied value.
 *
 * Emails are matched case-insensitively: bookings/orders store whatever the customer typed
 * at checkout (possibly mixed case), while the session email is normalized to lowercase.
 */

function emailMatch(email: string): { $regex: string; $options: string } {
  const escaped = email.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { $regex: `^${escaped}$`, $options: "i" };
}

/** Store orders belonging to the signed-in user, newest first. */
export async function getMyOrders(sessionEmail: string): Promise<IOrder[]> {
  await connectMongo();
  return Order.find({ "customer.email": emailMatch(sessionEmail) })
    .sort({ createdAt: -1 })
    .lean<IOrder[]>();
}

/** A single order by number, ONLY if it belongs to the signed-in user (else null). */
export async function getMyOrderByNumber(
  sessionEmail: string,
  orderNumber: string
): Promise<IOrder | null> {
  await connectMongo();
  return Order.findOne({
    orderNumber,
    "customer.email": emailMatch(sessionEmail),
  }).lean<IOrder | null>();
}

/** Event/class bookings belonging to the signed-in user, newest first. */
export async function getMyBookings(sessionEmail: string): Promise<ICustomer[]> {
  await connectMongo();
  return Customer.find({ "billingInfo.emailAddress": emailMatch(sessionEmail) })
    .sort({ createdAt: -1 })
    .lean<ICustomer[]>();
}
