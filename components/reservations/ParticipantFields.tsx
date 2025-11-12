"use client";

import { ReactElement, ChangeEvent } from "react";
import { ParticipantInfo } from "./types";

interface ParticipantsByDate {
  date: Date;
  participants: ParticipantInfo[];
}

interface ReservationOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
    price?: number;
  }>;
}

interface ParticipantFieldsProps {
  participantsByDate: ParticipantsByDate[];
  setParticipantsByDate: (participantsByDate: ParticipantsByDate[]) => void;
  options?: ReservationOption[];
}

export default function ParticipantFields({
  participantsByDate,
  setParticipantsByDate,
  options = [],
}: ParticipantFieldsProps): ReactElement {
  const handleParticipantChange = (
    dateIndex: number,
    participantIndex: number,
    field: keyof ParticipantInfo,
    value: string
  ): void => {
    const updated = [...participantsByDate];
    updated[dateIndex].participants[participantIndex] = {
      ...updated[dateIndex].participants[participantIndex],
      [field]: value,
    };
    setParticipantsByDate(updated);
  };

  const handleOptionChange = (
    dateIndex: number,
    participantIndex: number,
    categoryName: string,
    choiceName: string
  ): void => {
    const updated = [...participantsByDate];
    const participant = updated[dateIndex].participants[participantIndex];

    if (!participant.selectedOptions) {
      participant.selectedOptions = [];
    }

    const existingIndex = participant.selectedOptions.findIndex(
      (opt) => opt.categoryName === categoryName
    );

    if (choiceName === "None") {
      if (existingIndex !== -1) {
        participant.selectedOptions.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex !== -1) {
        participant.selectedOptions[existingIndex] = {
          categoryName,
          choiceName,
        };
      } else {
        participant.selectedOptions.push({ categoryName, choiceName });
      }
    }

    setParticipantsByDate(updated);
  };

  const getParticipantOption = (
    participant: ParticipantInfo,
    categoryName: string
  ): string => {
    const option = participant.selectedOptions?.find(
      (opt) => opt.categoryName === categoryName
    );
    return option?.choiceName || "None";
  };

  const formatChoiceDisplay = (choice: {
    name: string;
    price?: number;
  }): string => {
    if (!choice.price || choice.price === 0) {
      return `${choice.name} - Free`;
    }
    return `${choice.name} - $${choice.price.toFixed(2)}`;
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
        Please provide the names of participants for each selected date. Contact
        information will be collected in the billing section below.
      </p>

      <div className="space-y-8">
        {participantsByDate.map((dayData, dateIndex) => (
          <div
            key={dateIndex}
            className="border border-blue-200 rounded-lg p-4 bg-blue-50"
          >
            <h4 className="font-bold text-blue-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(dayData.date)} - {dayData.participants.length}{" "}
              participant{dayData.participants.length !== 1 ? "s" : ""}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  {options && options.length > 0 && (
                    <div className="mt-4 space-y-3 bg-gray-50 p-3 rounded-lg">
                      <h6 className="text-sm font-semibold text-gray-700">
                        Additional Options
                      </h6>
                      {options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {option.categoryName}
                            {option.categoryDescription && (
                              <span className="text-gray-500 text-xs ml-1">
                                - {option.categoryDescription}
                              </span>
                            )}
                          </label>
                          <select
                            value={getParticipantOption(
                              participant,
                              option.categoryName
                            )}
                            onChange={(e) =>
                              handleOptionChange(
                                dateIndex,
                                participantIndex,
                                option.categoryName,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          >
                            <option value="None">None</option>
                            {option.choices.map((choice, choiceIndex) => (
                              <option key={choiceIndex} value={choice.name}>
                                {formatChoiceDisplay(choice)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
