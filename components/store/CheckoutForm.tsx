"use client";

import type { ReactElement } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/CartProvider";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import { Button } from "@/components/ui";
import ShippingAddressStep, {
  type AddressFormValues,
} from "@/components/store/ShippingAddressStep";
import PaymentStep from "@/components/store/PaymentStep";
import CartSummary from "@/components/store/CartSummary";
import { formatCents } from "@/lib/utils/moneyHelpers";
import { computeTaxCents, taxLabel as getTaxLabel } from "@/lib/utils/taxHelpers";
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
  const [showAllRates, setShowAllRates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orderCompleted = useRef(false);

  const taxCents = address.state && selectedRate
    ? computeTaxCents(subtotalCents, address.state)
    : 0;
  const taxStateLabel = address.state ? getTaxLabel(address.state) : "";

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

  const handlePayment = async (token: string): Promise<void> => {
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }
      orderCompleted.current = true;
      clearCart();
      router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
    } catch {
      setError("Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  // Auto-fetch rates when all required address fields are complete (600ms debounce)
  useEffect(() => {
    const addressComplete =
      address.firstName.trim() &&
      address.lastName.trim() &&
      address.email.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.zip.trim();

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
    if (items.length === 0 && !orderCompleted.current) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0 && !orderCompleted.current) return null;

  const visibleRates = showAllRates ? rates : rates.slice(0, 3);
  const hiddenCount = rates.length - 3;

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
            error={rates.length === 0 ? error : null}
          />
        </div>

        {/* Shipping Method — auto-reveals once rates load */}
        {(isLoading || rates.length > 0) && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[var(--color-primary)] text-center">
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

            {/* Rate cards */}
            {!isLoading && rates.length > 0 && (
              <>
                <div className="flex flex-col gap-3">
                  {visibleRates.map((rate, idx) => {
                    const isSelected = selectedRate?.rateId === rate.rateId;
                    return (
                      <button
                        key={rate.rateId}
                        onClick={() => {
                          setSelectedRate(rate);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-[var(--radius-lg)] border-2 transition-colors ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-light)]"
                            : "border-[var(--color-border-lighter)] hover:border-[var(--color-secondary)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col gap-0.5 items-center flex-1">
                            <p className="font-semibold text-[var(--color-text-primary)] text-sm">
                              {rate.serviceName}
                            </p>
                            {rate.estimatedDays != null && (
                              <p className="text-xs text-[var(--color-text-subtle)]">
                                Est. {rate.estimatedDays} business day{rate.estimatedDays !== 1 ? "s" : ""}
                              </p>
                            )}
                            {idx === 0 && (
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5">
                                ★ Recommended
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-[var(--color-primary)] shrink-0">
                            {formatCents(rate.rateCents)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!showAllRates && hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllRates(true)}
                    className="text-sm text-[var(--color-secondary)] hover:underline self-center"
                  >
                    See {hiddenCount} more option{hiddenCount !== 1 ? "s" : ""}
                  </button>
                )}

                {error && (
                  <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                    {error}
                  </p>
                )}

              </>
            )}
          </div>
        )}

        {/* Payment — auto-reveals when rate is selected */}
        {selectedRate && paymentConfig && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[var(--color-primary)] text-center">
              Payment
            </h2>
            <PaymentStep
              applicationId={paymentConfig.applicationId}
              locationId={paymentConfig.locationId}
              subtotalCents={subtotalCents}
              taxCents={taxCents}
              taxStateLabel={taxStateLabel}
              selectedRate={selectedRate}
              onToken={handlePayment}
              isProcessing={isProcessing}
              error={error}
            />
          </div>
        )}
      </div>

      {/* Right column: sticky cart summary */}
      <CartSummary
        items={items}
        subtotalCents={subtotalCents}
        selectedRate={selectedRate}
        shippingState={address.state}
      />
    </div>
  );
}
