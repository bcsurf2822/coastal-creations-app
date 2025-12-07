"use client";
import React, { ReactElement } from "react";

// Dynamic imports with SSR disabled - CRITICAL for Square SDK
// const DynamicGooglePay = dynamic(
//   async () => {
//     const { GooglePay } = await import("react-square-web-payments-sdk");
//     return GooglePay;
//   },
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
//     ),
//   }
// );

// const DynamicCashAppPay = dynamic(
//   async () => {
//     const { CashAppPay } = await import("react-square-web-payments-sdk");
//     return CashAppPay;
//   },
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
//     ),
//   }
// );

interface WalletPayButtonsProps {
  redirectUrl: string;
  referenceId?: string;
}

function WalletPayButtons({}: WalletPayButtonsProps): ReactElement {
  return (
    <div className="space-y-4 mb-6">
      {/* Or Pay With Card Divider */}
      <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm"></div>
      </div>
    </div>
  );
}

export default WalletPayButtons;
