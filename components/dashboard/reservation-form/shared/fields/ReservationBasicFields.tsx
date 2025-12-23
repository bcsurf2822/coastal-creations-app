import { ReactElement } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
import { Input, Textarea, Label } from "@/components/ui";

interface ReservationBasicFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationBasicFields = ({
  formData,
  actions,
  errors,
}: ReservationBasicFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="eventName" required>Reservation Name</Label>
        <Input
          type="text"
          id="eventName"
          value={formData.eventName}
          onChange={(e) => actions.handleInputChange("eventName", e.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          placeholder="Enter reservation name (e.g., After School Program)"
          error={!!errors.eventName}
        />
        {errors.eventName && (
          <p className="text-[var(--color-error)] text-sm mt-1">{errors.eventName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" required>Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => actions.handleInputChange("description", e.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          rows={4}
          placeholder="Describe the reservation program..."
          error={!!errors.description}
        />
        {errors.description && (
          <p className="text-[var(--color-error)] text-sm mt-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
};

export default ReservationBasicFields;