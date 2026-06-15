"use client";

import type { ReactElement } from "react";
import React from "react";
import dynamic from "next/dynamic";
import { PiSquareLogoFill } from "react-icons/pi";
import { Button } from "@/components/ui";
import { formatCents } from "@/lib/utils/moneyHelpers";
import type { ShippingRate } from "@/lib/shippo/rates";

const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  { ssr: false, loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" /> }
);

const DynamicCreditCard = dynamic(
  async () => {
    const { CreditCard } = await import("react-square-web-payments-sdk");
    return CreditCard;
  },
  { ssr: false, loading: () => <div className="animate-pulse h-16 bg-gray-200 rounded-lg" /> }
);

interface PaymentStepProps {
  applicationId: string;
  locationId: string;
  subtotalCents: number;
  taxCents: number;
  taxStateLabel: string;
  selectedRate: ShippingRate;
  onToken: (token: string) => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
  error: string | null;
}

export default function PaymentStep({
  applicationId,
  locationId,
  subtotalCents,
  taxCents,
  taxStateLabel,
  selectedRate,
  onToken,
  onBack,
  isProcessing,
  error,
}: PaymentStepProps): ReactElement {
  const totalCents = subtotalCents + selectedRate.rateCents + taxCents;
  const totalDollars = (totalCents / 100).toFixed(2);

  return (
    <div className="flex flex-col gap-5">
      {/* Order total summary */}
      <div className="bg-[var(--color-light)] rounded-[var(--radius-lg)] p-4 text-sm">
        <div className="flex justify-between text-[var(--color-text-primary)] mb-1">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-[var(--color-text-primary)] mb-1">
          <span>{selectedRate.serviceName}</span>
          <span>{formatCents(selectedRate.rateCents)}</span>
        </div>
        <div className="flex justify-between text-[var(--color-text-primary)] mb-2">
          <span>Sales Tax{taxStateLabel ? ` (${taxStateLabel})` : ""}</span>
          <span>{formatCents(taxCents)}</span>
        </div>
        <div className="border-t border-[var(--color-border-lighter)] pt-2 flex justify-between font-bold text-[var(--color-primary)]">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>
      </div>

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
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onBack} disabled={isProcessing}>
          ← Back
        </Button>
      </div>

      <p className="text-xs text-center text-[var(--color-text-subtle)] flex items-center justify-center gap-1">
        Secure payment by <PiSquareLogoFill className="text-base" /> Square
      </p>
    </div>
  );
}
