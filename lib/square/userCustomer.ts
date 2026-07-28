import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongoose";
import { squareCustomerService } from "@/lib/square/customers";
import type { SessionUser } from "@/lib/auth/guards";

/**
 * Resolve the Square customer profile for an authenticated user — the anchor a
 * card on file must attach to. The link is stored as `squareCustomerId` on the
 * NextAuth `users` doc (adapter-managed, so accessed via the driver, not a model).
 * Store checkout also stamps it; this is the read/repair/create path for the
 * account console and saved-card payments.
 */

/** The Square customerId linked to a user, or null if none is stored. */
export async function getUserSquareCustomerId(
  userId: string
): Promise<string | null> {
  await connectMongo();
  const doc = await mongoose.connection
    .collection("users")
    .findOne({ _id: new mongoose.Types.ObjectId(userId) });
  return (doc?.squareCustomerId as string | undefined) ?? null;
}

/** Persist the link onto the user doc, only if it is not already set. */
async function linkSquareCustomerId(
  userId: string,
  customerId: string
): Promise<void> {
  await mongoose.connection.collection("users").updateOne(
    {
      _id: new mongoose.Types.ObjectId(userId),
      squareCustomerId: { $exists: false },
    },
    { $set: { squareCustomerId: customerId } }
  );
}

/**
 * Resolve a user's Square customerId. Order of resolution:
 *   1. The id already stored on their user doc.
 *   2. An email lookup in Square (back-fills the stored link for older accounts).
 *   3. (only when createIfMissing) create a customer from their account identity.
 * Returns null when none exists and creation was not requested.
 */
export async function resolveUserSquareCustomerId(
  user: SessionUser,
  opts: { createIfMissing?: boolean } = {}
): Promise<string | null> {
  const stored = await getUserSquareCustomerId(user.id);
  if (stored) return stored;

  const byEmail = await squareCustomerService.searchByEmail(user.email);
  if (byEmail) {
    await linkSquareCustomerId(user.id, byEmail.id);
    return byEmail.id;
  }

  if (!opts.createIfMissing) return null;

  const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/);
  const result = await squareCustomerService.findOrCreateCustomer({
    firstName: firstName || user.email.split("@")[0],
    lastName: rest.join(" "),
    email: user.email,
  });
  await linkSquareCustomerId(user.id, result.customerId);
  return result.customerId;
}
