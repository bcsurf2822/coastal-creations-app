"use client";

import React, { useState, ReactElement, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { PiSquareLogoFill } from "react-icons/pi";

// Dynamically import Square payment components with SSR disabled
const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
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
      <div className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
    ),
  }
);

interface PaymentConfig {
  applicationId: string;
  locationId: string;
}

const PRESET_AMOUNTS = [2000, 3500, 5000, 10000]; // In cents: $20, $35, $50, $100

interface BillingDetails {
  givenName: string;
  familyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  email: string;
  phoneNumber: string;
}

export function GiftCardPurchase(): ReactElement {
  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details"
  );
  const [amount, setAmount] = useState<number>(5000);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [purchasedGan, setPurchasedGan] = useState("");
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    givenName: "",
    familyName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: "US",
    email: "",
    phoneNumber: "",
  });

  // Handle billing input changes
  const handleBillingInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if billing form is valid
  const isBillingFormValid = (): boolean => {
    const isContactProvided =
      billingDetails.email.trim() !== "" ||
      billingDetails.phoneNumber.trim() !== "";

    return (
      billingDetails.givenName.trim() !== "" &&
      billingDetails.familyName.trim() !== "" &&
      billingDetails.addressLine1.trim() !== "" &&
      billingDetails.city.trim() !== "" &&
      billingDetails.state.trim() !== "" &&
      billingDetails.postalCode.trim() !== "" &&
      isContactProvided
    );
  };

  // Fetch payment config when moving to payment step
  const handleProceedToPayment = async (): Promise<void> => {
    setError("");

    // Validate fields
    if (!recipientEmail || !recipientName || !senderName) {
      setError("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError("Please enter a valid recipient email address");
      return;
    }

    if (purchaserEmail && !emailRegex.test(purchaserEmail)) {
      setError("Please enter a valid purchaser email address");
      return;
    }

    if (!PRESET_AMOUNTS.includes(amount)) {
      setError("Please select a valid gift card amount");
      return;
    }

    // Fetch payment config
    try {
      const response = await fetch("/api/payment-config");
      const data = await response.json();
      setConfig({
        applicationId: data.applicationId,
        locationId: data.locationId,
      });
      setStep("payment");
    } catch {
      setError("Failed to load payment system. Please try again.");
    }
  };

  const handlePayment = async (token: string): Promise<void> => {
    setIsProcessing(true);
    setError("");

    try {
      // Single API call handles: order creation, payment, gift card creation, activation, and email
      const giftCardResponse = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: token,
          amountCents: amount,
          recipientEmail,
          recipientName,
          senderName,
          personalMessage: personalMessage || undefined,
          purchaserEmail: purchaserEmail || recipientEmail,
        }),
      });

      const giftCardData = await giftCardResponse.json();

      if (!giftCardResponse.ok) {
        throw new Error(
          giftCardData.error ||
            giftCardData.message ||
            "Failed to create gift card"
        );
      }

      setPurchasedGan(giftCardData.gan);
      setStep("success");
    } catch (err) {
      console.error("[GIFT-CARD-PURCHASE] Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3 font-serif">
          Gift Card Sent!
        </h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          A{" "}
          <strong className="text-gray-900">
            ${(amount / 100).toFixed(2)}
          </strong>{" "}
          gift card has been sent to{" "}
          <strong className="text-gray-900">{recipientName}</strong> at{" "}
          {recipientEmail}.
        </p>
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-medium">
            Gift Card Number
          </p>
          <p className="font-mono text-xl font-bold text-gray-800 tracking-wider">
            {purchasedGan}
          </p>
        </div>
        <button
          onClick={() => {
            setStep("details");
            setRecipientEmail("");
            setRecipientName("");
            setSenderName("");
            setPurchaserEmail("");
            setPersonalMessage("");
            setAmount(5000);
          }}
          className="text-primary hover:text-primary-dark font-medium hover:underline transition-colors block w-full py-2"
        >
          Purchase Another Gift Card
        </button>
      </div>
    );
  }

  if (step === "payment" && config) {
    const formValid = isBillingFormValid();

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-100">
          <button
            onClick={() => setStep("details")}
            className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Details
          </button>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            Complete Your Purchase
          </h2>
          <p className="text-gray-600 mt-1">
            Gift Card for{" "}
            <strong className="text-gray-900">{recipientName}</strong>
          </p>
        </div>

        <div className="p-6 md:p-8">
          {/* Error Alert */}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError("")}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="fill-current h-6 w-6 text-red-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gift Card Amount</span>
                <span className="font-medium">
                  ${(amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient</span>
                <span className="font-medium">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Send to</span>
                <span className="font-medium text-gray-500 truncate max-w-[200px]">
                  {recipientEmail}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-primary">
                    ${(amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Billing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="givenName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="givenName"
                  name="givenName"
                  value={billingDetails.givenName}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="familyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="familyName"
                  name="familyName"
                  value={billingDetails.familyName}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine1"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={billingDetails.addressLine1}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={billingDetails.addressLine2}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={billingDetails.city}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={billingDetails.state}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={billingDetails.postalCode}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={billingDetails.email}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={billingDetails.phoneNumber}
                  onChange={handleBillingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 italic">
                  * Either Email Address or Phone Number is required for contact
                  purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              Payment Details
            </h3>

            <div className="p-6 bg-gray-50 rounded-lg">
              {!formValid && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>
                      Please complete all required billing fields above before
                      proceeding with payment. You must provide either an email
                      address or phone number.
                    </p>
                  </div>
                </div>
              )}

              <DynamicPaymentForm
                applicationId={config.applicationId}
                locationId={config.locationId}
                createPaymentRequest={() => ({
                  countryCode: "US",
                  currencyCode: "USD",
                  total: {
                    amount: (amount / 100).toFixed(2),
                    label: "Gift Card",
                  },
                })}
                cardTokenizeResponseReceived={async (token) => {
                  if (!formValid) {
                    setError(
                      "Please fill in all required billing fields before submitting payment."
                    );
                    return;
                  }
                  if (token.status === "OK" && token.token) {
                    await handlePayment(token.token);
                  } else {
                    setError("Failed to process card. Please try again.");
                  }
                }}
              >
                <div className="max-w-md mx-auto">
                  <DynamicCreditCard />
                  {!formValid && (
                    <div className="mt-4 text-red-600 text-center text-sm font-medium">
                      Please complete all required fields above before
                      submitting payment
                    </div>
                  )}
                </div>
              </DynamicPaymentForm>
            </div>
          </div>

          {/* Square Secure Badge */}
          <div className="text-sm text-gray-500 text-center mt-4">
            <p className="flex items-center justify-center gap-1">
              Secure payment processing by{" "}
              <PiSquareLogoFill className="text-xl" /> Square
            </p>
          </div>

          {isProcessing && (
            <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <span className="font-medium text-gray-700 animate-pulse">
                  Processing secure payment...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-primary/5 p-8 text-center border-b border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 font-serif">
          Purchase Gift Card
        </h2>
        <p className="text-gray-600 mt-2">
          Choose an amount and recipient to get started
        </p>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-sm">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Amount Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Select Amount
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESET_AMOUNTS.map((presetAmount) => (
              <button
                key={presetAmount}
                type="button"
                onClick={() => setAmount(presetAmount)}
                className={`py-4 px-2 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                  amount === presetAmount
                    ? "border-primary bg-primary text-white shadow-lg scale-105"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-primary/30 hover:bg-white hover:shadow-md"
                }`}
              >
                <span
                  className={`text-xl font-bold ${amount === presetAmount ? "text-white" : "text-gray-800"}`}
                >
                  ${presetAmount / 100}
                </span>
                {amount === presetAmount && (
                  <div className="mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Recipient Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this gift for?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Where should we send the gift card?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sender Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Your Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Who is this gift from?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Email (for receipt)
              </label>
              <input
                type="email"
                value={purchaserEmail}
                onChange={(e) => setPurchaserEmail(e.target.value)}
                placeholder="Optional - for your purchase confirmation"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Personal Message */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Personal Message (optional)
          </label>
          <div className="relative">
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add a personal note to your gift..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all outline-none"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white/80 px-2 py-0.5 rounded-md">
              {personalMessage.length}/500
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
          <div className="mb-2 md:mb-0">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              Total Amount
            </p>
            <p className="text-gray-400 text-xs">Secure payment processing</p>
          </div>
          <div className="text-3xl font-bold text-primary font-serif">
            ${(amount / 100).toFixed(2)}
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md cursor-pointer"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

export default GiftCardPurchase;
