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
  // Don't render for artist events or free events
  if (formData.eventType === "artist" || formData.isFree) {
    return <></>;
  }

  const getFieldError = (fieldPath: string): string | null => {
    return errors[fieldPath] || null;
  };

  const handleDiscountToggle = (isChecked: boolean) => {
    actions.handleInputChange("isDiscountAvailable", isChecked);
    if (isChecked && !formData.discount) {
      actions.handleInputChange("discount", {
        type: "fixed" as const,
        value: 0,
        minParticipants: 2,
        name: "",
        description: "",
      });
    } else if (!isChecked) {
      actions.handleInputChange("discount", undefined);
    }
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (): string => {
    const price = formData.price || 0;
    const discountValue = formData.discount?.value || 0;
    const discountedPrice = price - discountValue;
    return discountedPrice > 0 ? `$${discountedPrice.toFixed(2)}` : "$0.00";
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
        <label className="text-sm font-medium text-gray-900">
          Discount Options
        </label>
      </div>

      {formData.isDiscountAvailable && formData.discount && (
        <div className="ml-6 space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Discount Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Name shown on event card
              </p>
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
                placeholder="e.g., Sibling Discount, Group Rate"
              />
              {getFieldError("discount.name") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("discount.name")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Discount Amount ($) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Amount to be taken off of final price
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-600 font-medium">
                  $
                </span>
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
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5.00"
                />
              </div>
              {getFieldError("discount.value") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("discount.value")}
                </p>
              )}

              {/* Discount Price Preview - Under discount amount */}
              {formData.price !== undefined && formData.price > 0 && formData.discount?.value > 0 && (
                <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Original: ${formData.price.toFixed(2)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-gray-800">
                      After Discount: {calculateDiscountedPrice()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Minimum Participants Required <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Discount will apply when this many participants sign up
            </p>
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

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Discount Description (Optional)
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
              placeholder="Optional: Additional details shown on payment page"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDiscountFields;
