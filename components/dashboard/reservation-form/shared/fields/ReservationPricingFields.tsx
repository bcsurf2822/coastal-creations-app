import { ReactElement } from "react";
import {
  ReservationFormState,
  ReservationFormActions,
} from "../types/reservationForm.types";
import {
  formatNumberInput,
  parseNumberValue,
} from "../../../event-form/shared/utils/formHelpers";

interface ReservationPricingFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationPricingFields = ({
  formData,
  actions,
  errors,
}: ReservationPricingFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pricing & Capacity</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Day Per Participant{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="text"
              value={formData.pricePerDayPerParticipant?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (formatNumberInput(value) === value) {
                  actions.handleInputChange(
                    "pricePerDayPerParticipant",
                    parseNumberValue(value)
                  );
                }
              }}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {errors.pricePerDayPerParticipant && (
            <p className="text-red-600 text-sm mt-1">
              {errors.pricePerDayPerParticipant}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Participants Per Day <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.maxParticipantsPerDay?.toString() || ""}
            onChange={(e) =>
              actions.handleInputChange(
                "maxParticipantsPerDay",
                e.target.value ? Number(e.target.value) : 0
              )
            }
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select daily capacity</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num.toString()}>
                {num} participant{num > 1 ? "s" : ""} per day
              </option>
            ))}
          </select>
          {errors.maxParticipantsPerDay && (
            <p className="text-red-600 text-sm mt-1">
              {errors.maxParticipantsPerDay}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Pricing Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Customers will pay the daily rate multiplied by the number of
                days they select. You can offer discounts for booking multiple
                days in the discount section below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPricingFields;
