"use client";

import { useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import Square payment components with SSR disabled
const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
    ),
  }
);

const DynamicCreditCard = dynamic(
  async () => {
    const { CreditCard } = await import("react-square-web-payments-sdk");
    return CreditCard;
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
    ),
  }
);

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl: string;
}

interface BillingDetails {
  addressLine1: string;
  addressLine2: string;
  familyName: string;
  givenName: string;
  countryCode: string;
  city: string;
  state: string;
  postalCode: string;
  email: string;
  phoneNumber: string;
  numberOfPeople: number;
}

interface PaymentSubmitData extends BillingDetails {
  eventId: string;
  eventTitle: string;
  eventPrice: string;
}

interface PaymentResult {
  result?: {
    payment?: {
      status: string;
      id: string;
      receiptUrl?: string;
      note?: string;
      amountMoney?: {
        amount?: number;
        currency?: string;
      };
      cardDetails?: {
        card?: {
          last4?: string;
          cardBrand?: string;
        };
      };
    };
  };
}

interface Participant {
  firstName: string;
  lastName: string;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
}

interface PaymentProcessorProps {
  error: string;
  setError: (error: string) => void;
  isLoaded: boolean;
  config: PaymentConfig;
  formValid: boolean;
  billingDetails: BillingDetails;
  eventId: string;
  eventTitle: string;
  totalPrice: string;
  submitPayment: (
    token: string,
    billingDetails: PaymentSubmitData
  ) => Promise<PaymentResult>;
  router: ReturnType<typeof useRouter>;
  participants: Participant[];
  getParticipantValidationError: () => string | null;
}

// Helper function to convert Square error codes to user-friendly messages
const getErrorMessage = (code: string, detail?: string): string => {
  // If we have a detailed message, use it
  if (detail && detail.trim() !== "") {
    return detail;
  }

  // Common Square error code mappings to user-friendly messages
  const errorMessages: Record<string, string> = {
    INVALID_PHONE_NUMBER: "Please enter a valid phone number.",
    INVALID_EMAIL_ADDRESS: "Please enter a valid email address.",
    CARD_DECLINED:
      "Your card was declined. Please try a different payment method.",
    INSUFFICIENT_FUNDS:
      "Your card has insufficient funds. Please try a different payment method.",
    CVV_FAILURE: "The CVV code is incorrect. Please check your card details.",
    INVALID_EXPIRATION:
      "The card expiration date is invalid. Please check your card details.",
    CARD_EXPIRED:
      "Your card has expired. Please use a different payment method.",
    INVALID_CARD:
      "The card information is invalid. Please check your card details.",
    GENERIC_DECLINE:
      "Your payment was declined. Please contact your bank or try a different payment method.",
    PAYMENT_LIMIT_EXCEEDED:
      "The payment amount exceeds your card limit. Please try a different payment method.",
    CARD_TOKEN_EXPIRED:
      "Your payment session has expired. Please refresh the page and try again.",
    CARD_TOKEN_USED:
      "This payment method has already been used. Please refresh the page and try again.",
    INVALID_POSTAL_CODE: "Please enter a valid postal code.",
    ADDRESS_VERIFICATION_FAILURE:
      "The billing address could not be verified. Please check your address details.",
    TRANSACTION_LIMIT: "The transaction amount is outside the allowed limits.",
    VOICE_FAILURE: "Please contact your bank to authorize this payment.",
    CARD_DECLINED_CALL_ISSUER:
      "Please contact your bank to authorize this payment.",
    CARD_DECLINED_VERIFICATION_REQUIRED:
      "Additional verification is required. Please contact your bank.",
    INVALID_VALUE:
      "Some of the payment information is invalid. Please check your details.",
    BAD_REQUEST:
      "There was an issue with your payment information. Please check your details.",
    UNAUTHORIZED: "Payment authorization failed. Please try again.",
    FORBIDDEN:
      "This payment method is not allowed. Please try a different payment method.",
    INTERNAL_SERVER_ERROR:
      "A temporary error occurred. Please try again in a few moments.",
    SERVICE_UNAVAILABLE:
      "Payment services are temporarily unavailable. Please try again later.",
    RATE_LIMITED:
      "Too many payment attempts. Please wait a moment and try again.",
  };

  return (
    errorMessages[code] ||
    `Payment failed: ${code.replace(/_/g, " ").toLowerCase()}. Please try again.`
  );
};

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  error,
  setError,
  isLoaded,
  config,
  formValid,
  billingDetails,
  eventId,
  eventTitle,
  totalPrice,
  submitPayment,
  router,
  getParticipantValidationError,
}) => {
  // Create unique ID for this payment form to prevent conflicts
  const formId = React.useMemo(
    () => `payment-form-${eventId}-${Date.now()}`,
    [eventId]
  );
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        </svg>
        Payment Details
      </h2>

      {/* Error Alert */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Payment Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError("")}
          >
            <span className="sr-only">Close</span>
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      {isLoaded ? (
        <div className="p-6 bg-gray-50 rounded-lg">
          {!formValid && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="space-y-1">
                  <p>
                    Please complete all required fields above before proceeding
                    with payment. You must provide either an email address or
                    phone number.
                  </p>
                  {getParticipantValidationError() && (
                    <p className="font-medium">
                      {getParticipantValidationError()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DynamicPaymentForm
            key={formId}
            applicationId={config.applicationId}
            locationId={config.locationId}
            createPaymentRequest={() => {
              return {
                countryCode: "US",
                currencyCode: "USD",
                total: {
                  amount: totalPrice,
                  label: "Total",
                },
              };
            }}
            cardTokenizeResponseReceived={async (token) => {
              // Validate form before proceeding
              const isContactProvided =
                billingDetails.email.trim() !== "" ||
                billingDetails.phoneNumber.trim() !== "";

              const areRequiredFieldsFilled =
                billingDetails.givenName.trim() !== "" &&
                billingDetails.familyName.trim() !== "" &&
                billingDetails.addressLine1.trim() !== "" &&
                billingDetails.city.trim() !== "" &&
                billingDetails.state.trim() !== "" &&
                billingDetails.postalCode.trim() !== "" &&
                isContactProvided;

              // Check participant validation
              const participantError = getParticipantValidationError();

              if (!areRequiredFieldsFilled) {
                setError(
                  "Please fill in all required fields. Either email or phone number must be provided."
                );
                return;
              }

              if (participantError) {
                setError(participantError);
                return;
              }

              if (token.token) {
                try {
                  const result = await submitPayment(token.token, {
                    ...billingDetails,
                    eventId,
                    eventTitle,
                    eventPrice: totalPrice,
                  });

                  if (result?.result?.payment?.status === "COMPLETED") {
                    const paymentId = result.result.payment.id;
                    const receiptUrl = result.result.payment.receiptUrl || "";
                    const note = result.result.payment.note || "";

                    // Safely extract amount and currency with fallbacks
                    const amount =
                      result.result.payment.amountMoney?.amount?.toString() ||
                      "0";
                    const currency =
                      result.result.payment.amountMoney?.currency || "USD";

                    // Get card details if available
                    const last4 =
                      result.result.payment.cardDetails?.card?.last4 || "";
                    const cardBrand =
                      result.result.payment.cardDetails?.card?.cardBrand || "";

                    // Build query parameters with all relevant information
                    const queryParams = new URLSearchParams();
                    queryParams.set("paymentId", paymentId || "");
                    queryParams.set("status", "COMPLETED");
                    queryParams.set("receiptUrl", receiptUrl);
                    queryParams.set("firstName", billingDetails.givenName);
                    queryParams.set("lastName", billingDetails.familyName);
                    queryParams.set("eventTitle", eventTitle || "");
                    queryParams.set("eventId", eventId || "");
                    queryParams.set("note", note);
                    queryParams.set("amount", amount);
                    queryParams.set("currency", currency);
                    queryParams.set("last4", last4);
                    queryParams.set("cardBrand", cardBrand);

                    // Add contact information to success page
                    if (billingDetails.email) {
                      queryParams.set("email", billingDetails.email);
                    }
                    if (billingDetails.phoneNumber) {
                      queryParams.set("phone", billingDetails.phoneNumber);
                    }

                    // Add number of people to success page
                    queryParams.set(
                      "numberOfPeople",
                      billingDetails.numberOfPeople.toString()
                    );

                    // Add total price to success page
                    queryParams.set("totalPrice", totalPrice);

                    // Use config for redirect URL
                    router.push(
                      `${config.redirectUrl}?${queryParams.toString()}`
                    );

                    // Customer data is now handled in the main component via submitCustomerDetails
                  } else {
                    // Handle payment not completed - check for specific error details
                    console.error("Payment not completed:", result);

                    // Try to extract error information from the result
                    let errorMessage =
                      "Payment could not be completed. Please try again.";

                    // Check if there are specific errors in the result
                    if (
                      result &&
                      typeof result === "object" &&
                      "result" in result
                    ) {
                      const resultObj = result as {
                        result?: {
                          errors?: Array<{ detail?: string; code?: string }>;
                        };
                      };
                      if (
                        resultObj.result?.errors &&
                        Array.isArray(resultObj.result.errors)
                      ) {
                        const firstError = resultObj.result.errors[0];
                        if (firstError?.code || firstError?.detail) {
                          errorMessage = getErrorMessage(
                            firstError.code || "",
                            firstError.detail
                          );
                        }
                      }
                    }

                    setError(errorMessage);
                  }
                } catch (error) {
                  console.error("Payment processing error:", error);

                  // Extract meaningful error message from the caught error
                  let errorMessage =
                    "Payment could not be processed. Please try again.";

                  if (error && typeof error === "object") {
                    // Check for Square API error structure
                    if ("result" in error) {
                      const errorObj = error as {
                        result?: {
                          errors?: Array<{ detail?: string; code?: string }>;
                        };
                      };
                      if (
                        errorObj.result?.errors &&
                        Array.isArray(errorObj.result.errors)
                      ) {
                        const firstError = errorObj.result.errors[0];
                        if (firstError?.code || firstError?.detail) {
                          errorMessage = getErrorMessage(
                            firstError.code || "",
                            firstError.detail
                          );
                        }
                      }
                    }
                    // Check for direct errors array
                    else if ("errors" in error) {
                      const errorObj = error as {
                        errors?: Array<{ detail?: string; code?: string }>;
                      };
                      if (errorObj.errors && Array.isArray(errorObj.errors)) {
                        const firstError = errorObj.errors[0];
                        if (firstError?.code || firstError?.detail) {
                          errorMessage = getErrorMessage(
                            firstError.code || "",
                            firstError.detail
                          );
                        }
                      }
                    }
                    // Check for standard Error object
                    else if ("message" in error) {
                      const errorObj = error as Error;
                      // Only use the error message if it's not a generic network error
                      if (
                        errorObj.message &&
                        !errorObj.message.includes("status 404") &&
                        !errorObj.message.includes("request failed")
                      ) {
                        errorMessage = errorObj.message;
                      }
                    }
                  }

                  setError(errorMessage);
                }
              } else {
                console.error("Payment token is undefined");
                setError("Payment token is undefined. Please try again.");
              }
            }}
          >
            <div className="max-w-md mx-auto">
              <DynamicCreditCard key={`${formId}-card`} />
              {!formValid && (
                <div className="mt-4 text-red-600 text-center text-sm font-medium space-y-1">
                  <div>
                    Please complete all required fields above before submitting
                    payment
                  </div>
                  {getParticipantValidationError() && (
                    <div className="font-bold">
                      {getParticipantValidationError()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DynamicPaymentForm>
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-primary"></div>
          <p className="mt-4 text-gray-600">Loading payment form...</p>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center mt-4">
        <p className="flex items-center justify-center gap-1">
          Secure payment processing by <PiSquareLogoFill className="text-xl" />{" "}
          Square
        </p>
      </div>
    </div>
  );
};

export default React.memo(PaymentProcessor);
