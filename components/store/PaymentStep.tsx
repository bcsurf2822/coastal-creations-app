"use client";

import type { ReactElement } from "react";
import React, { Suspense } from "react";
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
  selectedRate: ShippingRate;
  onToken: (token: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export default function PaymentStep({
  applicationId,
  locationId,
  subtotalCents,
  selectedRate,
  onToken,
  isProcessing,
  error,
}: PaymentStepProps): ReactElement {
  const totalCents = subtotalCents + selectedRate.rateCents;
  const totalDollars = (totalCents / 100).toFixed(2);

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
        <div className="bg-gray-50 rounded-[var(--radius-lg)] p-5 max-w-lg mx-auto">
          <Suspense fallback={<PaymentFormSkeleton />}>
            <DynamicPaymentForm
              applicationId={applicationId}
              locationId={locationId}
              createPaymentRequest={() => ({
                countryCode: "US",
                currencyCode: "USD",
                total: { amount: totalDollars, label: "Total" },
              })}
              cardTokenizeResponseReceived={async (token) => {
                if (token.status === "OK" && token.token) {
                  await onToken(token.token);
                }
              }}
            >
              <DynamicCreditCard />
            </DynamicPaymentForm>
          </Suspense>
        </div>
      )}

      {/* Trust block */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-lighter)] bg-[var(--color-light)] px-4 py-4 flex flex-col gap-2.5 text-xs text-[var(--color-text-subtle)] max-w-lg mx-auto w-full items-center text-center">
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
