"use client";

import React from "react";

interface RegistrationHeaderProps {
  eventTitle: string;
  formattedPrice: string;
  isPriceAvailable: boolean;
  originalPrice: string;
  discountInfo: {
    isDiscountAvailable: boolean;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      minParticipants: number;
      description?: string;
    };
  };
  currentParticipantCount: number;
  numberOfPeople: number;
}

const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({
  eventTitle,
  formattedPrice,
  isPriceAvailable,
  originalPrice,
  discountInfo,
  numberOfPeople,
}) => {
  // Helper functions
  const isDiscountActive = (): boolean => {
    if (!discountInfo.isDiscountAvailable || !discountInfo.discount)
      return false;
    // Only consider current registration for discount, not existing participants
    return numberOfPeople >= discountInfo.discount.minParticipants;
  };

  const getOriginalPrice = (): number => {
    const cleanPrice = originalPrice.replace(/[^\d.]/g, "");
    return parseFloat(cleanPrice) || 0;
  };
  return (
    <div className="p-6 sm:p-8 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        {eventTitle}
      </h1>

      {isPriceAvailable ? (
        <div className="mt-4 text-center">
          {/* Discount Badge */}
          {isDiscountActive() && discountInfo.discount?.description && (
            <div className="bg-green-100 text-green-700 py-1 px-3 rounded-full inline-block text-sm font-medium mb-2">
              {discountInfo.discount.description}
            </div>
          )}

          {/* Price Display */}
          <div className="flex items-center justify-center gap-2">
            {isDiscountActive() ? (
              <>
                <span className="text-gray-400 line-through text-lg">
                  ${getOriginalPrice().toFixed(2)}
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  ${formattedPrice}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${formattedPrice}
              </span>
            )}
          </div>

          {/* Discount Information */}
          {discountInfo.isDiscountAvailable &&
            discountInfo.discount &&
            !isDiscountActive() && (
              <p className="text-sm text-gray-500 mt-1">
                Save with {discountInfo.discount.minParticipants}+ participants
              </p>
            )}
        </div>
      ) : (
        <p className="text-red-600 font-medium text-center mt-4">
          Payments not available for this event
        </p>
      )}
    </div>
  );
};

export default RegistrationHeader;
