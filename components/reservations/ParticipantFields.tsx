"use client";

import { ReactElement, ChangeEvent } from "react";
import { ParticipantInfo, SelectedDate } from "./types";

interface ParticipantsByDate {
  date: Date;
  participants: ParticipantInfo[];
}

interface ParticipantFieldsProps {
  participantsByDate: ParticipantsByDate[];
  setParticipantsByDate: (participantsByDate: ParticipantsByDate[]) => void;
  selectedDates?: SelectedDate[]; // Optional, not currently used
}

export default function ParticipantFields({
  participantsByDate,
  setParticipantsByDate,
  selectedDates,
}: ParticipantFieldsProps): ReactElement {
  const handleParticipantChange = (
    dateIndex: number,
    participantIndex: number,
    field: keyof ParticipantInfo,
    value: string
  ): void => {
    console.log(
      `[ParticipantFields-handleParticipantChange] Updating date ${dateIndex}, participant ${participantIndex}, field ${field}`
    );
    const updated = [...participantsByDate];
    updated[dateIndex].participants[participantIndex] = {
      ...updated[dateIndex].participants[participantIndex],
      [field]: value,
    };
    setParticipantsByDate(updated);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Participant Names by Date
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Please provide the names of participants for each selected date. Contact information will be collected in the billing section below.
      </p>

      <div className="space-y-8">
        {participantsByDate.map((dayData, dateIndex) => (
          <div key={dateIndex} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDate(dayData.date)} - {dayData.participants.length} participant{dayData.participants.length !== 1 ? 's' : ''}
            </h4>

            <div className="space-y-6 bg-white p-4 rounded-lg">
              {dayData.participants.map((participant, participantIndex) => (
                <div
                  key={participantIndex}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <h5 className="font-medium text-gray-700 mb-3">
                    Participant {participantIndex + 1}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participant.firstName}
                        placeholder="Enter First Name"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleParticipantChange(
                            dateIndex,
                            participantIndex,
                            "firstName",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participant.lastName}
                        placeholder="Enter Last Name"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleParticipantChange(
                            dateIndex,
                            participantIndex,
                            "lastName",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
