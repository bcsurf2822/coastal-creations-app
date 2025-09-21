import { ReactElement } from "react";
import { PrivateEventFieldsProps } from "../types/privateEventForm.types";

const PrivateEventBasicFields = ({
  formData,
  actions,
  errors,
}: PrivateEventFieldsProps): ReactElement => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => actions.handleInputChange("title", e.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Birthday Party, Corporate Event"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => actions.handleInputChange("description", e.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the private event details, what's included, special requirements..."
            rows={4}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => actions.handleInputChange("notes", e.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or special requirements..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default PrivateEventBasicFields;