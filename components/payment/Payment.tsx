"use client";

import { submitPayment } from "@/app/actions/actions";
import { useState, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RegistrationHeader from "./RegistrationHeader";
import BillingForm from "./BillingForm";
import PaymentProcessor from "./PaymentProcessor";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl: string;
}

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
  }>;
}

// Define the expected PaymentSubmitData interface based on PaymentProcessor's requirements
type PaymentSubmitData = {
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
  eventId: string;
  eventTitle: string;
  eventPrice: string;
};

// Define the expected PaymentResult interface based on PaymentProcessor's requirements
type PaymentResult = {
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
};

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
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{ categoryName: string; choiceName: string }>
  >([]);

  // State for handling participants
  const [isSigningUpForSelf, setIsSigningUpForSelf] = useState(true);
  const [participants, setParticipants] = useState<
    Array<{
      firstName: string;
      lastName: string;
      selectedOptions?: Array<{
        categoryName: string;
        choiceName: string;
      }>;
    }>
  >([]);

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
    numberOfPeople: 1,
  });

  // Calculate total price based on number of people
  const [totalPrice, setTotalPrice] = useState<string>("");

  // Adapter function to match the expected signature for PaymentProcessor
  const handleSubmitPayment = async (
    token: string,
    paymentData: PaymentSubmitData
  ): Promise<PaymentResult> => {
    try {
      const result = await submitPayment(token, {
        addressLine1: paymentData.addressLine1,
        addressLine2: paymentData.addressLine2,
        givenName: paymentData.givenName,
        familyName: paymentData.familyName,
        countryCode: paymentData.countryCode,
        city: paymentData.city,
        state: paymentData.state,
        postalCode: paymentData.postalCode,
        email: paymentData.email,
        phoneNumber: paymentData.phoneNumber,
        eventId: paymentData.eventId,
        eventTitle: paymentData.eventTitle,
        eventPrice: paymentData.eventPrice,
      });

      if (!result) {
        return {
          result: {
            payment: {
              status: "FAILED",
              id: "",
            },
          },
        };
      }

      // If payment is successful, submit customer details
      if (result.result?.payment?.status === "COMPLETED") {
        await submitCustomerDetails();
      }

      return {
        result: {
          payment: {
            status: result.result?.payment?.status || "FAILED",
            id: result.result?.payment?.id || "",
            receiptUrl: result.result?.payment?.receiptUrl,
            note: result.result?.payment?.note,
            amountMoney: {
              amount: Number(result.result?.payment?.amountMoney?.amount),
              currency: result.result?.payment?.amountMoney?.currency,
            },
            cardDetails: result.result?.payment?.cardDetails,
          },
        },
      };
    } catch (error) {
      console.error("Payment error:", error);
      return {
        result: {
          payment: {
            status: "FAILED",
            id: "",
          },
        },
      };
    }
  };

  // Fetch event details including options
  useEffect(() => {
    if (eventId) {
      const fetchEventDetails = async () => {
        try {
          const response = await fetch(`/api/event/${eventId}`);
          if (response.ok) {
            const data = await response.json();
            if (
              data.event &&
              data.event.options &&
              data.event.options.length > 0
            ) {
              // Update event options only if they've changed
              const newOptions = data.event.options;
              if (JSON.stringify(newOptions) !== JSON.stringify(eventOptions)) {
                setEventOptions(newOptions);

                // Initialize selectedOptions with the first choice of each category
                const initialSelectedOptions = newOptions.map(
                  (option: EventOption) => ({
                    categoryName: option.categoryName,
                    choiceName: option.choices[0]?.name || "",
                  })
                );
                setSelectedOptions(initialSelectedOptions);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
        }
      };

      fetchEventDetails();
    }
  }, [eventId]);

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
        // Calculate total price
        setTotalPrice((price * billingDetails.numberOfPeople).toFixed(2));
        setIsPriceAvailable(true);
      } else {
        setIsPriceAvailable(false);
      }
    } catch (e) {
      console.error("Error formatting price:", e);
      setIsPriceAvailable(false);
    }
  }, [eventPrice, billingDetails.numberOfPeople]);

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

  // Update participants when numberOfPeople changes or isSigningUpForSelf changes
  useEffect(() => {
    // If signing up for self with multiple people, we need (numberOfPeople - 1) additional participants
    if (isSigningUpForSelf) {
      const additionalPeople = Math.max(0, billingDetails.numberOfPeople - 1);
      const newParticipants = Array(additionalPeople)
        .fill(null)
        .map((_, index) => ({
          firstName: `Additional Person ${index + 1}`,
          lastName: "Pending",
          selectedOptions: [] as Array<{
            categoryName: string;
            choiceName: string;
          }>,
        }));
      setParticipants(newParticipants);
      console.log(
        "Self registration: Creating",
        additionalPeople,
        "additional participants"
      );
    } else {
      // If signing up for others, we need numberOfPeople participants
      const newParticipants = Array(billingDetails.numberOfPeople)
        .fill(null)
        .map((_, index) => ({
          firstName: `Participant ${index + 1}`,
          lastName: "Pending",
          selectedOptions: [] as Array<{
            categoryName: string;
            choiceName: string;
          }>,
        }));
      setParticipants(newParticipants);
      console.log(
        "Registering for others: Creating",
        billingDetails.numberOfPeople,
        "participants"
      );
    }
  }, [billingDetails.numberOfPeople, isSigningUpForSelf]);

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

  const handleOptionChange = (categoryName: string, choiceName: string) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      const existingOptionIndex = newOptions.findIndex(
        (option) => option.categoryName === categoryName
      );

      if (existingOptionIndex !== -1) {
        newOptions[existingOptionIndex] = { categoryName, choiceName };
      } else {
        newOptions.push({ categoryName, choiceName });
      }

      return newOptions;
    });
  };

  const submitCustomerDetails = async () => {
    if (!formValid) {
      setError("Please complete all required fields before submitting");
      return;
    }

    try {
      const roundedTotal = Math.round(parseFloat(totalPrice) * 100) / 100;

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventId,
          quantity: billingDetails.numberOfPeople,
          total: roundedTotal,
          isSigningUpForSelf: isSigningUpForSelf,
          participants,
          selectedOptions,
          billingInfo: {
            firstName: billingDetails.givenName,
            lastName: billingDetails.familyName,
            addressLine1: billingDetails.addressLine1,
            addressLine2: billingDetails.addressLine2,
            city: billingDetails.city,
            stateProvince: billingDetails.state,
            postalCode: billingDetails.postalCode,
            country: billingDetails.countryCode,
            emailAddress: billingDetails.email,
            phoneNumber: billingDetails.phoneNumber,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(
          `Customer details submitted successfully. ID: ${result.data._id}`
        );
      } else {
        console.error(`Customer details submission failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting customer details:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Event Header */}
        {eventTitle && (
          <RegistrationHeader
            eventTitle={eventTitle}
            formattedPrice={formattedPrice}
            isPriceAvailable={isPriceAvailable}
          />
        )}

        {isPriceAvailable ? (
          // Only show billing and payment form if price is available
          <div className="p-6 sm:p-10">
            {/* Billing Section */}
            <BillingForm
              billingDetails={billingDetails}
              handleInputChange={handleInputChange}
              isSigningUpForSelf={isSigningUpForSelf}
              setIsSigningUpForSelf={setIsSigningUpForSelf}
              eventOptions={eventOptions}
              participants={participants}
              setParticipants={setParticipants}
              selectedOptions={selectedOptions}
              handleOptionChange={handleOptionChange}
              formattedPrice={formattedPrice}
              totalPrice={totalPrice}
            />

            {/* Payment Section */}
            <PaymentProcessor
              error={error}
              setError={setError}
              isLoaded={isLoaded}
              config={config}
              formValid={formValid}
              billingDetails={billingDetails}
              eventId={eventId}
              eventTitle={eventTitle}
              eventPrice={eventPrice}
              formattedPrice={formattedPrice}
              totalPrice={totalPrice}
              submitPayment={handleSubmitPayment}
              router={router}
            />
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
