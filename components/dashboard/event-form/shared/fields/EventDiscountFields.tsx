import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { formatNumberInput } from "../utils/formHelpers";

interface EventDiscountFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventDiscountFields = ({
  formData,
  actions,
  errors,
}: EventDiscountFieldsProps): ReactElement => {
  // Don't render for artist events
  if (formData.eventType === "artist") {
    return <></>;
  }

  const getFieldError = (fieldPath: string): string | null => {
    return errors[fieldPath] || null;
  };

  const handleDiscountToggle = (isChecked: boolean) => {
    actions.handleInputChange("isDiscountAvailable", isChecked);
    if (isChecked && !formData.discount) {
      actions.handleInputChange("discount", {
        type: "percentage" as const,
        value: 0,
        minParticipants: 2,
        name: "",
        description: "",
      });
    } else if (!isChecked) {
      actions.handleInputChange("discount", undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.isDiscountAvailable || false}
          onChange={(e) => handleDiscountToggle(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Discount Options
        </label>
      </div>

      {formData.isDiscountAvailable && formData.discount && (
        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.discount?.name || ""}
              onChange={(e) =>
                actions.handleNestedChange("discount.name", e.target.value)
              }
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Discount Name to appear on class card"
            />
            {getFieldError("discount.name") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("discount.name")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discount?.type || "percentage"}
              onChange={(e) =>
                actions.handleNestedChange("discount.type", e.target.value)
              }
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            {getFieldError("discount.type") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("discount.type")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Amount / Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.discount?.value?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (formatNumberInput(value) === value) {
                  actions.handleNestedChange(
                    "discount.value",
                    value ? Number(value) : 0
                  );
                }
              }}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.discount?.type === "percentage"
                  ? "Enter percentage"
                  : "Enter dollar amount"
              }
            />
            {getFieldError("discount.value") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("discount.value")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Participants <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discount?.minParticipants?.toString() || "2"}
              onChange={(e) =>
                actions.handleNestedChange(
                  "discount.minParticipants",
                  Number(e.target.value)
                )
              }
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => (
                <option key={num} value={num}>
                  {num} participants
                </option>
              ))}
            </select>
            {getFieldError("discount.minParticipants") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("discount.minParticipants")}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Description
            </label>
            <textarea
              value={formData.discount?.description || ""}
              onChange={(e) =>
                actions.handleNestedChange("discount.description", e.target.value)
              }
              rows={2}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description that will display when condition is met in payments page"
            />
          </div>

          {/* Discount Calculation Preview */}
          {formData.price && formData.discount?.value && (
            <div className="md:col-span-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Current Price:</span> $
                {formData.price}
                <br />
                <span className="font-medium">Total Price after discount:</span>{" "}
                {(() => {
                  const price = formData.price || 0;
                  const discountValue = formData.discount?.value || 0;
                  const discountType = formData.discount?.type;

                  let discountedPrice: number;
                  if (discountType === "percentage") {
                    discountedPrice = price - (price * discountValue) / 100;
                  } else {
                    discountedPrice = price - discountValue;
                  }

                  return discountedPrice > 0
                    ? `${discountedPrice.toFixed(2)}`
                    : "$0.00";
                })()}
                <br />
                <span className="text-xs">
                  (Discount applied when {formData.discount?.minParticipants || 2} or more
                  participants sign up)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default EventDiscountFields;