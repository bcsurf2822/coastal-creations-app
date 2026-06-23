"use client";

import { useEffect, useState, type ReactElement } from "react";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import PaymentStep from "@/components/checkout/PaymentStep";
import { formatCents } from "@/lib/utils/moneyHelpers";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
}

const PRESET_AMOUNTS = [2000, 3500, 5000, 10000]; // In cents: $20, $35, $50, $100
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GiftCardPurchase(): ReactElement {
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
  // One stable idempotency key per mount — reused across retries of THIS gift-card
  // purchase so a lost-response retry returns the original charge (no double charge).
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // Load the Square SDK config up front so the card form is ready on the single page.
  useEffect(() => {
    let active = true;
    fetch("/api/payment-config")
      .then((res) => res.json())
      .then((data) => {
        if (active)
          setConfig({
            applicationId: data.applicationId,
            locationId: data.locationId,
          });
      })
      .catch(() => {
        if (active) setError("Failed to load payment system. Please refresh.");
      });
    return () => {
      active = false;
    };
  }, []);

  // All required details present → the card form lights up (Square only tokenizes when ready).
  const formValid =
    PRESET_AMOUNTS.includes(amount) &&
    recipientName.trim() !== "" &&
    EMAIL_RE.test(recipientEmail) &&
    senderName.trim() !== "" &&
    (purchaserEmail.trim() === "" || EMAIL_RE.test(purchaserEmail));

  const handlePayment = async (token: string): Promise<void> => {
    setIsProcessing(true);
    setError("");

    try {
      // Single API call: order creation, payment, gift card creation, activation, and email.
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
          idempotencyKey,
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

  if (purchasedGan) {
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
          <strong className="text-gray-900">{formatCents(amount)}</strong> gift
          card has been sent to{" "}
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
            setPurchasedGan("");
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

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none";
  const sectionHeading = "text-base font-semibold text-[var(--color-primary)]";
  const divider = "border-0 border-t border-[var(--color-border)]";

  return (
    <div className="max-w-5xl mx-auto">
      <CheckoutLayout
        summary={
          <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border-lighter)] bg-white p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[var(--color-primary)]">
              Order summary
            </h2>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Gift card
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-subtle)]">Amount</span>
                <span className="text-[var(--color-text-primary)]">
                  {formatCents(amount)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--color-text-subtle)]">Recipient</span>
                <span className="text-[var(--color-text-primary)] truncate">
                  {recipientName || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--color-text-subtle)]">Send to</span>
                <span className="text-[var(--color-text-primary)] truncate max-w-[180px]">
                  {recipientEmail || "—"}
                </span>
              </div>
            </div>
            <hr className={divider} />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Total
              </span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {formatCents(amount)}
              </span>
            </div>
          </aside>
        }
      >
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col gap-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center shadow-sm">
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

            {/* Amount */}
            <section className="flex flex-col gap-4">
              <h2 className={sectionHeading}>Select amount</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount)}
                    className={`py-4 px-2 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                      amount === presetAmount
                        ? "border-primary bg-primary text-white shadow-lg"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/30 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`text-xl font-bold ${amount === presetAmount ? "text-white" : "text-gray-800"}`}
                    >
                      ${presetAmount / 100}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <hr className={divider} />

            {/* Recipient */}
            <section className="flex flex-col gap-4">
              <h2 className={sectionHeading}>Recipient information</h2>
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <hr className={divider} />

            {/* Sender */}
            <section className="flex flex-col gap-4">
              <h2 className={sectionHeading}>Your information</h2>
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <hr className={divider} />

            {/* Personal message */}
            <section className="flex flex-col gap-4">
              <h2 className={sectionHeading}>Personal message (optional)</h2>
              <div className="relative">
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal note to your gift..."
                  rows={4}
                  maxLength={500}
                  className={`${inputClass} resize-none`}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white/80 px-2 py-0.5 rounded-md">
                  {personalMessage.length}/500
                </div>
              </div>
            </section>

            <hr className={divider} />

            {/* Payment */}
            <section className="flex flex-col gap-3">
              <div>
                <h2 className={sectionHeading}>Payment</h2>
                <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
                  All transactions are secure and encrypted
                </p>
              </div>
              {config ? (
                <PaymentStep
                  applicationId={config.applicationId}
                  locationId={config.locationId}
                  amountDollars={(amount / 100).toFixed(2)}
                  ready={formValid && !isProcessing}
                  onToken={handlePayment}
                  isProcessing={isProcessing}
                  error={null}
                  processingLabel="Processing secure payment…"
                />
              ) : (
                <div className="bg-gray-50 rounded-[var(--radius-lg)] p-5 text-sm text-gray-500">
                  Loading secure payment…
                </div>
              )}
            </section>
          </div>
        </div>
      </CheckoutLayout>
    </div>
  );
}

export default GiftCardPurchase;
