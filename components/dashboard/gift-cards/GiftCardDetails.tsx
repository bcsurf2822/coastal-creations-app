"use client";

import React, { useState, useEffect, ReactElement } from "react";

interface GiftCardActivity {
  id: string;
  type: string;
  createdAt: string;
  giftCardBalanceMoney: { amount: number; currency: string };
  activateDetails?: { amount: number };
  loadDetails?: { amount: number };
  redeemDetails?: { amount: number; referenceId?: string };
}

interface GiftCardDetailsProps {
  giftCard: {
    id: string;
    gan: string;
    state: string;
    balanceMoney: { amount: number; currency: string };
    createdAt: string;
  };
  onClose: () => void;
}

export default function GiftCardDetails({
  giftCard,
  onClose,
}: GiftCardDetailsProps): ReactElement {
  const [activities, setActivities] = useState<GiftCardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/gift-cards/${giftCard.id}/activities`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch activities");
        }

        setActivities(data.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [giftCard.id]);

  const formatGan = (gan: string): string => {
    return gan.match(/.{1,4}/g)?.join("-") || gan;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActivityAmount = (activity: GiftCardActivity): number => {
    if (activity.activateDetails) return activity.activateDetails.amount;
    if (activity.loadDetails) return activity.loadDetails.amount;
    if (activity.redeemDetails) return activity.redeemDetails.amount;
    return 0;
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case "ACTIVATE":
      case "LOAD":
        return "text-green-600";
      case "REDEEM":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
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

  // Calculate totals from activities
  const totalLoaded = activities.reduce((sum, a) => {
    if (a.activateDetails) return sum + a.activateDetails.amount;
    if (a.loadDetails) return sum + a.loadDetails.amount;
    return sum;
  }, 0);

  const totalRedeemed = activities.reduce((sum, a) => {
    if (a.redeemDetails) return sum + a.redeemDetails.amount;
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Gift Card Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Card Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                  giftCard.state
                )}`}
              >
                {giftCard.state}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(giftCard.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Card Number</p>
            <p className="font-mono text-lg font-bold text-gray-800 mb-4">
              {formatGan(giftCard.gan)}
            </p>
            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-blue-600">
              ${(giftCard.balanceMoney.amount / 100).toFixed(2)}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 mb-1">Total Loaded</p>
              <p className="text-lg font-bold text-green-700">
                ${(totalLoaded / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 mb-1">Total Redeemed</p>
              <p className="text-lg font-bold text-red-700">
                ${(totalRedeemed / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Activity History */}
          <h3 className="font-semibold text-gray-800 mb-3">Activity History</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
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
              <span className="text-gray-500">Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No activity history</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-4 border-gray-200 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${getActivityColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    <span className="font-mono text-sm">
                      {activity.type === "REDEEM" ? "-" : "+"}$
                      {(getActivityAmount(activity) / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Balance after: ${(activity.giftCardBalanceMoney.amount / 100).toFixed(2)}
                  </p>
                  {activity.redeemDetails?.referenceId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Ref: {activity.redeemDetails.referenceId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
