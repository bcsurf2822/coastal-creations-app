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
      <h3 className="text-lg font-medium text-gray-900">Pricing & Requirements</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price <span className="text-red-500">*</span>
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
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.minimum?.toString() || ""}
            onChange={(e) =>
              actions.handleInputChange("minimum", e.target.value ? Number(e.target.value) : 0)
            }
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
            min="1"
          />
          {errors.minimum && (
            <p className="text-red-600 text-sm mt-1">{errors.minimum}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unit <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.unit}
          onChange={(e) => actions.handleInputChange("unit", e.target.value)}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select unit type</option>
          <option value="participants">participants</option>
          <option value="people">people</option>
          <option value="hours">hours</option>
          <option value="guests">guests</option>
          <option value="children">children</option>
        </select>
        {errors.unit && (
          <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
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
              Private Event Pricing
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                Set your base price for the minimum number of {formData.unit || "participants"}.
                Customers will see this as a starting price for their private event inquiry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateEventPricingFields;