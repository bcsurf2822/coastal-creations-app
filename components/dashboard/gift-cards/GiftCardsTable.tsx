"use client";

import React, { useState, useEffect, useCallback, ReactElement } from "react";
import GiftCardDetails from "./GiftCardDetails";

interface GiftCard {
  id: string;
  gan: string;
  state: "PENDING" | "ACTIVE" | "DEACTIVATED" | "BLOCKED";
  balanceMoney: { amount: number; currency: string };
  createdAt: string;
}

export default function GiftCardsTable(): ReactElement {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  const fetchGiftCards = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (isLoadMore && cursor) params.set("cursor", cursor);
      if (stateFilter) params.set("state", stateFilter);

      const response = await fetch(`/api/gift-cards/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch gift cards");
      }

      if (isLoadMore) {
        setGiftCards((prev) => [...prev, ...data.giftCards]);
      } else {
        setGiftCards(data.giftCards);
      }

      setCursor(data.cursor);
      setHasMore(!!data.cursor);
      setTotalOutstanding(data.totalOutstandingBalance || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [cursor, stateFilter]);

  useEffect(() => {
    setCursor(undefined);
    fetchGiftCards(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter]);

  const formatGan = (gan: string): string => {
    return `****-****-****-${gan.slice(-4)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (state: string): string => {
    switch (state) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DEACTIVATED":
        return "bg-gray-100 text-gray-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const activeCards = giftCards.filter((c) => c.state === "ACTIVE").length;
  const totalCards = giftCards.length;

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Gift Cards</p>
          <p className="text-2xl font-bold text-gray-800">{totalCards}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active Cards</p>
          <p className="text-2xl font-bold text-green-600">{activeCards}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold text-blue-600">
            ${(totalOutstanding / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-gray-600">Filter by status:</label>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DEACTIVATED">Deactivated</option>
          <option value="BLOCKED">Blocked</option>
        </select>
        <button
          onClick={() => fetchGiftCards(false)}
          className="px-3 py-2 text-sm text-primary hover:text-primary-dark"
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && giftCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading gift cards...
                    </div>
                  </td>
                </tr>
              ) : giftCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No gift cards found
                  </td>
                </tr>
              ) : (
                giftCards.map((card) => (
                  <tr
                    key={card.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm">
                      {formatGan(card.gan)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          card.state
                        )}`}
                      >
                        {card.state}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                      ${(card.balanceMoney.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(card.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard(card);
                        }}
                        className="text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => fetchGiftCards(true)}
              disabled={loading}
              className="w-full py-2 text-sm text-primary hover:text-primary-dark disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedCard && (
        <GiftCardDetails
          giftCard={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
