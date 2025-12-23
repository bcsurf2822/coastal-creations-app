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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div>
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
  );
};

export default EventPricingFields;
