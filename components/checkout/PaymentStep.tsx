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

/**
 * Buyer billing details for Strong Customer Authentication (SCA). All fields are
 * optional — Square verifies more successfully with more data, but we only ever
 * pass what we already collect (never a new billing-address form). The card iframe
 * still captures the postal code for AVS independently.
 */
export interface PaymentBillingContact {
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  addressLines?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
}

/**
 * Opt-in SCA config. When provided, the card is tokenized WITH verification
 * details (Square's recommended path — `tokenize()` handles 3DS automatically and
 * returns a verificationToken). Omit it to tokenize without verification.
 */
export interface PaymentVerification {
  intent: "CHARGE" | "STORE";
  billingContact: PaymentBillingContact;
}

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
  /**
   * Receives the card token, plus a verificationToken when `verification` is set
   * (forward it to payments.create / cards.create for SCA).
   */
  onToken: (token: string, verificationToken?: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  processingLabel?: string;
  /** Optional SCA verification (CHARGE for payments, STORE for saving a card). */
  verification?: PaymentVerification;
  /** Override the submit button label (e.g. "Save card"); defaults to Pay/$amount. */
  submitLabel?: string;
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
  verification,
  submitLabel,
}: PaymentStepProps): ReactElement {
  // The Square SDK re-initializes (re-injecting the card iframe → duplicate forms)
  // whenever createPaymentRequest / cardTokenizeResponseReceived change identity.
  // Keep them STABLE via refs that always read the latest values at call time.
  const readyRef = useRef(ready);
  const amountRef = useRef(amountDollars);
  const onTokenRef = useRef(onToken);
  const verificationRef = useRef(verification);
  useEffect(() => {
    readyRef.current = ready;
    amountRef.current = amountDollars;
    onTokenRef.current = onToken;
    verificationRef.current = verification;
  });

  const createPaymentRequest = useCallback(
    () => ({
      countryCode: "US" as const,
      currencyCode: "USD" as const,
      total: { amount: amountRef.current ?? "0", label: "Total" },
    }),
    []
  );

  // SCA verification details (stable identity). Built from the latest verification
  // config at call time; returns CHARGE (with amount) or STORE shape.
  const createVerificationDetails = useCallback(() => {
    const v = verificationRef.current;
    const billingContact = v?.billingContact ?? {};
    if (v?.intent === "STORE") {
      return { intent: "STORE" as const, billingContact };
    }
    return {
      intent: "CHARGE" as const,
      amount: amountRef.current ?? "0",
      currencyCode: "USD",
      billingContact,
    };
  }, []);

  const cardTokenizeResponseReceived = useCallback(
    async (
      token: { status: string; token?: string },
      verifiedBuyer?: { token: string } | null
    ) => {
      if (!readyRef.current) return; // never tokenize before prerequisites are met
      if (token.status === "OK" && token.token) {
        await onTokenRef.current(token.token, verifiedBuyer?.token);
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
                createVerificationDetails={
                  verification ? createVerificationDetails : undefined
                }
                cardTokenizeResponseReceived={cardTokenizeResponseReceived}
              >
                <DynamicCreditCard
                  render={(Button) => (
                    <Button isLoading={isProcessing}>
                      {submitLabel ??
                        (amountDollars ? `Pay $${amountDollars}` : "Pay")}
                    </Button>
                  )}
                />
              </DynamicPaymentForm>
            </Suspense>
          </div>
        </div>
      )}

      {/* Secure-checkout trust block: "Secure checkout by Square" on top, the
          accepted-card logos below it, spread to that line's width. */}
      <div className="flex justify-center w-full pt-1">
        <div className="inline-flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-subtle)]">
            <FaLock className="shrink-0 text-green-600" />
            <span>Secure checkout by</span>
            <PiSquareLogoFill className="shrink-0 text-[var(--color-primary)] text-base" />
            <span className="text-[var(--color-primary)] font-semibold">Square</span>
          </div>
          <div className="flex items-center justify-between w-full">
            {ACCEPTED_CARDS.map((card) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={card.alt}
                src={card.src}
                alt={card.alt}
                className="h-5 w-auto"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
