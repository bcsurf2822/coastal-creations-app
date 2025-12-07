"use client";

import dynamic from "next/dynamic";
import React, { ReactElement, useState, useEffect, useMemo } from "react";
import { PiSquareLogoFill } from "react-icons/pi";
import WalletPayButtons from "./WalletPayButtons";

// Dynamic imports with SSR disabled - CRITICAL for Square SDK
const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />
    ),
  }
);

const DynamicCreditCard = dynamic(
  async () => {
    const { CreditCard } = await import("react-square-web-payments-sdk");
    return CreditCard;
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-16 bg-gray-200 rounded-lg" />
    ),
  }
);

export interface TokenResult {
  token?: string;
  status?: string;
  details?: {
    method?: string;
    brand?: string;
    last4?: string;
  };
}

export interface PaymentFormConfig {
  applicationId: string;
  locationId: string;
}

export interface SquarePaymentFormProps {
  config: PaymentFormConfig;
  totalPrice: string;
  onTokenReceived: (token: TokenResult) => Promise<void>;
  formValid?: boolean;
  validationMessage?: string;
  eventId?: string;
  showWalletButtons?: boolean;
}

/**
 * Apple Pay Logo SVG Component
 */
function ApplePayLogo(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 165.52 105.97"
      className="h-6 w-auto"
    >
      <path
        d="M150.7 0H14.82A35.54 35.54 0 000 2.75v100.47a35.54 35.54 0 0014.82 2.75H150.7a35.54 35.54 0 0014.82-2.75V2.75A35.54 35.54 0 00150.7 0z"
        fill="#000"
      />
      <path
        d="M43.07 35.61a7.84 7.84 0 01-1.8 5.55 6.61 6.61 0 01-5.15 2.37 7 7 0 01-2.25-4.34 7.44 7.44 0 011.8-5.7 6.92 6.92 0 015.13-2.37 7.37 7.37 0 012.27 4.49zm2.25 7.62v17.14h-4.49V43.23zm23.65 12.84a9.24 9.24 0 01-3.38 7.14 8.5 8.5 0 01-5.63 1.96 8.1 8.1 0 01-7.14-3.83v11.47h-4.49V43.1h4.34v3.68a8.38 8.38 0 017.29-4 8.25 8.25 0 015.63 2.1 9.5 9.5 0 013.38 7.19zm-4.64.15a5.78 5.78 0 00-1.65-4.19 5.35 5.35 0 00-3.98-1.73 5.5 5.5 0 00-4.04 1.73 6.24 6.24 0 000 8.38 5.5 5.5 0 004.04 1.73 5.35 5.35 0 003.98-1.73 5.78 5.78 0 001.65-4.19zm22.07 0a5.78 5.78 0 00-1.65-4.19 5.35 5.35 0 00-3.98-1.73 5.5 5.5 0 00-4.04 1.73 6.24 6.24 0 000 8.38 5.5 5.5 0 004.04 1.73 5.35 5.35 0 003.98-1.73 5.78 5.78 0 001.65-4.19zm4.64-.15a9.24 9.24 0 01-3.38 7.14 8.5 8.5 0 01-5.63 1.96 8.1 8.1 0 01-7.14-3.83v11.47h-4.49V43.1h4.34v3.68a8.38 8.38 0 017.29-4 8.25 8.25 0 015.63 2.1 9.5 9.5 0 013.38 7.19zm7.79-13v17.3h-4.49v-17.3zm22.89 17.3h-4.49v-3.38a7.33 7.33 0 01-6.29 3.68c-5.18 0-8.38-3.68-8.38-9.46V43.1h4.49v11.02c0 3.83 1.73 5.93 4.79 5.93a4.87 4.87 0 004.04-2.1 5.93 5.93 0 001.35-4.04V43.1h4.49z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Google Pay Logo SVG Component
 */
function GooglePayLogo(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 435.97 173.13"
      className="h-5 w-auto"
    >
      <path
        d="M206.2 84.58v50.75h-16.1V10h42.7a38.61 38.61 0 0127.65 10.85A34.88 34.88 0 01272 47.3a34.28 34.28 0 01-11.55 26.6 39.06 39.06 0 01-27.65 10.68h-26.6zm0-59.15v43.75h27a21.28 21.28 0 0015.93-6.48 21.36 21.36 0 000-30.45 21 21 0 00-15.75-6.82h-27.18z"
        fill="#5f6368"
      />
      <path
        d="M309.1 46.78c11.9 0 21.17 3.15 27.83 9.45s10 14.88 10 25.73v52h-15.4v-11.73h-.7c-6.56 9.62-15.23 14.43-26.08 14.43-9.27 0-17.07-2.73-23.28-8.23s-9.27-12.42-9.27-20.82c0-8.75 3.32-15.75 10-21s15.57-7.87 26.78-7.87c9.62 0 17.5 1.75 23.62 5.25v-3.67c0-5.6-2.27-10.33-6.82-14.18a22.92 22.92 0 00-15.58-5.77c-9.1 0-16.27 3.85-21.52 11.55l-14.18-8.93c7.88-11.37 19.6-17.06 35.18-17.06zm-20.65 62.83a14.74 14.74 0 005.95 11.9 21.7 21.7 0 0013.83 4.73 27.07 27.07 0 0019.07-7.88c5.6-5.25 8.4-11.38 8.4-18.38-4.9-4-11.73-6-20.48-6-6.38 0-11.72 1.58-16.1 4.73s-6.56 7-6.56 11.55z"
        fill="#5f6368"
      />
      <path
        d="M436 49.53l-53.55 123.2h-16.62l19.95-43.23-35.35-79.97h17.5l25.55 61.6h.35l24.85-61.6z"
        fill="#5f6368"
      />
      <path
        d="M141.14 73.64a85.79 85.79 0 00-1.24-14.64H72v27.73h38.89a33.33 33.33 0 01-14.38 21.88v18h23.21c13.59-12.53 21.42-31.06 21.42-52.97z"
        fill="#4285f4"
      />
      <path
        d="M72 144c19.43 0 35.79-6.38 47.72-17.39l-23.21-18c-6.47 4.38-14.78 6.88-24.51 6.88-18.78 0-34.72-12.66-40.42-29.72H7.67v18.55A72 72 0 0072 144z"
        fill="#34a853"
      />
      <path
        d="M31.58 85.77a43.14 43.14 0 010-27.54V39.68H7.67a72 72 0 000 64.64z"
        fill="#fbbc04"
      />
      <path
        d="M72 28.5a39 39 0 0127.56 10.76l20.55-20.55A69.18 69.18 0 0072 0 72 72 0 007.67 39.68l23.91 18.55C37.28 41.16 53.22 28.5 72 28.5z"
        fill="#ea4335"
      />
    </svg>
  );
}

/**
 * Square Payment Form Component
 * Professional, unified payment interface with wallet support
 */
function SquarePaymentForm({
  config,
  totalPrice,
  onTokenReceived,
  formValid = true,
  validationMessage,
  eventId,
  showWalletButtons = true,
}: SquarePaymentFormProps): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  // Create unique form ID to prevent conflicts
  const formId = useMemo(
    () => `payment-form-${eventId || "default"}-${Date.now()}`,
    [eventId]
  );

  useEffect(() => {
    if (config.applicationId && config.locationId) {
      setIsLoaded(true);
    }
  }, [config]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleTokenReceived = async (token: TokenResult): Promise<void> => {
    if (token.token) {
      await onTokenReceived(token);
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="text-center">
          <div className="animate-pulse inline-block h-10 w-10 rounded-full bg-primary mb-4" />
          <p className="text-gray-600 font-medium">Loading secure payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              Secure Payment
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span className="text-xs">Powered by</span>
            <PiSquareLogoFill className="text-white text-xl" />
          </div>
        </div>
      </div>

      {/* Payment Form Body */}
      <div className="p-6">
        {/* Validation Warning */}
        {!formValid && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-amber-800 text-sm">
                {validationMessage ||
                  "Please complete all required fields before proceeding with payment."}
              </p>
            </div>
          </div>
        )}

        <DynamicPaymentForm
          key={formId}
          applicationId={config.applicationId}
          locationId={config.locationId}
          createPaymentRequest={() => ({
            countryCode: "US",
            currencyCode: "USD",
            total: {
              amount: totalPrice,
              label: "Total",
            },
          })}
          cardTokenizeResponseReceived={handleTokenReceived}
        >
          <div className="max-w-md mx-auto">
            {/* Wallet Buttons */}
            {showWalletButtons && baseUrl && (
              <WalletPayButtons
                redirectUrl={`${baseUrl}/payment/cashapp-callback`}
                referenceId={eventId}
              />
            )}

            {/* Credit Card Form */}
            <DynamicCreditCard
              key={`${formId}-card`}
              style={{
                input: {
                  fontSize: "16px",
                  fontFamily: "inherit",
                },
                "input::placeholder": {
                  color: "#9CA3AF",
                },
              }}
            />

            {/* Form Invalid Message */}
            {!formValid && (
              <div className="mt-4 text-center">
                <p className="text-red-600 text-sm font-medium">
                  Complete all required fields to enable payment
                </p>
              </div>
            )}
          </div>
        </DynamicPaymentForm>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col items-center gap-4">
            {/* Payment Method Logos */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                <ApplePayLogo />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                <GooglePayLogo />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <rect width="24" height="24" rx="4" fill="#00D632" />
                  <path
                    d="M7 12h10M12 7v10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-700">
                  Cash App
                </span>
              </div>
            </div>

            {/* Security Text */}
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SquarePaymentForm;
