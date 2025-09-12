"use client";

import { useState, useEffect, useCallback, ReactElement } from "react";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  eventName: string;
  dates: {
    startDate: string;
    endDate?: string;
  };
  reservationSettings?: {
    dayPricing: Array<{
      numberOfDays: number;
      price: number;
      label?: string;
    }>;
    dailyCapacity?: number;
  };
}

interface SelectedDate {
  date: string;
  participantCount: number;
  participants: Array<{
    firstName: string;
    lastName: string;
  }>;
}

interface ReservationBookingFormProps {
  event: Event;
}

export default function ReservationBookingForm({
  event,
}: ReservationBookingFormProps): ReactElement {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "dates" | "participants" | "summary"
  >("dates");
  const [totalCost, setTotalCost] = useState(0);
  const [appliedPriceTier, setAppliedPriceTier] = useState<{
    numberOfDays: number;
    price: number;
    label?: string;
  } | null>(null);
  const router = useRouter();

  // Generate available dates
  useEffect(() => {
    if (event.dates.startDate && event.dates.endDate) {
      const dates = generateDateRange(
        event.dates.startDate,
        event.dates.endDate
      );
      setAvailableDates(dates);
    }
  }, [event]);

  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(start);
    while (current <= end) {
      // Skip dates in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (current >= today) {
        dates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const calculatePricing = useCallback((): void => {
    if (!selectedDates.length || !event.reservationSettings?.dayPricing) {
      setTotalCost(0);
      setAppliedPriceTier(null);
      return;
    }

    const totalDays = selectedDates.length;
    const totalParticipants = selectedDates.reduce(
      (sum, date) => sum + date.participantCount,
      0
    );

    // Find the best pricing tier based on number of days
    const pricingTiers = [...event.reservationSettings.dayPricing].sort(
      (a, b) => b.numberOfDays - a.numberOfDays
    );
    const selectedTier =
      pricingTiers.find((tier) => totalDays >= tier.numberOfDays) ||
      pricingTiers[pricingTiers.length - 1];

    setAppliedPriceTier(selectedTier);

    // Calculate total: each participant-day at the tier price
    const cost = totalParticipants * selectedTier.price;
    setTotalCost(cost);
  }, [selectedDates, event.reservationSettings?.dayPricing]);

  // Calculate pricing when selected dates change
  useEffect(() => {
    calculatePricing();
  }, [selectedDates, event.reservationSettings, calculatePricing]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateToggle = (date: string): void => {
    const isSelected = selectedDates.find((sd) => sd.date === date);

    if (isSelected) {
      setSelectedDates(selectedDates.filter((sd) => sd.date !== date));
    } else {
      setSelectedDates([
        ...selectedDates,
        {
          date,
          participantCount: 1,
          participants: [{ firstName: "", lastName: "" }],
        },
      ]);
    }
  };

  const handleParticipantCountChange = (date: string, count: number): void => {
    const maxCapacity = event.reservationSettings?.dailyCapacity || 20;
    const validCount = Math.max(1, Math.min(count, maxCapacity));

    setSelectedDates(
      selectedDates.map((sd) => {
        if (sd.date === date) {
          const newParticipants = Array.from(
            { length: validCount },
            (_, index) =>
              sd.participants[index] || { firstName: "", lastName: "" }
          );
          return {
            ...sd,
            participantCount: validCount,
            participants: newParticipants,
          };
        }
        return sd;
      })
    );
  };

  const handleParticipantDetailChange = (
    date: string,
    participantIndex: number,
    field: "firstName" | "lastName",
    value: string
  ): void => {
    setSelectedDates(
      selectedDates.map((sd) => {
        if (sd.date === date) {
          const updatedParticipants = [...sd.participants];
          updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            [field]: value,
          };
          return { ...sd, participants: updatedParticipants };
        }
        return sd;
      })
    );
  };

  const proceedToPayment = (): void => {
    // Prepare booking data
    const bookingData = {
      eventId: event._id,
      selectedDates: selectedDates.map((sd) => ({
        date: sd.date,
        participantCount: sd.participantCount,
        participants: sd.participants.filter(
          (p) => p.firstName.trim() && p.lastName.trim()
        ),
      })),
      appliedPriceTier,
      totalCost,
      totalDays: selectedDates.length,
      totalParticipants: selectedDates.reduce(
        (sum, date) => sum + date.participantCount,
        0
      ),
    };

    // Store booking data in session storage for the payment page
    sessionStorage.setItem("reservationBooking", JSON.stringify(bookingData));

    // Navigate to payment page
    router.push("/payments");
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case "dates":
        return selectedDates.length > 0;
      case "participants":
        return selectedDates.every(
          (sd) =>
            sd.participantCount > 0 &&
            sd.participants
              .slice(0, sd.participantCount)
              .every((p) => p.firstName.trim() && p.lastName.trim())
        );
      case "summary":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <div className="flex items-center space-x-8">
        {[
          { key: "dates", label: "1. Select Dates", icon: "📅" },
          { key: "participants", label: "2. Participants", icon: "👥" },
          { key: "summary", label: "3. Summary", icon: "📋" },
        ].map((step) => (
          <div
            key={step.key}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === step.key
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : selectedDates.length > 0 &&
                    (step.key === "dates" ||
                      (step.key === "participants" && currentStep !== "dates"))
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className="text-lg">{step.icon}</span>
            <span className="font-medium">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === "dates" && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Select Your Dates
          </h3>
          <p className="text-gray-600 mb-6">
            Choose the days you want to participate. You can select any
            combination of available dates.
          </p>

          {availableDates.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-700">
                No dates are currently available for booking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {availableDates.map((date) => {
                const isSelected = selectedDates.find((sd) => sd.date === date);
                return (
                  <button
                    key={date}
                    onClick={() => handleDateToggle(date)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{formatDate(date)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedDates.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                Selected {selectedDates.length} day
                {selectedDates.length > 1 ? "s" : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedDates.map((sd) => (
                  <span
                    key={sd.date}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {formatDate(sd.date)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setCurrentStep("participants")}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isStepValid()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Participants
            </button>
          </div>
        </div>
      )}

      {currentStep === "participants" && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Set Participants for Each Day
          </h3>
          <p className="text-gray-600 mb-6">
            Specify how many participants for each selected date and provide
            their details.
          </p>

          <div className="space-y-8">
            {selectedDates
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((selectedDate) => (
                <div
                  key={selectedDate.date}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {formatFullDate(selectedDate.date)}
                  </h4>

                  {/* Participant Count */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Participants
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          handleParticipantCountChange(
                            selectedDate.date,
                            selectedDate.participantCount - 1
                          )
                        }
                        disabled={selectedDate.participantCount <= 1}
                        className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center font-semibold"
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">
                        {selectedDate.participantCount}
                      </span>
                      <button
                        onClick={() =>
                          handleParticipantCountChange(
                            selectedDate.date,
                            selectedDate.participantCount + 1
                          )
                        }
                        disabled={
                          !!(
                            event.reservationSettings?.dailyCapacity &&
                            selectedDate.participantCount >=
                              event.reservationSettings.dailyCapacity
                          )
                        }
                        className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center font-semibold"
                      >
                        +
                      </button>
                      {event.reservationSettings?.dailyCapacity && (
                        <span className="text-sm text-gray-500">
                          (Max: {event.reservationSettings.dailyCapacity})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Participant Details */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">
                      Participant Details
                    </h5>
                    <div className="grid gap-4">
                      {Array.from(
                        { length: selectedDate.participantCount },
                        (_, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 grid grid-cols-2 gap-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name {index + 1}
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedDate.participants[index]?.firstName ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleParticipantDetailChange(
                                    selectedDate.date,
                                    index,
                                    "firstName",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter first name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name {index + 1}
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedDate.participants[index]?.lastName ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleParticipantDetailChange(
                                    selectedDate.date,
                                    index,
                                    "lastName",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep("dates")}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Dates
            </button>
            <button
              onClick={() => setCurrentStep("summary")}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isStepValid()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Summary
            </button>
          </div>
        </div>
      )}

      {currentStep === "summary" && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Booking Summary
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            {/* Event Info */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {event.eventName}
              </h4>
              <p className="text-gray-600">Multi-day creative experience</p>
            </div>

            {/* Selected Dates */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">
                Selected Dates & Participants
              </h4>
              <div className="space-y-3">
                {selectedDates
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((sd) => (
                    <div
                      key={sd.date}
                      className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatFullDate(sd.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sd.participantCount} participant
                          {sd.participantCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          $
                          {appliedPriceTier
                            ? (
                                sd.participantCount * appliedPriceTier.price
                              ).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pricing Details */}
            {appliedPriceTier && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Applied Pricing Tier:</span>
                  <span className="font-medium">
                    {appliedPriceTier.numberOfDays} day
                    {appliedPriceTier.numberOfDays > 1 ? "s" : ""}: $
                    {appliedPriceTier.price}
                    {appliedPriceTier.label && ` (${appliedPriceTier.label})`}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Days:</span>
                  <span className="font-medium">{selectedDates.length}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total Participant-Days:</span>
                  <span className="font-medium">
                    {selectedDates.reduce(
                      (sum, date) => sum + date.participantCount,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total Cost:</span>
                  <span className="text-green-600">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep("participants")}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Participants
            </button>
            <button
              onClick={proceedToPayment}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
