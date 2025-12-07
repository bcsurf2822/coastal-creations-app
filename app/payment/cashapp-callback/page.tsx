"use client";

import { useEffect, useState, Suspense, ReactElement } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function CashAppCallbackContent(): ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Parse Cash App callback parameters
    const transactionId = searchParams.get("transactionId");
    const statusParam = searchParams.get("status");

    if (statusParam === "OK" || statusParam === "COMPLETED") {
      setStatus("success");
      setMessage("Your Cash App payment was successful!");

      // Redirect to success page after a delay
      setTimeout(() => {
        router.push(
          `/payment-success?paymentId=${transactionId || ""}&status=COMPLETED&method=cashapp`
        );
      }, 2000);
    } else if (statusParam === "CANCELED" || statusParam === "FAILED") {
      setStatus("error");
      setMessage(
        statusParam === "CANCELED"
          ? "Payment was canceled. Please try again."
          : "Payment failed. Please try a different payment method."
      );
    } else {
      // Unknown status, show loading and let Square SDK handle it
      setStatus("loading");
      setMessage("Processing your payment...");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500 animate-spin"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you now...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
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
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Issue
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block bg-primary text-black font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </Link>
          </>
        )}

        {/* Cash App Branding */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <rect width="24" height="24" rx="4" fill="#00D632" />
              <path
                d="M7 12h10M12 7v10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Powered by Cash App Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashAppCallbackPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
          </div>
        </div>
      }
    >
      <CashAppCallbackContent />
    </Suspense>
  );
}
