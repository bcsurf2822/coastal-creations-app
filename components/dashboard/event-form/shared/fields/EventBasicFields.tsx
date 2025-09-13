import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";

interface EventBasicFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
  onEventTypeChange: (eventType: EventFormState["eventType"]) => void;
}

const EventBasicFields = ({
  formData,
  actions,
  errors,
  onEventTypeChange,
}: EventBasicFieldsProps): ReactElement => {
  return (
    <>
      {/* Hidden inputs to prevent autocomplete */}
      <div style={{ display: "none" }}>
        <input type="text" name="username" autoComplete="username" />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
        />
      </div>

      {/* Event Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.eventType}
          onChange={(e) =>
            onEventTypeChange(
              e.target.value as EventFormState["eventType"]
            )
          }
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="class">Class</option>
          <option value="workshop">Workshop</option>
          <option value="camp">Camp</option>
          <option value="artist">Artist</option>
        </select>
        {errors.eventType && (
          <p className="text-red-600 text-sm mt-1">{errors.eventType}</p>
        )}
      </div>

      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.eventName}
          onChange={(e) => actions.handleInputChange("eventName", e.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event name"
        />
        {errors.eventName && (
          <p className="text-red-600 text-sm mt-1">{errors.eventName}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => actions.handleInputChange("description", e.target.value)}
          rows={4}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event description"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>
    </>
  );
};

export default EventBasicFields;