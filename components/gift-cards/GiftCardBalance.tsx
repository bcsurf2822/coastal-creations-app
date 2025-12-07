"use client";

import React, { useState, ReactElement } from "react";

interface BalanceResult {
  balance: number;
  status: string;
  formattedBalance: string;
}

export function GiftCardBalance(): ReactElement {
  const [gan, setGan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BalanceResult | null>(null);

  const formatGanInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add dashes every 4 digits
    const parts = digits.match(/.{1,4}/g) || [];
    return parts.join("-").slice(0, 19); // 16 digits + 3 dashes
  };

  const handleGanChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formatted = formatGanInput(e.target.value);
    setGan(formatted);
    // Clear previous results when user types
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleCheckBalance = async (): Promise<void> => {
    const cleanGan = gan.replace(/-/g, "");

    if (cleanGan.length !== 16) {
      setError("Please enter a valid 16-digit gift card number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/gift-cards/balance?gan=${encodeURIComponent(cleanGan)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to check balance");
        return;
      }

      setResult({
        balance: data.balance,
        status: data.status,
        formattedBalance: data.formattedBalance,
      });
    } catch {
      setError("Failed to check balance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "DEACTIVATED":
      case "BLOCKED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Gift Card Balance</h2>
      <p className="text-gray-600 mb-6">
        Enter your gift card number below to check your remaining balance.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gift Card Number
        </label>
        <input
          type="text"
          value={gan}
          onChange={handleGanChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxLength={19}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-lg text-center tracking-wider"
        />
      </div>

      <button
        onClick={handleCheckBalance}
        disabled={gan.replace(/-/g, "").length !== 16 || loading}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking...
          </span>
        ) : (
          "Check Balance"
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6 text-center">
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
              {result.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-gray-800">{result.formattedBalance}</p>
          {result.status === "ACTIVE" && result.balance > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Ready to use at checkout!
            </p>
          )}
          {result.status === "ACTIVE" && result.balance === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              This gift card has been fully redeemed.
            </p>
          )}
          {result.status !== "ACTIVE" && (
            <p className="mt-4 text-sm text-red-600">
              This gift card cannot be used. Please contact us for assistance.
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500 text-center">
        Gift cards do not expire. The balance can be used across multiple purchases.
      </p>
    </div>
  );
}

export default GiftCardBalance;
