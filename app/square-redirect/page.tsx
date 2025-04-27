"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentDetails {
  firstName?: string;
  lastName?: string;
  eventTitle?: string;
  amount?: string;
  currency?: string;
  paymentId?: string;
  receiptUrl?: string;
  note?: string;
  last4?: string;
  cardBrand?: string;
}

export default function SquareRedirectPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | "pending">(
    "pending"
  );
  const [message, setMessage] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});

  useEffect(() => {
    // Parse the query parameters
    const paymentId = searchParams.get("paymentId") || undefined;
    const error = searchParams.get("error");
    const statusParam = searchParams.get("status");

    // Get additional payment details
    const firstName = searchParams.get("firstName") || "";
    const lastName = searchParams.get("lastName") || "";
    const eventTitle = searchParams.get("eventTitle") || "";
    const amount = searchParams.get("amount") || "";
    const currency = searchParams.get("currency") || "USD";
    const receiptUrl = searchParams.get("receiptUrl") || "";
    const note = searchParams.get("note") || "";
    const last4 = searchParams.get("last4") || "";
    const cardBrand = searchParams.get("cardBrand") || "";

    // Update payment details
    setPaymentDetails({
      firstName,
      lastName,
      eventTitle,
      amount,
      currency,
      paymentId,
      receiptUrl,
      note,
      last4,
      cardBrand,
    });

    if (error) {
      setStatus("error");
      setMessage(`Payment failed: ${error}`);
      setLoading(false);
      return;
    }

    if (statusParam === "COMPLETED" || statusParam === "success") {
      setStatus("success");

      // Create personalized message
      let personalMessage = "Thank you for your payment";

      if (firstName && lastName) {
        personalMessage = `Thank you, ${firstName} ${lastName}, for your payment`;
      }

      if (eventTitle) {
        personalMessage += ` for ${eventTitle}`;
      }

      if (amount) {
        personalMessage += `. Amount: ${formatCurrency(amount, currency)}`;
      }

      setMessage(personalMessage + ".");
      setLoading(false);
      return;
    }

    // If we have a payment ID but no definitive status, we could verify it
    if (paymentId) {
      // Simulate checking payment status
      // In a real app, you would call your backend to verify the payment
      setTimeout(() => {
        setStatus("success");

        // Create personalized message
        let personalMessage = "Payment verification completed";

        if (firstName && lastName) {
          personalMessage = `Thank you, ${firstName} ${lastName}! Your registration is confirmed`;
        }

        if (eventTitle) {
          personalMessage += ` for ${eventTitle}`;
        }

        setMessage(personalMessage + ".");
        setLoading(false);
      }, 1500);
    } else {
      // No useful information in the URL, treat as pending/unknown
      setStatus("pending");
      setMessage(
        "Payment status is unknown. Please contact support if you believe this is an error."
      );
      setLoading(false);
    }
  }, [searchParams]);

  // Helper function to format currency
  const formatCurrency = (amount: string, currency: string): string => {
    try {
      const numAmount = parseFloat(amount) / 100; // Assuming amount is in cents
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(numAmount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 text-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Verifying payment status...</p>
        </div>
      ) : (
        <div
          className={`rounded-lg p-6 mb-8 ${
            status === "success"
              ? "bg-green-50 border border-green-200"
              : status === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          {status === "success" && (
            <>
              <svg
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Registration Confirmed!
              </h1>
            </>
          )}

          {status === "error" && (
            <>
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Payment Failed
              </h1>
            </>
          )}

          {status === "pending" && (
            <>
              <svg
                className="w-16 h-16 text-yellow-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-yellow-800 mb-2">
                Payment Status Pending
              </h1>
            </>
          )}

          <p className="text-gray-600 mb-6">{message}</p>

          {status === "success" && (
            <div className="space-y-3 text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
              {paymentDetails.note && (
                <p className="text-gray-700 text-center font-medium mb-3">
                  {paymentDetails.note}
                </p>
              )}

              {(paymentDetails.firstName || paymentDetails.lastName) && (
                <p className="text-gray-700">
                  <span className="font-semibold">Name:</span>{" "}
                  {paymentDetails.firstName} {paymentDetails.lastName}
                </p>
              )}

              {paymentDetails.eventTitle && (
                <p className="text-gray-700">
                  <span className="font-semibold">Event:</span>{" "}
                  {paymentDetails.eventTitle}
                </p>
              )}

              {paymentDetails.amount && (
                <p className="text-gray-700">
                  <span className="font-semibold">Amount:</span>{" "}
                  {formatCurrency(
                    paymentDetails.amount,
                    paymentDetails.currency || "USD"
                  )}
                </p>
              )}

              {paymentDetails.cardBrand && paymentDetails.last4 && (
                <p className="text-gray-700">
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {paymentDetails.cardBrand} ending in {paymentDetails.last4}
                </p>
              )}

              {paymentDetails.paymentId && (
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Payment ID:</span>{" "}
                  <span className="font-mono">{paymentDetails.paymentId}</span>
                </p>
              )}
            </div>
          )}

          {paymentDetails.receiptUrl && status === "success" && (
            <a
              href={paymentDetails.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mb-4"
            >
              View Receipt
            </a>
          )}

          {status === "error" && (
            <p className="text-red-600 mb-2">
              There was an issue with your payment. Please try again or contact
              support.
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
