import { ReactElement } from "react";
import { PrivateEventFieldsProps } from "../types/privateEventForm.types";
import {
  formatNumberInput,
  parseNumberValue,
} from "../../../event-form/shared/utils/formHelpers";

const PrivateEventPricingFields = ({
  formData,
  actions,
  errors,
}: PrivateEventFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Per Person <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="text"
            value={formData.price?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (formatNumberInput(value) === value) {
                actions.handleInputChange("price", parseNumberValue(value));
              }
            }}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.00"
          />
        </div>
        {errors.price && (
          <p className="text-red-600 text-sm mt-1">{errors.price}</p>
        )}
      </div>

      {/* Deposit Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isDepositRequired || false}
            onChange={(e) =>
              actions.handleInputChange("isDepositRequired", e.target.checked)
            }
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label className="text-sm font-medium text-gray-700">
            Require Deposit
          </label>
        </div>

        {formData.isDepositRequired && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={formData.depositAmount?.toString() || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (formatNumberInput(value) === value) {
                    actions.handleInputChange(
                      "depositAmount",
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
                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
            {errors.depositAmount && (
              <p className="text-red-600 text-sm mt-1">
                {errors.depositAmount}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-purple-400"
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
            <h3 className="text-sm font-medium text-purple-800">
              Private Event Deposit Amount
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                {formData.isDepositRequired && formData.depositAmount && (
                  <>
                    {" "}
                    A deposit of ${formData.depositAmount} will be required to
                    secure the booking.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateEventPricingFields;
