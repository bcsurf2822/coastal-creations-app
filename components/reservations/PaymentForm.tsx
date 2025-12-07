"use client";

import { ReactElement, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";
import dynamic from "next/dynamic";
import { ParticipantInfo, BillingInfo, SelectedDate } from "./types";
import ParticipantFields from "./ParticipantFields";
import BillingFields from "./BillingFields";
import WalletPayButtons from "@/components/payment/WalletPayButtons";
import GiftCardRedemption from "@/components/payment/GiftCardRedemption";
import { submitPayment } from "@/app/actions/actions";

interface AppliedGiftCard {
  giftCardId: string;
  gan: string;
  amountApplied: number;
  remainingBalance: number;
}

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
  const [baseUrl, setBaseUrl] = useState<string>("");

  // Gift card state
  const [appliedGiftCard, setAppliedGiftCard] =
    useState<AppliedGiftCard | null>(null);
  const [isProcessingGiftCardOrder, setIsProcessingGiftCardOrder] =
    useState(false);

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

  const [acknowledgedNonRefundable, setAcknowledgedNonRefundable] =
    useState<boolean>(false);

  const baseTotal = selectedDates.reduce(
    (sum, sd) => sum + sd.participants * reservation.pricePerDayPerParticipant,
    0
  );

  const grandTotal = baseTotal + optionsTotal;

  // Gift card calculations
  const grandTotalCents = Math.round(grandTotal * 100);
  const giftCardAmountApplied = appliedGiftCard?.amountApplied || 0;
  const remainingAmountCents = Math.max(
    0,
    grandTotalCents - giftCardAmountApplied
  );
  const remainingAmount = remainingAmountCents / 100;

  // Helper to redeem gift card
  const redeemGiftCard = async (
    giftCardId: string,
    amountCents: number,
    referenceId?: string
  ): Promise<boolean> => {
    try {
      console.log(
        "[PaymentForm-redeemGiftCard] Redeeming gift card:",
        giftCardId,
        "amount:",
        amountCents
      );
      const response = await fetch("/api/gift-cards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftCardId,
          amountCents,
          referenceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[PaymentForm-redeemGiftCard] Failed:", errorData);
        return false;
      }

      const result = await response.json();
      console.log(
        "[PaymentForm-redeemGiftCard] Success, new balance:",
        result.newBalance
      );
      return true;
    } catch (error) {
      console.error("[PaymentForm-redeemGiftCard] Error:", error);
      return false;
    }
  };

  // Handle gift card only order (when gift card covers full amount)
  const handleGiftCardOnlyOrder = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    if (!appliedGiftCard) {
      setErrors("No gift card applied");
      return;
    }

    setIsProcessingGiftCardOrder(true);
    setErrors("");

    try {
      // Step 1: Create or find Square customer
      let squareCustomerId: string | undefined;
      try {
        const customerResponse = await fetch("/api/square/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            email: billingInfo.emailAddress || undefined,
            phone: billingInfo.phoneNumber || undefined,
            address: {
              addressLine1: billingInfo.addressLine1,
              addressLine2: billingInfo.addressLine2,
              city: billingInfo.city,
              state: billingInfo.stateProvince,
              postalCode: billingInfo.postalCode,
              country: billingInfo.country,
            },
          }),
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          squareCustomerId = customerData.data?.customerId;
          console.log(
            "[PaymentForm-handleGiftCardOnlyOrder] Square customer:",
            squareCustomerId,
            customerData.data?.isNew ? "(new)" : "(existing)"
          );
        }
      } catch (customerError) {
        console.error(
          "[PaymentForm-handleGiftCardOnlyOrder] Failed to create Square customer:",
          customerError
        );
      }

      // Step 2: Redeem the gift card
      const redeemed = await redeemGiftCard(
        appliedGiftCard.giftCardId,
        appliedGiftCard.amountApplied,
        reservation._id
      );

      if (!redeemed) {
        setErrors("Failed to redeem gift card. Please try again.");
        setIsProcessingGiftCardOrder(false);
        return;
      }

      // Step 3: Create booking record in MongoDB
      const allParticipants = participantsByDate.flatMap(
        (dayData) => dayData.participants
      );

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
        billingInfo,
        squarePaymentId: `GIFTCARD-${appliedGiftCard.giftCardId}`,
        squareCustomerId,
      };

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "[PaymentForm-handleGiftCardOnlyOrder] Booking creation failed:",
          result
        );
        setErrors(result.error || "Booking failed. Please try again.");
        setIsProcessingGiftCardOrder(false);
        return;
      }

      // Success - redirect to confirmation
      router.push(
        `/reservations/confirmation?bookingId=${result.data._id}&total=${grandTotal}&name=${encodeURIComponent(reservation.eventName)}&paymentMethod=gift_card`
      );
    } catch (error) {
      console.error("[PaymentForm-handleGiftCardOnlyOrder] Error:", error);
      setErrors("An error occurred. Please try again.");
      setIsProcessingGiftCardOrder(false);
    }
  };

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

    // Set base URL for wallet payment redirects
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
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

    return participantsValid && billingValid && acknowledgedNonRefundable;
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
    if (!acknowledgedNonRefundable) {
      setErrors(
        "Please acknowledge that this reservation is non-refundable before proceeding"
      );
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
      // Step 1: Create or find Square customer BEFORE processing payment
      let squareCustomerId: string | undefined;
      try {
        const customerResponse = await fetch("/api/square/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            email: billingInfo.emailAddress || undefined,
            phone: billingInfo.phoneNumber || undefined,
            address: {
              addressLine1: billingInfo.addressLine1,
              addressLine2: billingInfo.addressLine2,
              city: billingInfo.city,
              state: billingInfo.stateProvince,
              postalCode: billingInfo.postalCode,
              country: billingInfo.country,
            },
          }),
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          squareCustomerId = customerData.data?.customerId;
          console.log(
            "[PaymentForm-handleCardTokenizeResponse] Square customer:",
            squareCustomerId,
            customerData.data?.isNew ? "(new)" : "(existing)"
          );
        }
      } catch (customerError) {
        console.error(
          "[PaymentForm-handleCardTokenizeResponse] Failed to create Square customer:",
          customerError
        );
      }

      // Step 2: Process the actual payment via Square
      console.log(
        "[PaymentForm-handleCardTokenizeResponse] Processing payment..."
      );
      const paymentResult = await submitPayment(token.token, {
        addressLine1: billingInfo.addressLine1,
        addressLine2: billingInfo.addressLine2,
        givenName: billingInfo.firstName,
        familyName: billingInfo.lastName,
        countryCode: billingInfo.country,
        city: billingInfo.city,
        state: billingInfo.stateProvince,
        postalCode: billingInfo.postalCode,
        email: billingInfo.emailAddress,
        phoneNumber: billingInfo.phoneNumber,
        eventId: reservation._id,
        eventTitle: reservation.eventName,
        // Charge only remaining amount after gift card
        eventPrice: remainingAmount.toFixed(2),
        squareCustomerId,
      });

      if (
        !paymentResult ||
        paymentResult.result?.payment?.status !== "COMPLETED"
      ) {
        console.error(
          "[PaymentForm-handleCardTokenizeResponse] Payment failed:",
          paymentResult?.result?.payment?.status
        );
        setErrors("Payment could not be completed. Please try again.");
        setPaymentStatus("error");
        return;
      }

      const squarePaymentId = paymentResult.result.payment.id;
      console.log(
        "[PaymentForm-handleCardTokenizeResponse] Payment completed:",
        squarePaymentId
      );

      // If a gift card was applied (partial payment), redeem it now
      if (appliedGiftCard) {
        console.log(
          "[PaymentForm-handleCardTokenizeResponse] Redeeming gift card for partial payment"
        );
        const redeemed = await redeemGiftCard(
          appliedGiftCard.giftCardId,
          appliedGiftCard.amountApplied,
          reservation._id
        );
        if (!redeemed) {
          console.error(
            "[PaymentForm-handleCardTokenizeResponse] Failed to redeem gift card - payment completed but gift card not redeemed"
          );
          // Note: We don't fail the payment here since the card was already charged
        }
      }

      // Step 3: Create booking record in MongoDB
      const allParticipants = participantsByDate.flatMap(
        (dayData) => dayData.participants
      );

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
        billingInfo,
        squarePaymentId,
        squareCustomerId,
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
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6 sm:p-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-[#326C85]">Registration</h1>
          <p className="text-lg text-gray-600 mb-4">
            You&apos;re registering for:{" "}
            <span className="font-semibold text-gray-800">
              {reservation.eventName}
            </span>
          </p>
          <div className="inline-flex items-center gap-2 bg-[#326C85] text-white py-2 px-6 rounded-lg">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold">${grandTotal.toFixed(2)}</span>
          </div>
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

          {/* Non-Refundable Acknowledgment */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedNonRefundable}
                onChange={(e) => setAcknowledgedNonRefundable(e.target.checked)}
                className="mt-1 h-5 w-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-gray-800 font-medium">
                I understand that this reservation is Non-refundable
              </span>
            </label>
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

            {/* Gift Card Section */}
            <div className="mb-6">
              <GiftCardRedemption
                totalAmount={grandTotalCents}
                onApply={setAppliedGiftCard}
                onRemove={() => setAppliedGiftCard(null)}
                appliedCard={appliedGiftCard}
              />
              {appliedGiftCard && remainingAmountCents > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-800">Order Total:</span>
                    <span className="text-blue-800">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700">Gift Card Applied:</span>
                    <span className="text-green-700">
                      -${(giftCardAmountApplied / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-blue-200">
                    <span className="text-blue-900">Remaining to Pay:</span>
                    <span className="text-blue-900">
                      ${remainingAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              {appliedGiftCard && remainingAmountCents === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium text-center mb-4">
                    Gift card covers the full amount - no additional payment
                    needed!
                  </p>
                  {!isFormValid() && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
                      <p>
                        Please complete all required fields above before
                        completing your order.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleGiftCardOnlyOrder}
                    disabled={!isFormValid() || isProcessingGiftCardOrder}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessingGiftCardOrder ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Complete Order with Gift Card
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {applicationId && locationId && remainingAmountCents > 0 ? (
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
                      // Use remaining amount after gift card
                      amount: remainingAmountCents.toString(),
                      label: appliedGiftCard ? "Remaining Balance" : "Total",
                    },
                  })}
                >
                  <div className="max-w-md mx-auto">
                    {/* Wallet Pay Buttons - Express Checkout */}
                    {baseUrl && (
                      <WalletPayButtons
                        redirectUrl={`${baseUrl}/payment/cashapp-callback`}
                        referenceId={reservation._id}
                      />
                    )}

                    {/* Credit Card Form */}
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
            ) : remainingAmountCents > 0 ? (
              // Show loading only when there's remaining balance to pay
              <div className="text-center p-10 bg-gray-50 rounded-lg">
                <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-primary"></div>
                <p className="mt-4 text-gray-600">Loading payment form...</p>
              </div>
            ) : null}

            {/* Trust Badges - only show when there's card payment involved */}
            {remainingAmountCents > 0 && (
              <>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col items-center gap-3">
                    {/* Security Text */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs">

                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 text-center mt-4">
                  <p className="flex items-center justify-center gap-1">
                    Secure payment processing by{" "}
                    <PiSquareLogoFill className="text-xl" /> Square
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
