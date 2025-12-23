import { ReactElement } from "react";
import { PrivateEventFieldsProps } from "../types/privateEventForm.types";
import { Input, Textarea, Label } from "@/components/ui";

const PrivateEventBasicFields = ({
  formData,
  actions,
  errors,
}: PrivateEventFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="title" required>Event Title</Label>
          <Input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => actions.handleInputChange("title", e.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            placeholder="Enter private event title"
            maxLength={100}
            error={!!errors.title}
          />
          {errors.title && (
            <p className="text-[var(--color-error)] text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-sm text-[var(--color-text-subtle)] mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <Label htmlFor="description" required>Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              actions.handleInputChange("description", e.target.value)
            }
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            placeholder="Private event description"
            rows={4}
            maxLength={500}
            error={!!errors.description}
          />
          {errors.description && (
            <p className="text-[var(--color-error)] text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-sm text-[var(--color-text-subtle)] mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivateEventBasicFields;
