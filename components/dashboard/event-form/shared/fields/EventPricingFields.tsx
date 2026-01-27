import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { formatNumberInput, parseNumberValue } from "../utils/formHelpers";
import { Input, Select, Label } from "@/components/ui";

interface EventPricingFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventPricingFields = ({
  formData,
  actions,
  errors,
}: EventPricingFieldsProps): ReactElement => {
  // Don't render for artist events
  if (formData.eventType === "artist") {
    return <></>;
  }

  const handleFreeToggle = (isFree: boolean) => {
    actions.handleInputChange("isFree", isFree);
    if (isFree) {
      actions.handleInputChange("price", 0);
      // Disable discount when event is free
      actions.handleInputChange("isDiscountAvailable", false);
      actions.handleInputChange("discount", undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Free Event Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isFree"
          checked={formData.isFree || false}
          onChange={(e) => handleFreeToggle(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isFree" className="text-sm font-medium text-gray-900">
          This is a free event
        </label>
      </div>

      {formData.isFree && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            This event is free. Customers can register without entering payment information.
            The event card will display a &quot;Free&quot; label.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!formData.isFree && (
          <div>
            <Label htmlFor="price" required>Price</Label>
            <Input
              type="text"
              id="price"
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
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              placeholder="Enter Price"
              error={!!errors.price}
            />
            {errors.price && (
              <p className="text-[var(--color-error)] text-sm mt-1">{errors.price}</p>
            )}
          </div>
        )}

        <div className={formData.isFree ? "" : ""}>
          <Label htmlFor="numberOfParticipants" required>Number of Participants</Label>
          <Select
            id="numberOfParticipants"
            value={formData.numberOfParticipants?.toString() || ""}
            onChange={(e) =>
              actions.handleInputChange(
                "numberOfParticipants",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            error={!!errors.numberOfParticipants}
          >
            <option value="">Select number of participants</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num.toString()}>
                {num} participant{num > 1 ? "s" : ""}
              </option>
            ))}
          </Select>
          {errors.numberOfParticipants && (
            <p className="text-[var(--color-error)] text-sm mt-1">
              {errors.numberOfParticipants}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPricingFields;
