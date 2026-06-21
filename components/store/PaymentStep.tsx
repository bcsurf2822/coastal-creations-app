"use client";

import type { ReactElement } from "react";
import React, { Suspense, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PiSquareLogoFill } from "react-icons/pi";
import { FaLock, FaShieldAlt } from "react-icons/fa";
import type { ShippingRate } from "@/lib/shippo/rates";

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
          {!ready && (
            <p className="text-center text-sm text-[var(--color-text-subtle)] mb-3">
              Enter your contact &amp; shipping details above to enable payment.
            </p>
          )}
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

      {/* Trust block */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-lighter)] bg-[var(--color-light)] px-4 py-4 flex flex-col gap-2.5 text-xs text-[var(--color-text-subtle)] w-full items-center text-center">
        <div className="flex items-center gap-2">
          <FaLock className="shrink-0 text-green-600" />
          <span>256-bit SSL encryption — your data is fully protected</span>
        </div>
        <div className="flex items-center gap-2">
          <PiSquareLogoFill className="shrink-0 text-[var(--color-primary)] text-base" />
          <span>Powered by Square — PCI DSS Level 1 Certified</span>
        </div>
        <div className="flex items-center gap-2">
          <FaShieldAlt className="shrink-0 text-[var(--color-secondary)]" />
          <span>We never store your card details</span>
        </div>
        <p className="pt-1 border-t border-[var(--color-border-lighter)]">
          Free returns within 30 days &middot;{" "}
          <Link href="/contact-us" className="underline hover:text-[var(--color-primary)]">
            Questions? Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
