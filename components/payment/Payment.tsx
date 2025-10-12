"use client";

import { submitPayment } from "@/app/actions/actions";
import { useState, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RegistrationHeader from "./RegistrationHeader";
import BillingForm from "./BillingForm";
import PaymentProcessor from "./PaymentProcessor";
import ReservationSummary from "./ReservationSummary";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl: string;
}

interface ReservationBooking {
  eventId: string;
  selectedDates: Array<{
    date: string;
    participantCount: number;
    participants: Array<{
      firstName: string;
      lastName: string;
    }>;
  }>;
  appliedPriceTier: {
    numberOfDays: number;
    price: number;
    label?: string;
  };
  totalCost: number;
  totalDays: number;
  totalParticipants: number;
}

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
    price?: number;
  }>;
}

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

  const [reservationBooking, setReservationBooking] =
    useState<ReservationBooking | null>(null);
  const [isReservationBooking, setIsReservationBooking] = useState(false);
  const [eventDetails, setEventDetails] = useState<{
    eventName: string;
    description: string;
    eventType: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const eventTitle = searchParams.get("eventTitle") || "";
  const eventPrice = searchParams.get("price") || "";
  const isPrivateEvent = searchParams.get("isPrivateEvent") === "true";

  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(true);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{ categoryName: string; choiceName: string }>
  >([]);

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

  const [discountInfo, setDiscountInfo] = useState<{
    isDiscountAvailable: boolean;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      minParticipants: number;
      description?: string;
    };
  }>({
    isDiscountAvailable: false,
  });
  const [currentParticipantCount, setCurrentParticipantCount] =
    useState<number>(0);

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

  const [totalPrice, setTotalPrice] = useState<string>("");

  const calculateDiscountedPrice = (
    basePrice: number,
    participantCount: number
  ): number => {
    if (!discountInfo.isDiscountAvailable || !discountInfo.discount)
      return basePrice;

    if (participantCount < discountInfo.discount.minParticipants)
      return basePrice;

    if (discountInfo.discount.type === "percentage") {
      return basePrice - (basePrice * discountInfo.discount.value) / 100;
    } else {
      return basePrice - discountInfo.discount.value;
    }
  };

  const getChoicePrice = (categoryName: string, choiceName: string): number => {
    const option = eventOptions.find(
      (opt) => opt.categoryName === categoryName
    );
    const choice = option?.choices.find((c) => c.name === choiceName);
    return choice?.price || 0;
  };

  const calculateTotalOptionCosts = (): number => {
    let totalOptionCost = 0;

    if (isSigningUpForSelf && selectedOptions.length > 0) {
      selectedOptions.forEach((selectedOption) => {
        totalOptionCost += getChoicePrice(
          selectedOption.categoryName,
          selectedOption.choiceName
        );
      });
    }

    participants.forEach((participant) => {
      if (participant.selectedOptions) {
        participant.selectedOptions.forEach((selectedOption) => {
          totalOptionCost += getChoicePrice(
            selectedOption.categoryName,
            selectedOption.choiceName
          );
        });
      }
    });

    return totalOptionCost;
  };
    
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

      if (result.result?.payment?.status === "COMPLETED") {
        const customerData = await submitCustomerDetails(
          paymentData.eventPrice,
          result.result.payment.id
        );

        if (customerData && customerData.data && customerData.data._id) {
          try {
            await fetch("/api/send-confirmation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                customerId: customerData.data._id,
                eventId: paymentData.eventId,
              }),
            });
          } catch (error) {
            console.error("Error sending confirmation email:", error);
          }
        }
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

  useEffect(() => {
    if (eventId) {
      const fetchEventDetails = async () => {
        try {
          const apiUrl = isPrivateEvent
            ? `/api/private-events/${eventId}`
            : `/api/event/${eventId}`;

          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            const eventData = isPrivateEvent ? data.privateEvent : data.event;

            if (eventData) {
              if (eventData.options && eventData.options.length > 0) {
                const newOptions = eventData.options;
                if (
                  JSON.stringify(newOptions) !== JSON.stringify(eventOptions)
                ) {
                  setEventOptions(newOptions);

                  const initialSelectedOptions = newOptions.map(
                    (option: EventOption) => ({
                      categoryName: option.categoryName,
                      choiceName: option.choices[0]?.name || "",
                    })
                  );
                  setSelectedOptions(initialSelectedOptions);
                }
              }

              if (!isPrivateEvent && eventData.isDiscountAvailable && eventData.discount) {
                setDiscountInfo({
                  isDiscountAvailable: eventData.isDiscountAvailable,
                  discount: eventData.discount,
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
        }
      };

      const fetchParticipantCount = async () => {
        try {
          const response = await fetch("/api/customer", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const responseText = await response.text();
          let result;
          try {
            result = responseText ? JSON.parse(responseText) : {};
          } catch (parseError) {
            console.error(
              "Failed to parse customer response as JSON:",
              parseError
            );
            return;
          }

          if (response.ok && result.data && Array.isArray(result.data)) {
            const participantCount = result.data
              .filter(
                (customer: { event?: { _id: string }; quantity: number }) =>
                  customer.event?._id === eventId
              )
              .reduce(
                (total: number, customer: { quantity: number }) =>
                  total + customer.quantity,
                0
              );

            setCurrentParticipantCount(participantCount);
          }
        } catch (error) {
          console.error("Error fetching participant count:", error);
        }
      };

      fetchEventDetails();
      fetchParticipantCount();
    }
  }, [eventId, eventOptions]);

  useEffect(() => {
    const reservationData = sessionStorage.getItem("reservationBooking");
    if (reservationData) {
      try {
        const booking: ReservationBooking = JSON.parse(reservationData);
        setReservationBooking(booking);
        setIsReservationBooking(true);

        const fetchReservationEventDetails = async () => {
          try {
            const response = await fetch(`/api/events/${booking.eventId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.event) {
                setEventDetails({
                  eventName: data.event.eventName,
                  description: data.event.description,
                  eventType: data.event.eventType,
                });
              }
            }
          } catch (error) {
            console.error("Error fetching reservation event details:", error);
          }
        };

        fetchReservationEventDetails();
      } catch (error) {
        console.error("Error parsing reservation booking data:", error);
        sessionStorage.removeItem("reservationBooking");
      }
    }
  }, []);

  useEffect(() => {
    try {
      if (!eventPrice) {
        setIsPriceAvailable(false);
        return;
      }

      const cleanPrice = eventPrice.replace(/[^\d.]/g, "");
      const basePrice = parseFloat(cleanPrice);

      if (!isNaN(basePrice)) {
        const discountedPrice = calculateDiscountedPrice(
          basePrice,
          billingDetails.numberOfPeople
        );

        setFormattedPrice(discountedPrice.toFixed(2));

        const baseTotalPrice = discountedPrice * billingDetails.numberOfPeople;
        const optionCosts = calculateTotalOptionCosts();
        const totalWithOptions = baseTotalPrice + optionCosts;

        setTotalPrice(totalWithOptions.toFixed(2));
        setIsPriceAvailable(true);
      } else {
        setIsPriceAvailable(false);
      }
    } catch (e) {
      console.error("Error formatting price:", e);
      setIsPriceAvailable(false);
    }
  }, [
    eventPrice,
    billingDetails.numberOfPeople,
    discountInfo,
    currentParticipantCount,
    selectedOptions,
    participants,
    calculateDiscountedPrice,
    calculateTotalOptionCosts,
  ]);

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

    const areParticipantNamesFilled = participants.every(
      (participant) =>
        participant.firstName.trim() !== "" &&
        participant.lastName.trim() !== ""
    );

    setFormValid(areRequiredFieldsFilled && areParticipantNamesFilled);
  }, [billingDetails, participants]);

  const getParticipantValidationError = (): string | null => {
    const missingNames = participants.filter(
      (participant) =>
        participant.firstName.trim() === "" ||
        participant.lastName.trim() === ""
    );

    if (missingNames.length === 0) return null;

    if (isSigningUpForSelf) {
      return `Please provide names for all additional participants. ${missingNames.length} participant${
        missingNames.length > 1 ? "s are" : " is"
      } missing required information.`;
    } else {
      return `Please provide names for all participants. ${missingNames.length} participant${
        missingNames.length > 1 ? "s are" : " is"
      } missing required information.`;
    }
  };

  useEffect(() => {
    if (isSigningUpForSelf) {
      const additionalPeople = Math.max(0, billingDetails.numberOfPeople - 1);
      const newParticipants = Array(additionalPeople)
        .fill(null)
        .map(() => ({
          firstName: "",
          lastName: "",
          selectedOptions: eventOptions.map((option) => ({
            categoryName: option.categoryName,
            choiceName: option.choices[0]?.name || "",
          })),
        }));
      setParticipants(newParticipants);
    } else {
      const newParticipants = Array(billingDetails.numberOfPeople)
        .fill(null)
        .map(() => ({
          firstName: "",
          lastName: "",
          selectedOptions: eventOptions.map((option) => ({
            categoryName: option.categoryName,
            choiceName: option.choices[0]?.name || "",
          })),
        }));
      setParticipants(newParticipants);
    }
  }, [billingDetails.numberOfPeople, isSigningUpForSelf, eventOptions]);

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

  const submitCustomerDetails = async (chargedAmount?: string, squarePaymentId?: string) => {
    if (!formValid) {
      setError("Please complete all required fields before submitting");
      return null;
    }

    try {
      const actualTotal = chargedAmount
        ? Math.round(parseFloat(chargedAmount) * 100) / 100
        : Math.round(parseFloat(totalPrice) * 100) / 100;

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventId,
          eventType: isPrivateEvent ? "PrivateEvent" : "Event",
          quantity: billingDetails.numberOfPeople,
          total: actualTotal,
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
          squarePaymentId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      } else {
        console.error(`Customer details submission failed: ${result.error}`);
        return null;
      }
    } catch (error) {
      console.error("Error submitting customer details:", error);
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {isReservationBooking && reservationBooking ? (
        <div className="space-y-6">
          {/* Reservation Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">
              Complete Your Reservation
            </h1>
            <p className="text-blue-100">
              Review your booking details and provide payment information
            </p>
          </div>

          <ReservationSummary
            reservationBooking={reservationBooking}
            eventDetails={eventDetails}
          />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Billing Information
            </h2>

            <BillingForm
              billingDetails={billingDetails}
              handleInputChange={handleInputChange}
              isSigningUpForSelf={true}
              setIsSigningUpForSelf={() => {}}
              eventOptions={[]}
              participants={[]}
              setParticipants={() => {}}
              selectedOptions={[]}
              handleOptionChange={() => {}}
              formattedPrice={reservationBooking.totalCost.toFixed(2)}
              totalPrice={reservationBooking.totalCost.toFixed(2)}
              originalPrice={reservationBooking.totalCost.toString()}
              discountInfo={{ isDiscountAvailable: false }}
              currentParticipantCount={reservationBooking.totalParticipants}
            />

            <PaymentProcessor
              error={error}
              setError={setError}
              isLoaded={isLoaded}
              config={config}
              formValid={formValid}
              billingDetails={billingDetails}
              eventId={reservationBooking.eventId}
              eventTitle={eventDetails?.eventName || "Reservation Event"}
              totalPrice={reservationBooking.totalCost.toFixed(2)}
              submitPayment={handleSubmitPayment}
              router={router}
              participants={[]}
              getParticipantValidationError={() => null}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Event Header */}
          {eventTitle && (
            <RegistrationHeader
              eventTitle={eventTitle}
              formattedPrice={formattedPrice}
              isPriceAvailable={isPriceAvailable}
              originalPrice={eventPrice}
              discountInfo={discountInfo}
              currentParticipantCount={currentParticipantCount}
              numberOfPeople={billingDetails.numberOfPeople}
            />
          )}

          {isPriceAvailable ? (
            <div className="p-6 sm:p-10">
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
                originalPrice={eventPrice}
                discountInfo={discountInfo}
                currentParticipantCount={currentParticipantCount}
              />

              <PaymentProcessor
                error={error}
                setError={setError}
                isLoaded={isLoaded}
                config={config}
                formValid={formValid}
                billingDetails={billingDetails}
                eventId={eventId}
                eventTitle={eventTitle}
                totalPrice={totalPrice}
                submitPayment={handleSubmitPayment}
                router={router}
                participants={participants}
                getParticipantValidationError={getParticipantValidationError}
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
                    (window.location.href = `mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`)
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
      )}
    </div>
  );
}
