import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { Input, Textarea, Select, Label } from "@/components/ui";

interface EventBasicFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
  onEventTypeChange: (eventType: "adult-class" | "kid-class" | "event" | "camp" | "artist") => void;
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
        <Label htmlFor="eventType" required>Event Type</Label>
        <Select
          id="eventType"
          value={formData.eventType}
          onChange={(e) =>
            onEventTypeChange(
              e.target.value as EventFormState["eventType"]
            )
          }
          autoComplete="off"
          error={!!errors.eventType}
        >
          <option value="adult-class">Adult Class</option>
          <option value="kid-class">Kid Class</option>
          <option value="event">Event</option>
          <option value="camp">Camp</option>
          <option value="artist">Live Artist Event</option>
        </Select>
        {errors.eventType && (
          <p className="text-[var(--color-error)] text-sm mt-1">{errors.eventType}</p>
        )}
      </div>

      {/* Event Name */}
      <div>
        <Label htmlFor="eventName" required>Event Name</Label>
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
          placeholder="Enter event name"
          error={!!errors.eventName}
        />
        {errors.eventName && (
          <p className="text-[var(--color-error)] text-sm mt-1">{errors.eventName}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" required>Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => actions.handleInputChange("description", e.target.value)}
          rows={4}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          placeholder="Enter event description"
          error={!!errors.description}
        />
        {errors.description && (
          <p className="text-[var(--color-error)] text-sm mt-1">{errors.description}</p>
        )}
      </div>
    </>
  );
};

export default EventBasicFields;