"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { RiBankCardLine, RiAddLine } from "react-icons/ri";
import type { SavedCard } from "@/lib/square/cards";
import AddCardForm from "@/components/account/AddCardForm";

interface PaymentMethodsManagerProps {
  initialCards: SavedCard[];
  applicationId: string;
  locationId: string;
  email: string;
  name?: string | null;
}

// Square card brands ("VISA", "AMERICAN_EXPRESS", ...) → friendly display labels.
function brandLabel(brand: string): string {
  return brand
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatExpiry(month: number, year: number): string {
  if (!month || !year) return "";
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

export default function PaymentMethodsManager({
  initialCards,
  applicationId,
  locationId,
  email,
  name,
}: PaymentMethodsManagerProps): ReactElement {
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [showAdd, setShowAdd] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (cardId: string): Promise<void> => {
    setRemovingId(cardId);
    setError(null);
    try {
      const res = await fetch(`/api/account/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not remove card. Please try again.");
        return;
      }
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleSaved = (card: SavedCard): void => {
    setCards((prev) => [card, ...prev.filter((c) => c.id !== card.id)]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Save a card for faster checkout. Your card details are stored securely by
        Square — we never see or store your full card number.
      </p>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {cards.length === 0 && !showAdd && (
        <div className="rounded-lg border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">
          You don&apos;t have any saved cards yet.
        </div>
      )}

      {cards.length > 0 && (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <RiBankCardLine className="h-5 w-5 shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {brandLabel(card.brand)} •••• {card.last4}
                  </p>
                  {formatExpiry(card.expMonth, card.expYear) && (
                    <p className="text-xs text-gray-500">
                      Expires {formatExpiry(card.expMonth, card.expYear)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(card.id)}
                disabled={removingId === card.id}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {removingId === card.id ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <AddCardForm
            applicationId={applicationId}
            locationId={locationId}
            email={email}
            name={name}
            onSaved={handleSaved}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RiAddLine className="h-4 w-4" /> Add a card
        </button>
      )}
    </div>
  );
}
