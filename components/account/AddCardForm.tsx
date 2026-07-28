"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import PaymentStep from "@/components/checkout/PaymentStep";
import type { SavedCard } from "@/lib/square/cards";

interface AddCardFormProps {
  applicationId: string;
  locationId: string;
  /** Account identity used as SCA billingContact + cardholder name (no new fields). */
  email: string;
  name?: string | null;
  onSaved: (card: SavedCard) => void;
  onCancel: () => void;
}

/**
 * Save a new card on file. Reuses the shared Square card widget with intent STORE
 * (tokenize handles SCA), then exchanges the token for a stored card via
 * POST /api/account/cards. Card data never touches our server.
 */
export default function AddCardForm({
  applicationId,
  locationId,
  email,
  name,
  onSaved,
  onCancel,
}: AddCardFormProps): ReactElement {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [givenName, ...rest] = (name ?? "").trim().split(/\s+/);
  const familyName = rest.join(" ");

  const handleToken = async (
    token: string,
    verificationToken?: string
  ): Promise<void> => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/account/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: token,
          verificationToken,
          cardholderName: name ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save card. Please try again.");
        setIsProcessing(false);
        return;
      }
      onSaved(data.card as SavedCard);
    } catch {
      setError("Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <PaymentStep
        applicationId={applicationId}
        locationId={locationId}
        amountDollars={null}
        ready={true}
        onToken={handleToken}
        isProcessing={isProcessing}
        error={error}
        processingLabel="Saving card…"
        submitLabel="Save card"
        verification={{
          intent: "STORE",
          billingContact: { givenName, familyName, email },
        }}
      />
      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
