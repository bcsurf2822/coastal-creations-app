"use client";

import type { ReactElement } from "react";
import React, { Suspense, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PiSquareLogoFill } from "react-icons/pi";
import { FaLock } from "react-icons/fa";

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
  /**
   * Dollar amount string (e.g. "42.00") used to label the Pay button and the
   * wallet sheet. Null shows just "Pay" (e.g. before a total is known). The real
   * charge is always recomputed server-side; this only labels the UI.
   */
  amountDollars: string | null;
  /** Card form is dimmed + non-interactive until true (e.g. contact complete). */
  ready: boolean;
  onToken: (token: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  processingLabel?: string;
}

/**
 * Shared Square Web Payments card step — the clean store payment widget,
 * generalized for any flow (store, event/booking, gift card). The SDK mounts on
 * load and stays dimmed until `ready`. Only the card token + amount + idempotency
 * matter to Square; the card iframe collects the postal code for AVS, so no
 * billing-address fields are needed here.
 */
export default function PaymentStep({
  applicationId,
  locationId,
  amountDollars,
  ready,
  onToken,
  isProcessing,
  error,
  processingLabel = "Processing…",
}: PaymentStepProps): ReactElement {
  // The Square SDK re-initializes (re-injecting the card iframe → duplicate forms)
  // whenever createPaymentRequest / cardTokenizeResponseReceived change identity.
  // Keep them STABLE via refs that always read the latest values at call time.
  const readyRef = useRef(ready);
  const amountRef = useRef(amountDollars);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    readyRef.current = ready;
    amountRef.current = amountDollars;
    onTokenRef.current = onToken;
  });

  const createPaymentRequest = useCallback(
    () => ({
      countryCode: "US" as const,
      currencyCode: "USD" as const,
      total: { amount: amountRef.current ?? "0", label: "Total" },
    }),
    []
  );

  const cardTokenizeResponseReceived = useCallback(
    async (token: { status: string; token?: string }) => {
      if (!readyRef.current) return; // never tokenize before prerequisites are met
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
          <p className="text-[var(--color-text-subtle)] text-sm">{processingLabel}</p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[var(--radius-lg)] p-5">
          <div
            className={ready ? "" : "opacity-50 pointer-events-none select-none"}
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
                      {amountDollars ? `Pay $${amountDollars}` : "Pay"}
                    </Button>
                  )}
                />
              </DynamicPaymentForm>
            </Suspense>
          </div>
        </div>
      )}

      {/* Secure-checkout trust block: real accepted-card logos + "Secure checkout by Square". */}
      <div className="flex flex-col items-center gap-3 w-full pt-1">
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
