"use client";

import { submitPayment } from "@/app/actions/actions";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { useState, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl: string;
}

export default function Payment() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [formValid, setFormValid] = useState(false);
  const [config, setConfig] = useState<PaymentConfig>({
    applicationId: "",
    locationId: "main",
    redirectUrl: "",
  });

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const eventTitle = searchParams.get("eventTitle") || "";
  const eventPrice = searchParams.get("price") || "";

  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(true);

  const [billingDetails, setBillingDetails] = useState({
    addressLine1: "",
    addressLine2: "",
    familyName: "",
    givenName: "",
    countryCode: "US",
    city: "",
    state: "",
    postalCode: "",
    email: "",
    phoneNumber: "",
  });

  // Format price for display and ensure it's a valid number
  useEffect(() => {
    try {
      if (!eventPrice) {
        setIsPriceAvailable(false);
        return;
      }

      // Remove any non-numeric characters except decimal point
      const cleanPrice = eventPrice.replace(/[^\d.]/g, "");
      const price = parseFloat(cleanPrice);

      if (!isNaN(price)) {
        // Format to 2 decimal places
        setFormattedPrice(price.toFixed(2));
        setIsPriceAvailable(true);
      } else {
        setIsPriceAvailable(false);
      }
    } catch (e) {
      console.error("Error formatting price:", e);
      setIsPriceAvailable(false);
    }
  }, [eventPrice]);

  // Validate form fields
  useEffect(() => {
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

    setFormValid(areRequiredFieldsFilled);
  }, [billingDetails]);

  // Fetch payment configuration from API
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/payment-config");
        if (!response.ok) {
          throw new Error("Failed to fetch payment configuration");
        }
        const data = await response.json();
        setConfig(data);

        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching payment configuration:", error);
        setError(
          "Failed to load payment configuration. Please try again later."
        );
      }
    }

    fetchConfig();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Event Header */}
        {eventTitle && (
          <div className="bg-primary text-black p-6 sm:p-10 mb-6 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-black">
                Registration
              </h1>
              <p className="text-xl mb-2 font-medium text-black">
                You&apos;re registering for:{" "}
                <span className="font-bold text-black">{eventTitle}</span>
              </p>

              {isPriceAvailable ? (
                <div className="mt-4 bg-white/70 py-3 px-8 rounded-full inline-block shadow-md">
                  <p className="text-xl">
                    <span className="font-medium text-black">Price:</span>{" "}
                    <span className="font-bold text-black">
                      ${formattedPrice}
                    </span>
                  </p>
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
        )}

        {isPriceAvailable ? (
          // Only show billing and payment form if price is available
          <div className="p-6 sm:p-10">
            {/* Billing Section */}
            <div className="mb-10">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Billing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="givenName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="givenName"
                    name="givenName"
                    value={billingDetails.givenName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="familyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    name="familyName"
                    value={billingDetails.familyName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={billingDetails.addressLine1}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={billingDetails.addressLine2}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={billingDetails.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={billingDetails.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={billingDetails.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="countryCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={billingDetails.countryCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={billingDetails.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={billingDetails.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 italic">
                    * Either Email Address or Phone Number is required for
                    contact purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
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
                        Please complete all required fields above before
                        proceeding with payment. You must provide either an
                        email address or phone number.
                      </p>
                    </div>
                  )}
                  <PaymentForm
                    applicationId={config.applicationId}
                    locationId={config.locationId}
                    createPaymentRequest={() => {
                      return {
                        countryCode: "US",
                        currencyCode: "USD",
                        total: {
                          amount: formattedPrice,
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
                            const receiptUrl =
                              result.result.payment.receiptUrl || "";
                            const note = result.result.payment.note || "";

                            // Safely extract amount and currency with fallbacks
                            const amount =
                              result.result.payment.amountMoney?.amount?.toString() ||
                              "0";
                            const currency =
                              result.result.payment.amountMoney?.currency ||
                              "USD";

                            // Get card details if available
                            const last4 =
                              result.result.payment.cardDetails?.card?.last4 ||
                              "";
                            const cardBrand =
                              result.result.payment.cardDetails?.card
                                ?.cardBrand || "";

                            // Build query parameters with all relevant information
                            const queryParams = new URLSearchParams();
                            queryParams.set("paymentId", paymentId || "");
                            queryParams.set("status", "COMPLETED");
                            queryParams.set("receiptUrl", receiptUrl);
                            queryParams.set(
                              "firstName",
                              billingDetails.givenName
                            );
                            queryParams.set(
                              "lastName",
                              billingDetails.familyName
                            );
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
                              queryParams.set(
                                "phone",
                                billingDetails.phoneNumber
                              );
                            }

                            // Use config for redirect URL
                            router.push(
                              `${config.redirectUrl}?${queryParams.toString()}`
                            );
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
                        setError(
                          "Payment token is undefined. Please try again."
                        );
                      }
                    }}
                  >
                    <div className="max-w-md mx-auto">
                      <CreditCard />
                      {!formValid && (
                        <div className="mt-4 text-red-600 text-center text-sm font-medium">
                          Please complete all required fields above before
                          submitting payment
                        </div>
                      )}
                    </div>
                  </PaymentForm>
                </div>
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-primary"></div>
                  <p className="mt-4 text-gray-600">Loading payment form...</p>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 text-center mt-4">
              <p className="flex items-center justify-center gap-1">
                Secure payment processing by{" "}
                <PiSquareLogoFill className="text-xl" /> Square
              </p>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-lg mb-6">
              To register for this event, please contact us directly by email.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:info@coastalcreationsstudio.com")
                }
                className="px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors border-2 border-black flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </button>
            </div>
            <p className="text-gray-600">
              We&apos;ll be happy to assist you with your registration and
              answer any questions you may have.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
