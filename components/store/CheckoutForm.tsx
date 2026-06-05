"use client";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/CartProvider";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import ShippingAddressStep, {
  type AddressFormValues,
} from "@/components/store/ShippingAddressStep";
import ShippingRateStep from "@/components/store/ShippingRateStep";
import PaymentStep from "@/components/store/PaymentStep";
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

const STEP_LABELS = ["Contact & Shipping", "Shipping Method", "Payment"];

export default function CheckoutForm(): ReactElement {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();
  const { data: paymentConfig } = usePaymentConfig();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<AddressFormValues>(EMPTY_ADDRESS);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof AddressFormValues, value: string): void => {
    setAddress((prev) => ({ ...prev, [field]: value }));
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
      setStep(2);
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
      clearCart();
      router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
    } catch {
      setError("Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : isDone
                    ? "bg-[var(--color-secondary)] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? "✓" : num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-subtle)]"
                }`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 1 && (
        <ShippingAddressStep
          values={address}
          onChange={updateField}
          onNext={handleFetchRates}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === 2 && (
        <ShippingRateStep
          rates={rates}
          selectedRate={selectedRate}
          onSelect={setSelectedRate}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && selectedRate && paymentConfig && (
        <PaymentStep
          applicationId={paymentConfig.applicationId}
          locationId={paymentConfig.locationId}
          subtotalCents={subtotalCents}
          selectedRate={selectedRate}
          onToken={handlePayment}
          onBack={() => setStep(2)}
          isProcessing={isProcessing}
          error={error}
        />
      )}
    </div>
  );
}
