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

  const [billingDetails, setBillingDetails] = useState({
    addressLine1: "",
    addressLine2: "",
    familyName: "",
    givenName: "",
    countryCode: "US",
    city: "",
    state: "",
    postalCode: "",
  });

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
                  <p className="text-xl font-medium text-black">
                    Sorry, please call to register for this event.
                  </p>
                  <p className="text-lg text-black mt-1">
                    <a href="tel:+1234567890" className="underline">
                      Call (123) 456-7890
                    </a>
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

              {isLoaded ? (
                <div className="p-6 bg-gray-50 rounded-lg">
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

                            // Use config for redirect URL
                            router.push(
                              `${config.redirectUrl}?${queryParams.toString()}`
                            );
                          } else {
                            // Handle payment not completed
                            console.error("Payment not completed");
                          }
                        } catch (error) {
                          console.error("Payment error:", error);
                        }
                      } else {
                        console.error("Payment token is undefined");
                      }
                    }}
                  >
                    <div className="max-w-md mx-auto">
                      <CreditCard />
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
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Alternative Registration Options
            </h2>
            <p className="text-lg mb-6">
              To register for this event, please contact us directly by phone or
              email.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <a
                href="tel:+1234567890"
                className="px-6 py-3 bg-primary text-black font-medium rounded-md hover:bg-blue-400 transition-colors border-2 border-black flex items-center justify-center"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Us
              </a>
              <a
                href="mailto:info@example.com"
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
                Email Us
              </a>
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
