"use client";

import { useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";
import dynamic from "next/dynamic";

// Dynamically import Square payment components with SSR disabled
const DynamicPaymentForm = dynamic(
  async () => {
    const { PaymentForm } = await import("react-square-web-payments-sdk");
    return PaymentForm;
  },
  { ssr: false }
);

const DynamicCreditCard = dynamic(
  async () => {
    const { CreditCard } = await import("react-square-web-payments-sdk");
    return CreditCard;
  },
  { ssr: false }
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

interface PaymentProcessorProps {
  error: string;
  setError: (error: string) => void;
  isLoaded: boolean;
  config: PaymentConfig;
  formValid: boolean;
  billingDetails: BillingDetails;
  eventId: string;
  eventTitle: string;
  eventPrice: string; // Kept for future use or API compatibility
  formattedPrice: string;
  totalPrice: string;
  submitPayment: (
    token: string,
    billingDetails: PaymentSubmitData
  ) => Promise<PaymentResult>;
  router: ReturnType<typeof useRouter>;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  error,
  setError,
  isLoaded,
  config,
  formValid,
  billingDetails,
  eventId,
  eventTitle,
  formattedPrice,
  totalPrice,
  submitPayment,
  router,
}) => {
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
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Please complete all required fields above before proceeding with
                payment. You must provide either an email address or phone
                number.
              </p>
            </div>
          )}
          <DynamicPaymentForm
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

              if (!areRequiredFieldsFilled) {
                setError(
                  "Please fill in all required fields. Either email or phone number must be provided."
                );
                return;
              }

              if (token.token) {
                try {
                  const result = await submitPayment(token.token, {
                    ...billingDetails,
                    eventId,
                    eventTitle,
                    eventPrice: formattedPrice,
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
                    // Handle payment not completed
                    console.error("Payment not completed");
                    setError(
                      "Payment could not be completed. Please try again."
                    );
                  }
                } catch (error) {
                  console.error("Error:", error);
                  setError(
                    "Payment failed: Error: request failed with status 404. Please check your payment details and try again."
                  );
                }
              } else {
                console.error("Payment token is undefined");
                setError("Payment token is undefined. Please try again.");
              }
            }}
          >
            <div className="max-w-md mx-auto">
              <DynamicCreditCard />
              {!formValid && (
                <div className="mt-4 text-red-600 text-center text-sm font-medium">
                  Please complete all required fields above before submitting
                  payment
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

export default PaymentProcessor;
