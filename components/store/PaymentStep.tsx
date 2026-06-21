"use client";

import type { ReactElement } from "react";
import React, { Suspense, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PiSquareLogoFill } from "react-icons/pi";
import { FaLock } from "react-icons/fa";
import type { ShippingRate } from "@/lib/shippo/rates";

// Real colored brand logos (local SVG assets in /public/assets/cards).
const ACCEPTED_CARDS = [
  { src: "/assets/cards/visa.svg", alt: "Visa" },
  { src: "/assets/cards/mastercard.svg", alt: "Mastercard" },
  { src: "/assets/cards/amex.svg", alt: "American Express" },
  { src: "/assets/cards/discover.svg", alt: "Discover" },
];

const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  { ssr: false }
);

const DynamicCreditCard = dynamic(
  async () => {
    const { CreditCard } = await import("react-square-web-payments-sdk");
    return CreditCard;
  },
  { ssr: false }
);

const PaymentFormSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-3 py-2">
    <div className="animate-pulse bg-gray-100 rounded-lg h-14 w-full" />
    <div className="animate-pulse bg-gray-100 rounded-lg h-10 w-full" />
    <div className="animate-pulse bg-gray-100 rounded-lg h-10 w-2/3" />
  </div>
);

interface PaymentStepProps {
  applicationId: string;
  locationId: string;
  subtotalCents: number;
  /** Null until the customer has picked a shipping method. */
  selectedRate: ShippingRate | null;
  /** True once the address is complete AND a shipping rate is selected. */
  ready: boolean;
  onToken: (token: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export default function PaymentStep({
  applicationId,
  locationId,
  subtotalCents,
  selectedRate,
  ready,
  onToken,
  isProcessing,
  error,
}: PaymentStepProps): ReactElement {
  // Best-known total: subtotal now, + shipping once a rate is chosen. The real
  // charge is recomputed server-side; this only labels the button / wallet sheet.
  const totalCents = subtotalCents + (selectedRate?.rateCents ?? 0);
  const totalDollars = (totalCents / 100).toFixed(2);

  // The Square SDK re-initializes (re-injecting the card iframe → duplicate forms)
  // whenever createPaymentRequest / cardTokenizeResponseReceived change identity.
  // Keep them STABLE via refs that always read the latest values at call time.
  const readyRef = useRef(ready);
  const totalRef = useRef(totalDollars);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    readyRef.current = ready;
    totalRef.current = totalDollars;
    onTokenRef.current = onToken;
  });

  const createPaymentRequest = useCallback(
    () => ({
      countryCode: "US" as const,
      currencyCode: "USD" as const,
      total: { amount: totalRef.current, label: "Total" },
    }),
    []
  );

  const cardTokenizeResponseReceived = useCallback(
    async (token: { status: string; token?: string }) => {
      // Guard: never tokenize/charge before prerequisites are met.
      if (!readyRef.current) return;
      if (token.status === "OK" && token.token) {
        await onTokenRef.current(token.token);
      }
    },
    []
  );

  return (
    <div className="flex flex-col gap-5">

      {error && (
        <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
          {error}
        </p>
      )}

      {isProcessing ? (
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mb-3" />
          <p className="text-[var(--color-text-subtle)] text-sm">Processing your order…</p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[var(--radius-lg)] p-5">
          {/* The Square SDK mounts on page load. Until the customer has entered
              their contact/shipping details and chosen a method, the payment
              area is dimmed and non-interactive (and the Pay button stays
              disabled). Once ready, it activates and the button reads "Pay $X". */}
          <div
            className={
              ready
                ? ""
                : "opacity-50 pointer-events-none select-none"
            }
            aria-disabled={!ready}
          >
            <Suspense fallback={<PaymentFormSkeleton />}>
              <DynamicPaymentForm
                applicationId={applicationId}
                locationId={locationId}
                createPaymentRequest={createPaymentRequest}
                cardTokenizeResponseReceived={cardTokenizeResponseReceived}
              >
                <DynamicCreditCard
                  render={(Button) => (
                    <Button isLoading={isProcessing}>
                      {/* Only show an amount once shipping is known — never the
                          misleading pre-shipping subtotal. */}
                      {selectedRate ? `Pay $${totalDollars}` : "Pay"}
                    </Button>
                  )}
                />
              </DynamicPaymentForm>
            </Suspense>
          </div>
        </div>
      )}

      {/* Secure-checkout trust block: real accepted-card logos +
          "Secure checkout by Square". */}
      <div className="flex flex-col items-center gap-3 w-full pt-1">
        {/* Accepted card logos (real colored brand SVGs) */}
        <div className="flex items-center justify-center gap-2">
          {ACCEPTED_CARDS.map((card) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={card.alt}
              src={card.src}
              alt={card.alt}
              className="h-7 w-auto"
              loading="lazy"
            />
          ))}
        </div>

        {/* Secure checkout by Square */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-subtle)]">
          <FaLock className="shrink-0 text-green-600" />
          <span>Secure checkout by</span>
          <PiSquareLogoFill className="shrink-0 text-[var(--color-primary)] text-base" />
          <span className="text-[var(--color-primary)] font-semibold">Square</span>
        </div>
      </div>
    </div>
  );
}
