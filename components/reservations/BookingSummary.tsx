"use client";

import { ReactElement } from "react";
import { BookingSummaryProps } from "./types";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function BookingSummary({
  selectedDates,
  pricePerDayPerParticipant,
  discount,
  optionsTotal,
  onContinue,
}: BookingSummaryProps): ReactElement {
  console.log("[BookingSummary] Rendering with selectedDates:", selectedDates);

  // Calculate total participants across all selected dates
  const totalParticipants = selectedDates.reduce(
    (sum, sd) => sum + sd.participants,
    0
  );

  // Calculate base price (participants × price per day per participant)
  const basePrice = totalParticipants * pricePerDayPerParticipant;

  // Calculate discount
  let discountAmount = 0;
  let isDiscountApplied = false;
  if (discount && selectedDates.length >= discount.minDays) {
    isDiscountApplied = true;
    if (discount.type === "percentage") {
      discountAmount = (basePrice * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
  }

  // Grand total
  const grandTotal = basePrice + optionsTotal - discountAmount;

  const isValid = selectedDates.length > 0 && totalParticipants > 0;

  return (
    <div className="fixed bottom-0 right-0 md:right-4 md:bottom-4 md:w-80 w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-t-xl md:rounded-xl shadow-xl p-6 z-50">
      <h3
        className={`${ebGaramond.className} text-xl font-bold mb-4 text-gray-800`}
      >
        Booking Summary
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={`${ebGaramond.className} font-medium text-gray-600`}>
            Selected Days:
          </span>
          <span className={`${ebGaramond.className} font-bold text-gray-800`}>
            {selectedDates.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`${ebGaramond.className} font-medium text-gray-600`}>
            Total Participants:
          </span>
          <span className={`${ebGaramond.className} font-bold text-gray-800`}>
            {totalParticipants}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`${ebGaramond.className} font-medium text-gray-600`}>
            Base Price:
          </span>
          <span className={`${ebGaramond.className} font-bold text-gray-800`}>
            ${basePrice.toFixed(2)}
          </span>
        </div>
        {optionsTotal > 0 && (
          <div className="flex justify-between">
            <span
              className={`${ebGaramond.className} font-medium text-gray-600`}
            >
              Options:
            </span>
            <span className={`${ebGaramond.className} font-bold text-gray-800`}>
              +${optionsTotal.toFixed(2)}
            </span>
          </div>
        )}
        {isDiscountApplied && (
          <div className="flex justify-between text-green-600">
            <span className={`${ebGaramond.className} font-bold`}>
              {discount!.name}:
            </span>
            <span className={`${ebGaramond.className} font-bold`}>
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
          <span className={`${ebGaramond.className} font-bold text-gray-800`}>
            Total:
          </span>
          <span className={`${ebGaramond.className} font-bold text-blue-600`}>
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {discount && !isDiscountApplied && (
        <p className={`${ebGaramond.className} text-xs text-gray-500 mt-3`}>
          Select {discount.minDays}+ days to qualify for {discount.name}
        </p>
      )}

      <button
        onClick={onContinue}
        disabled={!isValid}
        className={`
          ${ebGaramond.className} w-full mt-4 py-3 px-4 rounded-lg font-bold text-base
          transition-all duration-300
          ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        Continue to Payment
      </button>
    </div>
  );
}
