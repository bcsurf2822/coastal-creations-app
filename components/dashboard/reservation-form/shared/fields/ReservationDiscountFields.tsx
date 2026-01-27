import { ReactElement } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
import { formatNumberInput, parseNumberValue } from "../../../event-form/shared/utils/formHelpers";

interface ReservationDiscountFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationDiscountFields = ({
  formData,
  actions,
  errors,
}: ReservationDiscountFieldsProps): ReactElement => {
  const handleDiscountAvailableChange = (isAvailable: boolean) => {
    actions.handleInputChange("isDiscountAvailable", isAvailable);
    if (!isAvailable) {
      actions.handleInputChange("discount", undefined);
    } else {
      // Initialize with default discount (fixed only)
      actions.handleInputChange("discount", {
        type: "fixed" as const,
        value: 0,
        minDays: 3,
        name: "",
        description: "",
      });
    }
  };

  const updateDiscountField = (field: string, value: string | number) => {
    const currentDiscount = formData.discount || {
      type: "fixed" as const,
      value: 0,
      minDays: 3,
      name: "",
      description: "",
    };

    actions.handleInputChange("discount", {
      ...currentDiscount,
      [field]: value,
    });
  };

  // Calculate discounted price per day
  const calculateDiscountedPrice = (): string => {
    const price = formData.pricePerDayPerParticipant || 0;
    const discountValue = formData.discount?.value || 0;
    const discountedPrice = price - discountValue;
    return discountedPrice > 0 ? `$${discountedPrice.toFixed(2)}` : "$0.00";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="discount-available"
          checked={formData.isDiscountAvailable}
          onChange={(e) => handleDiscountAvailableChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="discount-available" className="text-sm font-medium text-gray-900">
          Offer Multi-Day Booking Discount
        </label>
      </div>

      {formData.isDiscountAvailable && (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Discount Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Discount Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Name shown on reservation card
              </p>
              <input
                type="text"
                value={formData.discount?.name || ""}
                onChange={(e) => updateDiscountField("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Multi-Day Savings, Week Special"
              />
              {errors["discount.name"] && (
                <p className="text-red-600 text-sm mt-1">{errors["discount.name"]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Discount Amount ($) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Amount to be taken off of final price per day
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-600 font-medium">$</span>
                <input
                  type="text"
                  value={formData.discount?.value?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (formatNumberInput(value) === value) {
                      const parsedValue = parseNumberValue(value);
                      updateDiscountField("value", parsedValue ?? 0);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5.00"
                />
              </div>
              {errors["discount.value"] && (
                <p className="text-red-600 text-sm mt-1">{errors["discount.value"]}</p>
              )}

              {/* Discount Price Preview - Under discount amount */}
              {formData.pricePerDayPerParticipant !== undefined &&
               formData.pricePerDayPerParticipant > 0 &&
               formData.discount?.value &&
               formData.discount.value > 0 && (
                <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Original: ${formData.pricePerDayPerParticipant.toFixed(2)}/day</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-gray-800">
                      After Discount: {calculateDiscountedPrice()}/day
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Minimum Days Required <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Discount will apply when customer books this many days
            </p>
            <select
              value={formData.discount?.minDays?.toString() || "3"}
              onChange={(e) => updateDiscountField("minDays", Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => i + 2).map((num) => (
                <option key={num} value={num.toString()}>
                  {num} days or more
                </option>
              ))}
            </select>
            {errors["discount.minDays"] && (
              <p className="text-red-600 text-sm mt-1">{errors["discount.minDays"]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.discount?.description || ""}
              onChange={(e) => updateDiscountField("description", e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional: Additional details shown on payment page"
            />
            {errors["discount.description"] && (
              <p className="text-red-600 text-sm mt-1">{errors["discount.description"]}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDiscountFields;
