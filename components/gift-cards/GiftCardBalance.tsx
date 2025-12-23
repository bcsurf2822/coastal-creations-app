"use client";

import React, { useState, ReactElement } from "react";
import { Input, Label, Button, Card } from "@/components/ui";

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
        return "text-[var(--color-success-text)] bg-[var(--color-success-light)]";
      case "PENDING":
        return "text-[var(--color-warning-text)] bg-[var(--color-warning-light)]";
      case "DEACTIVATED":
      case "BLOCKED":
        return "text-[var(--color-error-text)] bg-[var(--color-error-light)]";
      default:
        return "text-[var(--color-text-muted)] bg-[var(--color-border-lighter)]";
    }
  };

  return (
    <Card variant="featured" className="max-w-md mx-auto shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Check Gift Card Balance</h2>
      <p className="text-[var(--color-text-muted)] mb-6">
        Enter your gift card number below to check your remaining balance.
      </p>

      <div className="mb-4">
        <Label htmlFor="gan">Gift Card Number</Label>
        <Input
          type="text"
          id="gan"
          value={gan}
          onChange={handleGanChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxLength={19}
          className="font-mono text-lg text-center tracking-wider"
        />
      </div>

      <Button
        onClick={handleCheckBalance}
        disabled={gan.replace(/-/g, "").length !== 16 || loading}
        variant="primary"
        size="lg"
        isLoading={loading}
        className="w-full"
      >
        {loading ? "Checking..." : "Check Balance"}
      </Button>

      {error && (
        <div className="mt-4 bg-[var(--color-error-light)] border border-[var(--color-error)] text-[var(--color-error-text)] px-4 py-3 rounded-[var(--radius-default)]">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-[var(--color-border-lighter)] rounded-[var(--radius-default)] p-6 text-center">
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
              {result.status}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-[var(--color-text-primary)]">{result.formattedBalance}</p>
          {result.status === "ACTIVE" && result.balance > 0 && (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Ready to use at checkout!
            </p>
          )}
          {result.status === "ACTIVE" && result.balance === 0 && (
            <p className="mt-4 text-sm text-[var(--color-text-subtle)]">
              This gift card has been fully redeemed.
            </p>
          )}
          {result.status !== "ACTIVE" && (
            <p className="mt-4 text-sm text-[var(--color-error-text)]">
              This gift card cannot be used. Please contact us for assistance.
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-[var(--color-text-subtle)] text-center">
        Gift cards do not expire. The balance can be used across multiple purchases.
      </p>
    </Card>
  );
}

export default GiftCardBalance;
