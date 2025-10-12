import { ReactElement } from "react";
import {
  PrivateEventFormState,
  PrivateEventFormActions,
  PrivateEventFormErrors,
} from "../types/privateEventForm.types";

interface PrivateEventInstagramFieldProps {
  formData: PrivateEventFormState;
  actions: PrivateEventFormActions;
  errors: PrivateEventFormErrors;
}

const PrivateEventInstagramField = ({
  formData,
  actions,
  errors,
}: PrivateEventInstagramFieldProps): ReactElement => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Instagram Post Embed Code (Optional)
      </label>
      <textarea
        value={formData.instagramEmbedCode || ""}
        onChange={(e) => actions.handleInputChange("instagramEmbedCode", e.target.value)}
        autoComplete="off"
        rows={6}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        placeholder='Paste the entire Instagram embed code here (including script tag)...'
      />
      {errors.instagramEmbedCode && (
        <p className="text-red-600 text-sm mt-1">{errors.instagramEmbedCode}</p>
      )}
      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <p className="font-semibold">How to get the embed code:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Go to the Instagram post you want to embed</li>
          <li>Click the three dots menu (...) on the post</li>
          <li>Select &quot;Embed&quot;</li>
          <li>Click &quot;Copy embed code&quot;</li>
          <li>Paste the entire code here (no need to remove anything)</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2 italic">
          Note: You can paste the complete embed code including the script tag - we&apos;ll handle it automatically.
        </p>
      </div>
    </div>
  );
};

export default PrivateEventInstagramField;
