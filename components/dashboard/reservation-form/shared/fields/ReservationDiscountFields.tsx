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
      // Initialize with default discount
      actions.handleInputChange("discount", {
        type: "percentage" as const,
        value: 0,
        minDays: 3,
        name: "",
        description: "",
      });
    }
  };

  const updateDiscountField = (field: string, value: string | number) => {
    const currentDiscount = formData.discount || {
      type: "percentage" as const,
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
        <label htmlFor="discount-available" className="text-sm font-medium text-gray-700">
          Offer Multi-Day Booking Discount
        </label>
      </div>

      {formData.isDiscountAvailable && (
        <div className="space-y-4 border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-gray-900">Discount Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.discount?.type || "percentage"}
                onChange={(e) => updateDiscountField("type", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
              </select>
              {errors["discount.type"] && (
                <p className="text-red-600 text-sm mt-1">{errors["discount.type"]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.discount?.type === "fixed" && (
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                )}
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
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formData.discount?.type === "fixed" ? "pl-8" : ""
                  }`}
                  placeholder={formData.discount?.type === "percentage" ? "10" : "5.00"}
                />
                {formData.discount?.type === "percentage" && (
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                )}
              </div>
              {errors["discount.value"] && (
                <p className="text-red-600 text-sm mt-1">{errors["discount.value"]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Days Required <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.discount?.name || ""}
              onChange={(e) => updateDiscountField("name", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Multi-Day Savings"
            />
            {errors["discount.name"] && (
              <p className="text-red-600 text-sm mt-1">{errors["discount.name"]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.discount?.description || ""}
              onChange={(e) => updateDiscountField("description", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the discount offer..."
            />
            {errors["discount.description"] && (
              <p className="text-red-600 text-sm mt-1">{errors["discount.description"]}</p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              <strong>Example:</strong> If you set a 10% discount for 3+ days, customers booking
              3 or more days will automatically receive 10% off their total reservation cost.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDiscountFields;