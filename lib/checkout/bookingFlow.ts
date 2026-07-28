/**
 * Shared checkout booking-flow helpers
 *
 * These wrap the steps that every successful checkout path repeats:
 * creating/finding the Square customer, sending the confirmation email,
 * and building the payment-success redirect URL. Extracted so the card,
 * gift-card-only, and free-registration flows share one implementation.
 */

export interface BillingContact {
  givenName: string;
  familyName: string;
  email?: string;
  phoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

/**
 * Create or find the Square customer for a booking.
 * Never throws - returns undefined on failure so checkout can continue
 * without a linked customer (matches prior inline behavior).
 */
export async function createOrFindSquareCustomer(
  billing: BillingContact
): Promise<string | undefined> {
  try {
    const response = await fetch("/api/square/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: billing.givenName,
        lastName: billing.familyName,
        email: billing.email || undefined,
        phone: billing.phoneNumber || undefined,
        address: {
          addressLine1: billing.addressLine1,
          addressLine2: billing.addressLine2,
          city: billing.city,
          state: billing.state,
          postalCode: billing.postalCode,
          country: billing.countryCode,
        },
      }),
    });

    if (response.ok) {
      const customerData = await response.json();
      const squareCustomerId: string | undefined = customerData.data?.customerId;
      console.log(
        "[BOOKING-FLOW-createOrFindSquareCustomer] Square customer:",
        squareCustomerId,
        customerData.data?.isNew ? "(new)" : "(existing)"
      );
      return squareCustomerId;
    }
  } catch (error) {
    console.error(
      "[BOOKING-FLOW-createOrFindSquareCustomer] Failed to create Square customer:",
      error
    );
  }
  return undefined;
}

/**
 * Send the booking confirmation email.
 * Never throws - email failure must not fail an already-completed booking.
 */
export async function sendBookingConfirmation(
  customerId: string,
  eventId: string
): Promise<void> {
  try {
    await fetch("/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, eventId }),
    });
  } catch (error) {
    console.error(
      "[BOOKING-FLOW-sendBookingConfirmation] Error sending confirmation email:",
      error
    );
  }
}

export interface SuccessRedirectParams {
  paymentId: string;
  status?: string;
  firstName: string;
  lastName: string;
  eventTitle?: string;
  eventId?: string;
  amount: string;
  currency?: string;
  paymentMethod?: string;
  numberOfPeople: number;
  totalPrice: string;
  email?: string;
  phone?: string;
  // Card-payment-only extras
  receiptUrl?: string;
  note?: string;
  last4?: string;
  cardBrand?: string;
}

/**
 * Build the /payment-success URL with all booking details as query params.
 * The success page reads params by key, so ordering is irrelevant. Optional
 * fields are only appended when provided, preserving each flow's param set.
 */
export function buildSuccessUrl(params: SuccessRedirectParams): string {
  const query = new URLSearchParams();
  query.set("paymentId", params.paymentId);
  query.set("status", params.status || "COMPLETED");
  query.set("firstName", params.firstName);
  query.set("lastName", params.lastName);
  query.set("eventTitle", params.eventTitle || "");
  query.set("eventId", params.eventId || "");
  query.set("amount", params.amount);
  query.set("currency", params.currency || "USD");

  if (params.paymentMethod) query.set("paymentMethod", params.paymentMethod);
  if (params.receiptUrl !== undefined) query.set("receiptUrl", params.receiptUrl);
  if (params.note !== undefined) query.set("note", params.note);
  if (params.last4 !== undefined) query.set("last4", params.last4);
  if (params.cardBrand !== undefined) query.set("cardBrand", params.cardBrand);
  if (params.email) query.set("email", params.email);
  if (params.phone) query.set("phone", params.phone);

  query.set("numberOfPeople", params.numberOfPeople.toString());
  query.set("totalPrice", params.totalPrice);

  return `/payment-success?${query.toString()}`;
}
