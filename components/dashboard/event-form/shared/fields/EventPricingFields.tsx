import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { formatNumberInput, parseNumberValue } from "../utils/formHelpers";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price <span className="text-red-500">*</span>
        </label>
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Price"
        />
        {errors.price && (
          <p className="text-red-600 text-sm mt-1">{errors.price}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Participants <span className="text-red-500">*</span>
        </label>
        <select
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select number of participants</option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num.toString()}>
              {num} participant{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        {errors.numberOfParticipants && (
          <p className="text-red-600 text-sm mt-1">
            {errors.numberOfParticipants}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventPricingFields;
