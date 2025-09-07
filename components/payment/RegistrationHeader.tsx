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
    <div className="bg-primary text-black p-6 sm:p-10 mb-6 text-center relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-black">Registration</h1>
        <p className="text-xl mb-2 font-medium text-black">
          You&apos;re registering for:{" "}
          <span className="font-bold text-black">{eventTitle}</span>
        </p>

        {isPriceAvailable ? (
          <div className="mt-4 space-y-3">
            {/* Discount Badge */}
            {isDiscountActive() && discountInfo.discount?.description && (
              <div className="bg-green-100 text-green-800 py-2 px-6 rounded-full inline-block shadow-md border-2 border-green-300">
                <p className="text-lg font-bold">
                  🎉 {discountInfo.discount.description}
                </p>
              </div>
            )}

            {/* Price Display */}
            <div className="bg-white/70 py-3 px-8 rounded-full inline-block shadow-md">
              <p className="text-xl">
                <span className="font-medium text-black">Price:</span>{" "}
                {isDiscountActive() ? (
                  <>
                    <span className="font-medium text-gray-500 line-through mr-2">
                      ${getOriginalPrice().toFixed(2)}
                    </span>
                    <span className="font-bold text-green-600">
                      ${formattedPrice}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-black">
                    ${formattedPrice}
                  </span>
                )}
                <span className="text-black font-medium"> / Per Person</span>
              </p>

              {/* Discount Information */}
              {discountInfo.isDiscountAvailable && discountInfo.discount && (
                <p className="text-sm text-gray-600 mt-1">
                  {isDiscountActive()
                    ? `Discount applied! (${discountInfo.discount.minParticipants}+ participants)`
                    : `Discount available with ${discountInfo.discount.minParticipants}+ total participants`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-white/70 py-3 px-8 rounded-lg inline-block shadow-md">
            <p className="text-xl font-medium text-red-500">
              Sorry, payments are currently not available for this event.
            </p>
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-32 -mt-32 z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/40 rounded-full -ml-24 -mb-24 z-0"></div>
    </div>
  );
};

export default RegistrationHeader;
