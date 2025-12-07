"use client";

import React, { useState, ReactElement } from "react";

interface AppliedGiftCard {
  giftCardId: string;
  gan: string;
  amountApplied: number;
  remainingBalance: number;
}

interface GiftCardRedemptionProps {
  totalAmount: number; // Order total in cents
  onApply: (redemption: AppliedGiftCard) => void;
  onRemove: () => void;
  appliedCard: AppliedGiftCard | null;
}

export function GiftCardRedemption({
  totalAmount,
  onApply,
  onRemove,
  appliedCard,
}: GiftCardRedemptionProps): ReactElement {
  const [gan, setGan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGanInput = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const parts = digits.match(/.{1,4}/g) || [];
    return parts.join("-").slice(0, 19);
  };

  const handleGanChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formatted = formatGanInput(e.target.value);
    setGan(formatted);
    if (error) setError(null);
  };

  const handleApply = async (): Promise<void> => {
    const cleanGan = gan.replace(/-/g, "");

    if (cleanGan.length !== 16) {
      setError("Please enter a valid 16-digit gift card number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gift-cards/balance?gan=${encodeURIComponent(cleanGan)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid gift card");
        return;
      }

      if (data.status !== "ACTIVE") {
        setError("This gift card is not active");
        return;
      }

      if (data.balance <= 0) {
        setError("This gift card has no remaining balance");
        return;
      }

      // Calculate amount to apply (minimum of balance and total)
      const amountToApply = Math.min(data.balance, totalAmount);

      onApply({
        giftCardId: data.giftCardId,
        gan: gan,
        amountApplied: amountToApply,
        remainingBalance: data.balance - amountToApply,
      });

      setGan("");
      setIsExpanded(false);
    } catch {
      setError("Failed to check gift card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If a card is already applied, show the applied card view
  if (appliedCard) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Gift Card Applied</p>
              <p className="text-sm text-green-600">
                ****-****-****-{appliedCard.gan.replace(/-/g, "").slice(-4)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-800 text-lg">
              -${(appliedCard.amountApplied / 100).toFixed(2)}
            </p>
            <button
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
        {appliedCard.remainingBalance > 0 && (
          <p className="mt-2 text-xs text-green-600">
            Remaining balance after purchase: ${(appliedCard.remainingBalance / 100).toFixed(2)}
          </p>
        )}
      </div>
    );
  }

  // Collapsed view - just a toggle button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full text-left border border-gray-200 rounded-lg p-4 mb-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-gray-700 font-medium">Have a gift card?</span>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  // Expanded view - input form
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 flex items-center">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Enter Gift Card Number
        </h3>
        <button
          onClick={() => {
            setIsExpanded(false);
            setGan("");
            setError(null);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={gan}
          onChange={handleGanChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxLength={19}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
        />
        <button
          onClick={handleApply}
          disabled={gan.replace(/-/g, "").length !== 16 || loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

export default GiftCardRedemption;
