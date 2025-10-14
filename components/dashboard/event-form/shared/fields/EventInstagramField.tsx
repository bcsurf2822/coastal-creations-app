import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";

interface EventInstagramFieldProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventInstagramField = ({
  formData,
  actions,
  errors,
}: EventInstagramFieldProps): ReactElement => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Instagram Post URL (Optional)
      </label>
      <input
        type="url"
        value={formData.instagramEmbedCode || ""}
        onChange={(e) =>
          actions.handleInputChange("instagramEmbedCode", e.target.value)
        }
        autoComplete="off"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://www.instagram.com/p/..."
      />
      {errors.instagramEmbedCode && (
        <p className="text-red-600 text-sm mt-1">{errors.instagramEmbedCode}</p>
      )}
      <p className="mt-2 text-sm text-gray-600">
        Add a link to an Instagram post to display an Instagram icon on the event card
      </p>
    </div>
  );
};

export default EventInstagramField;
