"use client";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/CartProvider";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import ShippingAddressStep, {
  type AddressFormValues,
} from "@/components/store/ShippingAddressStep";
import ContactFields, {
  type ContactValues,
} from "@/components/store/ContactFields";
import PaymentStep from "@/components/checkout/PaymentStep";
import GiftCardRedemption from "@/components/checkout/GiftCardRedemption";
import { isValidUsPhone } from "@/components/checkout/ContactForm";
import { isValidEmail } from "@/lib/utils/validation";
import type { AppliedGiftCard } from "@/components/checkout/eventCheckoutTypes";
import CartSummary from "@/components/store/CartSummary";
import { Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type { ShippingRate } from "@/lib/shippo/rates";

const EMPTY_CONTACT: ContactValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const EMPTY_SHIPPING: AddressFormValues = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
};

export default function CheckoutForm(): ReactElement | null {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();
  const { data: paymentConfig } = usePaymentConfig();

  // Buyer (payer + receipt) is always `contact`. The shipment goes to `shipping`.
  // When `isGift`, the buyer collects the recipient's name in the shipping block;
  // otherwise the shipment is addressed to the buyer.
  const [contact, setContact] = useState<ContactValues>(EMPTY_CONTACT);
  const [isGift, setIsGift] = useState(false);
  const [shipping, setShipping] = useState<AddressFormValues>(EMPTY_SHIPPING);

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);
  // One stable idempotency key per mount — reused across retries of THIS cart
  // attempt so a lost-response retry returns the original charge (no double
  // charge). A new mount (new cart attempt after clearCart) gets a fresh key.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // Recipient name: the buyer's when shipping to self, the entered name when gifting.
  const recipientFirstName = isGift ? shipping.firstName : contact.firstName;
  const recipientLastName = isGift ? shipping.lastName : contact.lastName;
  const recipientName = `${recipientFirstName} ${recipientLastName}`.trim();

  // Gift cards apply to the PRODUCT SUBTOTAL ONLY — never to shipping.
  const orderTotalCents = subtotalCents + (selectedRate?.rateCents ?? 0);
  const giftCardCents = appliedGiftCard
    ? Math.min(appliedGiftCard.amountApplied, subtotalCents)
    : 0;
  const amountDueCents = Math.max(0, orderTotalCents - giftCardCents);

  const resetRates = (): void => {
    if (rates.length > 0) {
      setRates([]);
      setSelectedRate(null);
    }
  };

  const updateContact = (field: keyof ContactValues, value: string): void => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const updateShipping = (field: keyof AddressFormValues, value: string): void => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    // Address (not name) changes invalidate the quoted rates.
    if (field !== "firstName" && field !== "lastName") resetRates();
  };

  const toggleGift = (next: boolean): void => {
    setIsGift(next);
    resetRates();
  };

  const handleFetchRates = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            name: recipientName,
            street1: shipping.addressLine1,
            street2: shipping.addressLine2 || undefined,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip,
            country: "US",
          },
          cartItems: items.map((i) => ({
            squareCatalogItemId: i.squareCatalogItemId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not fetch shipping rates. Please check the address.");
        return;
      }
      setRates(data.rates);
      setSelectedRate(data.rates[0] ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async (token?: string): Promise<void> => {
    if (!selectedRate) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentToken: token,
          customer: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone || undefined,
          },
          shippingAddress: {
            name: recipientName,
            addressLine1: shipping.addressLine1,
            addressLine2: shipping.addressLine2 || undefined,
            city: shipping.city,
            stateProvince: shipping.state,
            postalCode: shipping.zip,
            country: "US",
          },
          selectedRate,
          items,
          subtotalCents,
          idempotencyKey,
          giftCard: appliedGiftCard
            ? { giftCardId: appliedGiftCard.giftCardId, amountCents: giftCardCents }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }
      setOrderCompleted(true);
      clearCart();
      router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
    } catch {
      setError("Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  // Buyer contact must be valid to pay (and receive the receipt).
  const contactComplete = Boolean(
    contact.firstName.trim() &&
      contact.lastName.trim() &&
      isValidEmail(contact.email) &&
      isValidUsPhone(contact.phone)
  );

  // Destination address must be complete; gifting also requires a recipient name.
  const shippingComplete = Boolean(
    shipping.addressLine1.trim() &&
      shipping.city.trim() &&
      shipping.state.trim() &&
      shipping.zip.trim() &&
      (!isGift || (shipping.firstName.trim() && shipping.lastName.trim()))
  );

  const canPay = contactComplete && shippingComplete;

  // Auto-fetch rates as soon as the destination address is complete (600ms debounce).
  useEffect(() => {
    if (!shippingComplete || rates.length > 0) return;

    const timer = setTimeout(() => {
      void handleFetchRates();
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGift,
    shipping.addressLine1, shipping.city, shipping.state, shipping.zip,
    shipping.firstName, shipping.lastName,
  ]);

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.replace("/cart");
    }
  }, [items.length, orderCompleted, router]);

  if (items.length === 0 && !orderCompleted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

      {/* Left column: form (below the summary when stacked, left on desktop) */}
      <div className="order-2 lg:order-1 flex flex-col gap-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">

        {/* Contact (buyer) */}
        <div className="flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">
            Your contact details
          </h2>
          <ContactFields values={contact} onChange={updateContact} />
        </div>

        <hr className="border-0 border-t border-[var(--color-border)]" />

        {/* Shipping + gift toggle */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-[var(--color-primary)]">
              {isGift ? "Ship to recipient" : "Shipping address"}
            </h2>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => toggleGift(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
              />
              This is a gift — ship to a different address
            </label>
          </div>

          {isGift && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-light)] px-3 py-2 text-xs text-[var(--color-text-subtle)]">
              We&apos;ll ship to the recipient below. Your order confirmation and
              receipt come to you.
            </p>
          )}

          <ShippingAddressStep
            values={shipping}
            onChange={updateShipping}
            collectName={isGift}
            isLoading={isLoading}
            error={null}
          />
        </div>

        <hr className="border-0 border-t border-[var(--color-border)]" />

        {/* Shipping Method — always visible; fills in once the address is complete */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">
            Shipping Method
          </h2>

          {/* Skeleton placeholders while Shippo fetches */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-[var(--radius-lg)] h-16"
                />
              ))}
            </div>
          )}

          {/* Shipping method — a single dropdown, defaulting to the cheapest (recommended) */}
          {!isLoading && rates.length > 0 && selectedRate && (
            <div className="flex flex-col gap-1.5">
              {rates.length > 1 && (
                <label
                  htmlFor="shipping-rate"
                  className="text-xs text-[var(--color-text-subtle)]"
                >
                  Need it sooner? Choose a different option:
                </label>
              )}
              <select
                id="shipping-rate"
                aria-label="Shipping method"
                value={selectedRate.rateId}
                onChange={(e) => {
                  const next = rates.find((r) => r.rateId === e.target.value);
                  if (next) setSelectedRate(next);
                }}
                className="w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border-lighter)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-secondary)] outline-none cursor-pointer"
              >
                {rates.map((rate) => (
                  <option key={rate.rateId} value={rate.rateId}>
                    {rate.serviceName} — {formatCents(rate.rateCents)}
                    {rate.estimatedDays != null
                      ? ` (${rate.estimatedDays} day${rate.estimatedDays !== 1 ? "s" : ""})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Placeholder until a complete address unlocks live rates */}
          {!isLoading && rates.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-lighter)] px-4 py-6 text-center text-sm text-[var(--color-text-subtle)]">
              {error
                ? "We couldn't load shipping options — please check the address above."
                : "Enter the shipping address above to see shipping options."}
            </div>
          )}
        </div>

        <hr className="border-0 border-t border-[var(--color-border)]" />

        {/* Payment — the Square SDK mounts as soon as config loads (on page init);
            it stays disabled until contact/shipping details are complete. */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-primary)]">
              Payment
            </h2>
            <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
              All transactions are secure and encrypted.
            </p>
          </div>
          {/* Gift card — applies to the product subtotal only (never shipping), so it
              can be entered up front without waiting for a shipping method. */}
          <div className="flex flex-col gap-1">
            <GiftCardRedemption
              totalAmount={subtotalCents}
              appliedCard={appliedGiftCard}
              onApply={setAppliedGiftCard}
              onRemove={() => setAppliedGiftCard(null)}
            />
            <p className="text-xs text-[var(--color-text-subtle)]">
              Gift cards apply to items only — shipping is paid at checkout.
            </p>
          </div>

          {amountDueCents <= 0 && appliedGiftCard && selectedRate ? (
            <>
              {error && (
                <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                disabled={isProcessing || !canPay}
                onClick={() => void placeOrder()}
              >
                {isProcessing ? "Placing order…" : "Place order with gift card"}
              </Button>
            </>
          ) : paymentConfig ? (
            <PaymentStep
              applicationId={paymentConfig.applicationId}
              locationId={paymentConfig.locationId}
              amountDollars={selectedRate ? (amountDueCents / 100).toFixed(2) : null}
              ready={canPay && !!selectedRate}
              onToken={placeOrder}
              isProcessing={isProcessing}
              error={error}
            />
          ) : (
            <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-lighter)] px-4 py-6 text-center text-sm text-[var(--color-text-subtle)]">
              Loading secure payment…
            </div>
          )}
        </div>
      </div>

      {/* Right column: sticky cart summary */}
      {/* Summary first when stacked (on top), right column + sticky on desktop */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-6">
        <CartSummary
          items={items}
          subtotalCents={subtotalCents}
          selectedRate={selectedRate}
          giftCardCents={giftCardCents}
        />
      </div>
    </div>
  );
}
