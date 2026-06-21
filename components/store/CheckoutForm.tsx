"use client";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/CartProvider";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import ShippingAddressStep, {
  type AddressFormValues,
} from "@/components/store/ShippingAddressStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import GiftCardRedemption from "@/components/checkout/GiftCardRedemption";
import type { AppliedGiftCard } from "@/components/checkout/eventCheckoutTypes";
import CartSummary from "@/components/store/CartSummary";
import { Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type { ShippingRate } from "@/lib/shippo/rates";

const EMPTY_ADDRESS: AddressFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
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

  const [address, setAddress] = useState<AddressFormValues>(EMPTY_ADDRESS);
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

  // Order total (subtotal + shipping once known) and the card amount due after any
  // applied gift card. The server re-validates + clamps; this only drives the UI.
  const orderTotalCents = subtotalCents + (selectedRate?.rateCents ?? 0);
  const giftCardCents = appliedGiftCard
    ? Math.min(appliedGiftCard.amountApplied, orderTotalCents)
    : 0;
  const amountDueCents = Math.max(0, orderTotalCents - giftCardCents);

  const updateField = (field: keyof AddressFormValues, value: string): void => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (rates.length > 0) {
      setRates([]);
      setSelectedRate(null);
    }
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
            name: `${address.firstName} ${address.lastName}`,
            street1: address.addressLine1,
            street2: address.addressLine2 || undefined,
            city: address.city,
            state: address.state,
            zip: address.zip,
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
        setError(data.error ?? "Could not fetch shipping rates. Please check your address.");
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
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: address.phone || undefined,
          },
          shippingAddress: {
            name: `${address.firstName} ${address.lastName}`,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || undefined,
            city: address.city,
            stateProvince: address.state,
            postalCode: address.zip,
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

  // All required contact/shipping fields filled — gates rate-fetching AND payment.
  const addressComplete = Boolean(
    address.firstName.trim() &&
      address.lastName.trim() &&
      address.email.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.zip.trim()
  );

  // Auto-fetch rates when all required address fields are complete (600ms debounce)
  useEffect(() => {
    if (!addressComplete || rates.length > 0) return;

    const timer = setTimeout(() => {
      void handleFetchRates();
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address.firstName, address.lastName, address.email,
    address.addressLine1, address.city, address.state, address.zip,
  ]);

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.replace("/cart");
    }
  }, [items.length, orderCompleted, router]);

  if (items.length === 0 && !orderCompleted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

      {/* Left column: form */}
      <div className="flex flex-col gap-8">

        {/* Contact & Shipping */}
        <div className="flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">
            Contact &amp; Shipping
          </h2>
          <ShippingAddressStep
            values={address}
            onChange={updateField}
            isLoading={isLoading}
            error={null}
          />
        </div>

        <hr className="border-0 border-t border-[var(--color-border-lighter)]" />

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
                ? "We couldn't load shipping options — please check your address above."
                : "Enter your address above to see shipping options."}
            </div>
          )}
        </div>

        <hr className="border-0 border-t border-[var(--color-border-lighter)]" />

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
          {/* Gift card — apply once shipping is known so the total is final. */}
          {selectedRate && (
            <GiftCardRedemption
              totalAmount={orderTotalCents}
              appliedCard={appliedGiftCard}
              onApply={setAppliedGiftCard}
              onRemove={() => setAppliedGiftCard(null)}
            />
          )}

          {amountDueCents <= 0 && appliedGiftCard && selectedRate ? (
            <>
              {error && (
                <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                disabled={isProcessing}
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
              ready={addressComplete && !!selectedRate}
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
      <CartSummary
        items={items}
        subtotalCents={subtotalCents}
        selectedRate={selectedRate}
        giftCardCents={giftCardCents}
      />
    </div>
  );
}
