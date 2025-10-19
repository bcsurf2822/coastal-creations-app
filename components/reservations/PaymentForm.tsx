"use client";

import { ReactElement, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";
import dynamic from "next/dynamic";
import { ParticipantInfo, BillingInfo, SelectedDate } from "./types";
import ParticipantFields from "./ParticipantFields";
import OptionsSelector from "./OptionsSelector";
import BillingFields from "./BillingFields";

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

interface Reservation {
  _id: string;
  eventName: string;
  description?: string;
  pricePerDayPerParticipant: number;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
}

interface PaymentFormProps {
  reservation: Reservation;
  selectedDates: SelectedDate[];
}

export default function PaymentForm({
  reservation,
  selectedDates,
}: PaymentFormProps): ReactElement {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string>("");
  const [applicationId, setApplicationId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");

  interface ParticipantsByDate {
    date: Date;
    participants: ParticipantInfo[];
  }

  const [participantsByDate, setParticipantsByDate] = useState<ParticipantsByDate[]>(
    selectedDates.map((sd) => ({
      date: sd.date,
      participants: Array(sd.participants)
        .fill(null)
        .map(() => ({
          firstName: "",
          lastName: "",
        })),
    }))
  );

  const [selectedOptions, setSelectedOptions] = useState<
    Array<{ categoryName: string; choiceName: string }>
  >([]);
  const [optionsTotal, setOptionsTotal] = useState<number>(0);

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "US",
    emailAddress: "",
    phoneNumber: "",
  });

  const baseTotal = selectedDates.reduce(
    (sum, sd) => sum + sd.participants * reservation.pricePerDayPerParticipant,
    0
  );

  const grandTotal = baseTotal + optionsTotal;

  useEffect(() => {
    console.log("[PaymentForm-useEffect] Fetching Square payment configuration");
    const loadConfig = async (): Promise<void> => {
      try {
        const response = await fetch("/api/payment-config");
        if (!response.ok) {
          throw new Error("Failed to fetch payment configuration");
        }
        const config = await response.json();
        setApplicationId(config.applicationId);
        setLocationId(config.locationId);
        console.log("[PaymentForm-loadConfig] Payment config loaded");
      } catch (error) {
        console.error("[PaymentForm-loadConfig] Error loading config:", error);
        setErrors("Failed to load payment system. Please refresh the page.");
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (reservation.options && reservation.options.length > 0) {
      const initialOptions = reservation.options.map((option) => ({
        categoryName: option.categoryName,
        choiceName: option.choices[0]?.name || "",
      }));
      setSelectedOptions(initialOptions);
    }
  }, [reservation.options]);

  const handleBillingInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (
    categoryName: string,
    choiceName: string,
    price: number
  ): void => {
    console.log(`[PaymentForm-handleOptionChange] Option changed: ${categoryName} = ${choiceName}`);
    setSelectedOptions((prev) => {
      const newOptions = [...prev];
      const existingIndex = newOptions.findIndex(
        (opt) => opt.categoryName === categoryName
      );
      if (existingIndex !== -1) {
        newOptions[existingIndex] = { categoryName, choiceName };
      } else {
        newOptions.push({ categoryName, choiceName });
      }
      return newOptions;
    });

    const totalOptionsPrice = selectedOptions.reduce((sum, opt) => {
      const option = reservation.options?.find(
        (o) => o.categoryName === opt.categoryName
      );
      const choice = option?.choices.find((c) => c.name === opt.choiceName);
      return sum + (choice?.price || 0);
    }, 0);
    setOptionsTotal(totalOptionsPrice + price);
  };

  const validateForm = (): boolean => {
    // Check all participants across all dates (only names required)
    const participantsValid = participantsByDate.every((dayData) =>
      dayData.participants.every(
        (p) => p.firstName && p.lastName
      )
    );
    const billingValid =
      billingInfo.firstName &&
      billingInfo.lastName &&
      billingInfo.emailAddress &&
      billingInfo.phoneNumber &&
      billingInfo.addressLine1 &&
      billingInfo.city &&
      billingInfo.stateProvince &&
      billingInfo.postalCode &&
      billingInfo.country;

    if (!participantsValid) {
      setErrors("Please complete all participant information for all dates");
      return false;
    }
    if (!billingValid) {
      setErrors("Please complete all billing information");
      return false;
    }
    return true;
  };

  const handleCardTokenizeResponse = async (
    token: { token?: string; status?: string }
  ): Promise<void> => {
    console.log("[PaymentForm-handleCardTokenizeResponse] Tokenization response received");
    setErrors("");

    if (!validateForm()) {
      setPaymentStatus("error");
      return;
    }

    if (!token.token) {
      console.error("[PaymentForm-handleCardTokenizeResponse] No token received");
      setErrors("Payment processing failed. Please check your card details.");
      setPaymentStatus("error");
      return;
    }

    setPaymentStatus("processing");

    try {
      // Flatten all participants from all dates into a single array
      const allParticipants = participantsByDate.flatMap((dayData) =>
        dayData.participants
      );

      // Calculate total participants
      const totalParticipants = participantsByDate.reduce(
        (sum, dayData) => sum + dayData.participants.length,
        0
      );

      const bookingData = {
        event: reservation._id,
        eventType: "Reservation" as const,
        selectedDates: selectedDates.map((sd) => ({
          date: sd.date.toISOString(),
          numberOfParticipants: sd.participants,
        })),
        quantity: totalParticipants,
        total: grandTotal,
        isSigningUpForSelf: false,
        participants: allParticipants,
        selectedOptions,
        billingInfo,
        squarePaymentId: token.token,
      };

      console.log("[PaymentForm-handleSubmit] Creating booking with data:", bookingData);

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("[PaymentForm-handleSubmit] Booking creation failed:", result);
        await fetch("/api/payment-errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            errorType: "booking_creation_failed",
            errorMessage: result.error || "Unknown error",
            reservationId: reservation._id,
            totalAmount: grandTotal,
          }),
        });
        setErrors(result.error || "Booking failed. Please try again.");
        setPaymentStatus("error");
        return;
      }

      console.log("[PaymentForm-handleSubmit] Booking created successfully:", result.data._id);
      setPaymentStatus("success");
      router.push(`/reservations/confirmation?bookingId=${result.data._id}&total=${grandTotal}&name=${encodeURIComponent(reservation.eventName)}`);
    } catch (error) {
      console.error("[PaymentForm-handleSubmit] Error processing payment:", error);
      await fetch("/api/payment-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorType: "payment_exception",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          reservationId: reservation._id,
          totalAmount: grandTotal,
        }),
      });
      setErrors("An error occurred. Please try again.");
      setPaymentStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Complete Your Reservation</h1>
          <p className="text-blue-100">Review booking details and complete payment</p>
        </div>

        <div className="p-6">
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Reservation:</span>
                <span>{reservation.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Selected Dates:</span>
                <span>{selectedDates.length} days</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Participant Slots:</span>
                <span>
                  {participantsByDate.reduce(
                    (sum, dayData) => sum + dayData.participants.length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Base Price:</span>
                <span>${baseTotal.toFixed(2)}</span>
              </div>
              {optionsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Options:</span>
                  <span>+${optionsTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <ParticipantFields
            participantsByDate={participantsByDate}
            setParticipantsByDate={setParticipantsByDate}
          />

          {reservation.options && reservation.options.length > 0 && (
            <OptionsSelector
              options={reservation.options}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
            />
          )}

          <BillingFields
            billingInfo={billingInfo}
            onInputChange={handleBillingInputChange}
          />

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <PiSquareLogoFill className="mr-2 text-2xl text-black" />
              Payment Information
            </h3>
            {errors && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{errors}</p>
              </div>
            )}
            {applicationId && locationId ? (
              <div>
                {paymentStatus === "processing" && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 font-semibold">Processing payment...</p>
                  </div>
                )}
                <DynamicPaymentForm
                  applicationId={applicationId}
                  locationId={locationId}
                  cardTokenizeResponseReceived={handleCardTokenizeResponse}
                  createPaymentRequest={() => ({
                    countryCode: "US",
                    currencyCode: "USD",
                    total: {
                      amount: (grandTotal * 100).toString(),
                      label: "Total",
                    },
                  })}
                >
                  <DynamicCreditCard />
                </DynamicPaymentForm>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">Loading payment form...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
