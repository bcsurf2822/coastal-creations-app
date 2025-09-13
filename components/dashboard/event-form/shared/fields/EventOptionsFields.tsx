import { ReactElement } from "react";
import { EventFormState, EventFormActions } from "../types/eventForm.types";
import { formatNumberInput } from "../utils/formHelpers";

interface EventOptionsFieldsProps {
  formData: EventFormState;
  actions: EventFormActions;
  errors: { [key: string]: string };
}

const EventOptionsFields = ({
  formData,
  actions,
  errors,
}: EventOptionsFieldsProps): ReactElement => {
  // Don't render for artist or reservation events
  if (formData.eventType === "artist" || formData.eventType === "reservation") {
    return <></>;
  }

  const getFieldError = (fieldPath: string): string | null => {
    return errors[fieldPath] || null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.hasOptions || false}
          onChange={(e) =>
            actions.handleInputChange("hasOptions", e.target.checked)
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Choice Options
        </label>
      </div>

      {formData.hasOptions && (
        <div className="ml-6 space-y-6">
          {formData.optionCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="border border-gray-200 rounded-md p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">
                  Option Category {categoryIndex + 1}
                </h4>
                {formData.optionCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => actions.removeOptionCategory(categoryIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove Category
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={category.categoryName}
                    onChange={(e) =>
                      actions.updateOptionCategory(
                        categoryIndex,
                        "categoryName",
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Add-ons, Extras"
                  />
                  {getFieldError(
                    `optionCategories.${categoryIndex}.categoryName`
                  ) && (
                    <p className="text-red-600 text-sm mt-1">
                      {getFieldError(
                        `optionCategories.${categoryIndex}.categoryName`
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Description
                  </label>
                  <textarea
                    value={category.categoryDescription || ""}
                    onChange={(e) =>
                      actions.updateOptionCategory(
                        categoryIndex,
                        "categoryDescription",
                        e.target.value
                      )
                    }
                    rows={2}
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description for this category"
                  />
                </div>

                {/* Choices */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choices <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {category.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex space-x-2 items-end"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={choice.name}
                            onChange={(e) =>
                              actions.updateChoice(
                                categoryIndex,
                                choiceIndex,
                                "name",
                                e.target.value
                              )
                            }
                            autoComplete="new-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-form-type="other"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Choice name"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="text"
                            value={choice.price?.toString() || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (formatNumberInput(value) === value) {
                                actions.updateChoice(
                                  categoryIndex,
                                  choiceIndex,
                                  "price",
                                  value ? Number(value) : undefined
                                );
                              }
                            }}
                            autoComplete="new-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-form-type="other"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        {category.choices.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              actions.removeChoiceFromCategory(
                                categoryIndex,
                                choiceIndex
                              )
                            }
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => actions.addChoiceToCategory(categoryIndex)}
                    className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Choice
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={actions.addOptionCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Option Category
          </button>

          {getFieldError("optionCategories") && (
            <p className="text-red-600 text-sm">{getFieldError("optionCategories")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventOptionsFields;