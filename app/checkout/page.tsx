import type { Metadata } from "next";
import type { ReactElement } from "react";
import CheckoutForm from "@/components/store/CheckoutForm";
import type { ContactValues } from "@/components/store/ContactFields";
import type { AddressFormValues } from "@/components/store/ShippingAddressStep";
import { getSessionUser } from "@/lib/auth/guards";
import { getLatestOrderForPrefill } from "@/lib/account/queries";
import { squareCustomerService } from "@/lib/square/customers";

export const metadata: Metadata = {
  title: "Checkout | Coastal Creations Studio",
  description: "Complete your purchase.",
};

/**
 * Resolve prefill values for a signed-in customer. Prefer their most recent order
 * (richest source: name, phone, full shipping address); fall back to their Square
 * customer profile. Guests (no session) get nothing → the form starts empty.
 * Phone is prefilled only from a prior order (already a valid, user-typed value);
 * the Square profile stores phone as E.164, which the form's validation rejects.
 */
async function resolvePrefill(): Promise<{
  contact?: Partial<ContactValues>;
  shipping?: Partial<AddressFormValues>;
}> {
  const user = await getSessionUser();
  if (!user) return {};

  const lastOrder = await getLatestOrderForPrefill(user.email, user.id);
  if (lastOrder) {
    return {
      contact: {
        firstName: lastOrder.customer.firstName,
        lastName: lastOrder.customer.lastName,
        email: lastOrder.customer.email,
        phone: lastOrder.customer.phone ?? "",
      },
      shipping: {
        addressLine1: lastOrder.shippingAddress.addressLine1,
        addressLine2: lastOrder.shippingAddress.addressLine2 ?? "",
        city: lastOrder.shippingAddress.city,
        state: lastOrder.shippingAddress.stateProvince,
        zip: lastOrder.shippingAddress.postalCode,
      },
    };
  }

  const sq = await squareCustomerService.searchByEmail(user.email);
  if (sq) {
    return {
      contact: {
        firstName: sq.givenName ?? "",
        lastName: sq.familyName ?? "",
        email: sq.emailAddress ?? user.email,
      },
      shipping: sq.address
        ? {
            addressLine1: sq.address.addressLine1 ?? "",
            addressLine2: sq.address.addressLine2 ?? "",
            city: sq.address.locality ?? "",
            state: sq.address.administrativeDistrictLevel1 ?? "",
            zip: sq.address.postalCode ?? "",
          }
        : undefined,
    };
  }

  // Signed in but no order/profile yet — at least seed their account email.
  return { contact: { email: user.email } };
}

export default async function CheckoutPage(): Promise<ReactElement> {
  const { contact, shipping } = await resolvePrefill();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-12 pb-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">
          Checkout
        </h1>
        <CheckoutForm initialContact={contact} initialShipping={shipping} />
      </div>
    </div>
  );
}
