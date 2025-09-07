"use client";

import { ReactElement } from "react";

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

interface EventDetails {
  eventName: string;
  description: string;
  eventType: string;
}

interface ReservationSummaryProps {
  reservationBooking: ReservationBooking;
  eventDetails: EventDetails | null;
}

export default function ReservationSummary({
  reservationBooking,
  eventDetails
}: ReservationSummaryProps): ReactElement {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reservation Summary
        </h2>
        {eventDetails && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {eventDetails.eventName}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Multi-day Experience</p>
          </div>
        )}
      </div>

      {/* Selected Dates */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Selected Dates & Participants
        </h4>
        <div className="space-y-3">
          {reservationBooking.selectedDates
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((selectedDate, index) => (
              <div 
                key={selectedDate.date} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {formatDate(selectedDate.date)}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {selectedDate.participantCount} participant{selectedDate.participantCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ${(selectedDate.participantCount * reservationBooking.appliedPriceTier.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${reservationBooking.appliedPriceTier.price} per person
                    </p>
                  </div>
                </div>

                {/* Participant List */}
                {selectedDate.participants.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDate.participants.slice(0, selectedDate.participantCount).map((participant, pIndex) => (
                        <div 
                          key={pIndex}
                          className="bg-white rounded px-3 py-2 border border-gray-100"
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {participant.firstName} {participant.lastName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{reservationBooking.totalDays}</p>
          <p className="text-sm text-blue-700 font-medium">Total Days</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{reservationBooking.totalParticipants}</p>
          <p className="text-sm text-green-700 font-medium">Participant-Days</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-purple-600">
            ${reservationBooking.appliedPriceTier.price}
          </p>
          <p className="text-sm text-purple-700 font-medium">Per Person/Day</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-orange-600">
            ${reservationBooking.totalCost.toFixed(2)}
          </p>
          <p className="text-sm text-orange-700 font-medium">Total Cost</p>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Pricing Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pricing Tier Applied:</span>
            <span className="font-medium">
              {reservationBooking.appliedPriceTier.numberOfDays} day{reservationBooking.appliedPriceTier.numberOfDays > 1 ? 's' : ''}: ${reservationBooking.appliedPriceTier.price}
              {reservationBooking.appliedPriceTier.label && ` (${reservationBooking.appliedPriceTier.label})`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Dates:</span>
            <span className="font-medium">
              {reservationBooking.selectedDates
                .map(sd => formatShortDate(sd.date))
                .join(', ')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="font-semibold text-gray-800">Calculation:</span>
            <span className="font-medium">
              {reservationBooking.totalParticipants} participant-days × ${reservationBooking.appliedPriceTier.price}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-400">
            <span>Total:</span>
            <span>${reservationBooking.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Important Notes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Payment confirmation will be sent to your email address</li>
          <li>• Participant details can be updated up to 24 hours before each event date</li>
          <li>• Each selected date is treated as an individual session</li>
          <li>• Cancellation policy applies to each date separately</li>
        </ul>
      </div>
    </div>
  );
}