"use client";

import { ReactElement, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";
import dynamic from "next/dynamic";
import { ParticipantInfo, BillingInfo, SelectedDate } from "./types";
import ParticipantFields from "./ParticipantFields";
import BillingFields from "./BillingFields";

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
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<string>("");
  const [applicationId, setApplicationId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");

  interface ParticipantsByDate {
    date: Date;
    participants: ParticipantInfo[];
  }

  const [participantsByDate, setParticipantsByDate] = useState<
    ParticipantsByDate[]
  >(
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

  const calculateOptionsTotal = (): number => {
    let total = 0;
    participantsByDate.forEach((dayData) => {
      dayData.participants.forEach((participant) => {
        if (participant.selectedOptions) {
          participant.selectedOptions.forEach((selectedOption) => {
            const option = reservation.options?.find(
              (o) => o.categoryName === selectedOption.categoryName
            );
            const choice = option?.choices.find(
              (c) => c.name === selectedOption.choiceName
            );
            if (choice?.price) {
              total += choice.price;
            }
          });
        }
      });
    });
    return total;
  };

  const optionsTotal = calculateOptionsTotal();

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
    const loadConfig = async (): Promise<void> => {
      try {
        const response = await fetch("/api/payment-config");
        if (!response.ok) {
          throw new Error("Failed to fetch payment configuration");
        }
        const config = await response.json();
        setApplicationId(config.applicationId);
        setLocationId(config.locationId);
      } catch (error) {
        console.error("[PaymentForm-loadConfig] Error loading config:", error);
        setErrors("Failed to load payment system. Please refresh the page.");
      }
    };

    loadConfig();
  }, []);

  const handleBillingInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = (): boolean => {
    const participantsValid = participantsByDate.every((dayData) =>
      dayData.participants.every((p) => p.firstName && p.lastName)
    );
    const billingValid =
      !!billingInfo.firstName &&
      !!billingInfo.lastName &&
      !!billingInfo.emailAddress &&
      !!billingInfo.phoneNumber &&
      !!billingInfo.addressLine1 &&
      !!billingInfo.city &&
      !!billingInfo.stateProvince &&
      !!billingInfo.postalCode &&
      !!billingInfo.country;

    return participantsValid && billingValid;
  };

  const validateForm = (): boolean => {
    const participantsValid = participantsByDate.every((dayData) =>
      dayData.participants.every((p) => p.firstName && p.lastName)
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

  const handleCardTokenizeResponse = async (token: {
    token?: string;
    status?: string;
  }): Promise<void> => {
    setErrors("");

    if (!validateForm()) {
      setPaymentStatus("error");
      return;
    }

    if (!token.token) {
      console.error(
        "[PaymentForm-handleCardTokenizeResponse] No token received"
      );
      setErrors("Payment processing failed. Please check your card details.");
      setPaymentStatus("error");
      return;
    }

    setPaymentStatus("processing");

    try {
      // Flatten all participants from all dates into a single array
      // Each participant already has their selectedOptions attached
      const allParticipants = participantsByDate.flatMap(
        (dayData) => dayData.participants
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
        participants: allParticipants, // Each participant has their own selectedOptions
        billingInfo,
        squarePaymentId: token.token,
      };

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "[PaymentForm-handleSubmit] Booking creation failed:",
          result
        );
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

      setPaymentStatus("success");
      router.push(
        `/reservations/confirmation?bookingId=${result.data._id}&total=${grandTotal}&name=${encodeURIComponent(reservation.eventName)}`
      );
    } catch (error) {
      console.error(
        "[PaymentForm-handleSubmit] Error processing payment:",
        error
      );
      await fetch("/api/payment-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorType: "payment_exception",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          reservationId: reservation._id,
          totalAmount: grandTotal,
        }),
      });
      setErrors("An error occurred. Please try again.");
      setPaymentStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header Section - Styled like regular payment portal */}
        <div className="bg-primary text-black p-6 sm:p-10 mb-6 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 text-black">Registration</h1>
            <p className="text-xl mb-2 font-medium text-black">
              You&apos;re registering for:{" "}
              <span className="font-bold text-black">
                {reservation.eventName}
              </span>
            </p>
            <div className="mt-4">
              <div className="bg-white/70 py-3 px-8 rounded-full inline-block shadow-md">
                <p className="text-xl">
                  <span className="font-medium text-black">Price:</span>{" "}
                  <span className="font-bold text-black">
                    ${grandTotal.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-32 -mt-32 z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/40 rounded-full -ml-24 -mb-24 z-0"></div>
        </div>

        <div className="p-6 sm:p-10">
          {/* Booking Summary Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Booking Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Selected Dates:
                </span>
                <span className="font-semibold text-gray-900">
                  {selectedDates.length}{" "}
                  {selectedDates.length === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Total Participants:
                </span>
                <span className="font-semibold text-gray-900">
                  {participantsByDate.reduce(
                    (sum, dayData) => sum + dayData.participants.length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Base Price:</span>
                <span className="font-semibold text-gray-900">
                  ${baseTotal.toFixed(2)}
                </span>
              </div>
              {optionsTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Options:</span>
                  <span className="font-semibold text-gray-900">
                    +${optionsTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <ParticipantFields
            participantsByDate={participantsByDate}
            setParticipantsByDate={setParticipantsByDate}
            options={reservation.options}
          />

          {/* Billing Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Billing Information
            </h2>
            <BillingFields
              billingInfo={billingInfo}
              onInputChange={handleBillingInputChange}
            />
          </div>

          {/* Payment Details Section */}
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
            {errors && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                role="alert"
              >
                <strong className="font-bold">Payment Error: </strong>
                <span className="block sm:inline">{errors}</span>
              </div>
            )}

            {/* Processing Status */}
            {paymentStatus === "processing" && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-blue-700 font-semibold flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing payment...
                </p>
              </div>
            )}

            {applicationId && locationId ? (
              <div className="p-6 bg-gray-50 rounded-lg">
                {/* Yellow Warning Box */}
                {!isFormValid() && (
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
                      <p>
                        Please complete all required fields above before
                        proceeding with payment. You must provide either an
                        email address or phone number.
                      </p>
                    </div>
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
                  <div className="max-w-md mx-auto">
                    <DynamicCreditCard />
                    {!isFormValid() && (
                      <div className="mt-4 text-red-600 text-center text-sm font-medium">
                        Please complete all required fields above before
                        submitting payment
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
                Secure payment processing by{" "}
                <PiSquareLogoFill className="text-xl" /> Square
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
