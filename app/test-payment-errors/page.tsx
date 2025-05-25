"use client";

import { useState, useEffect } from "react";
import { submitPayment } from "@/app/actions/actions";
import { SquareErrorCode } from "@/lib/models/PaymentError";

interface PaymentError {
  _id: string;
  eventId?: string;
  eventTitle?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  paymentAmount?: number;
  sourceId?: string;
  paymentErrors: Array<{
    code: SquareErrorCode;
    detail: string;
    field?: string;
    category: string;
  }>;
  attemptedAt: string;
  createdAt: string;
}

export default function TestPaymentErrorsPage() {
  const [paymentErrors, setPaymentErrors] = useState<PaymentError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringError, setTriggeringError] = useState(false);

  useEffect(() => {
    fetchPaymentErrors();
  }, []);

  const fetchPaymentErrors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-errors?limit=20");
      const data = await response.json();

      if (data.success) {
        setPaymentErrors(data.paymentErrors);
      } else {
        setError(data.error || "Failed to fetch payment errors");
      }
    } catch (err) {
      setError("Error fetching payment errors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentError = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-errors?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setPaymentErrors((prev) => prev.filter((error) => error._id !== id));
      } else {
        alert("Failed to delete payment error");
      }
    } catch (err) {
      alert("Error deleting payment error");
      console.error(err);
    }
  };

  const triggerPaymentError = async (errorType: string) => {
    setTriggeringError(true);
    try {
      let billingDetails;

      switch (errorType) {
        case "invalid_phone":
          billingDetails = {
            addressLine1: "123 Test St",
            givenName: "Test",
            familyName: "User",
            countryCode: "US",
            city: "Test City",
            state: "CA",
            postalCode: "12345",
            email: "test@example.com",
            phoneNumber: "invalid-phone", // This will trigger INVALID_PHONE_NUMBER error
            eventId: "test-event-123",
            eventTitle: "Test Event",
            eventPrice: "50.00",
          };
          break;
        case "invalid_email":
          billingDetails = {
            addressLine1: "123 Test St",
            givenName: "Test",
            familyName: "User",
            countryCode: "US",
            city: "Test City",
            state: "CA",
            postalCode: "12345",
            email: "invalid-email", // This will trigger INVALID_EMAIL_ADDRESS error
            phoneNumber: "555-123-4567",
            eventId: "test-event-123",
            eventTitle: "Test Event",
            eventPrice: "50.00",
          };
          break;
        case "invalid_source":
          billingDetails = {
            addressLine1: "123 Test St",
            givenName: "Test",
            familyName: "User",
            countryCode: "US",
            city: "Test City",
            state: "CA",
            postalCode: "12345",
            email: "test@example.com",
            phoneNumber: "555-123-4567",
            eventId: "test-event-123",
            eventTitle: "Test Event",
            eventPrice: "50.00",
          };
          break;
        default:
          return;
      }

      // Use an invalid source ID to trigger an error
      const invalidSourceId =
        errorType === "invalid_source"
          ? "invalid-source-id"
          : "cnon:card-nonce-ok";

      await submitPayment(invalidSourceId, billingDetails);

      // Refresh the error list after triggering
      setTimeout(() => {
        fetchPaymentErrors();
      }, 1000);
    } catch (err) {
      console.log("Expected error triggered:", err);
    } finally {
      setTriggeringError(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Payment Errors</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Payment Errors</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Errors</h1>
        <button
          onClick={fetchPaymentErrors}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>

      {/* Error Triggering Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-yellow-800">
          Test Error Logging
        </h2>
        <p className="text-yellow-700 mb-4">
          Click the buttons below to trigger different types of payment errors
          and test the logging system:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerPaymentError("invalid_phone")}
            disabled={triggeringError}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-2 px-4 rounded"
          >
            {triggeringError ? "Triggering..." : "Invalid Phone Number"}
          </button>
          <button
            onClick={() => triggerPaymentError("invalid_email")}
            disabled={triggeringError}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2 px-4 rounded"
          >
            {triggeringError ? "Triggering..." : "Invalid Email Address"}
          </button>
          <button
            onClick={() => triggerPaymentError("invalid_source")}
            disabled={triggeringError}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-bold py-2 px-4 rounded"
          >
            {triggeringError ? "Triggering..." : "Invalid Payment Source"}
          </button>
        </div>
        <p className="text-sm text-yellow-600 mt-3">
          Note: These will create test payment errors that will appear in the
          list below after a few seconds.
        </p>
      </div>

      {paymentErrors.length === 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          No payment errors found. This is good news!
        </div>
      ) : (
        <div className="space-y-4">
          {paymentErrors.map((paymentError) => (
            <div
              key={paymentError._id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Error #{paymentError._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(paymentError.attemptedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deletePaymentError(paymentError._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {paymentError.eventTitle && (
                  <div>
                    <span className="font-medium">Event:</span>{" "}
                    {paymentError.eventTitle}
                  </div>
                )}
                {paymentError.customerName && (
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {paymentError.customerName}
                  </div>
                )}
                {paymentError.customerEmail && (
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {paymentError.customerEmail}
                  </div>
                )}
                {paymentError.paymentAmount && (
                  <div>
                    <span className="font-medium">Amount:</span> $
                    {paymentError.paymentAmount}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Errors:</h4>
                <div className="space-y-2">
                  {paymentError.paymentErrors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-red-800">
                            {error.code}
                          </span>
                          {error.field && (
                            <span className="text-sm text-red-600 ml-2">
                              (Field: {error.field})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                          {error.category}
                        </span>
                      </div>
                      <p className="text-red-700 mt-1">{error.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
