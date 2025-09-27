import { ReactElement } from "react";
import { PrivateEventFieldsProps } from "../types/privateEventForm.types";
import {
  formatNumberInput,
  parseNumberValue,
} from "../../../event-form/shared/utils/formHelpers";

const PrivateEventOptionsFields = ({
  formData,
  actions,
  errors,
}: PrivateEventFieldsProps): ReactElement => {
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
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Add Options (Optional)
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter category name"
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
                  <input
                    type="text"
                    value={category.categoryDescription || ""}
                    onChange={(e) =>
                      actions.updateOptionCategory(
                        categoryIndex,
                        "categoryDescription",
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional description for this category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choices <span className="text-red-500">*</span>
                  </label>

                  {category.choices.map((choice, choiceIndex) => (
                    <div
                      key={choiceIndex}
                      className="flex items-center space-x-2 mb-2"
                    >
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
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Choice name"
                      />
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
                                parseNumberValue(value)
                              );
                            }
                          }}
                          autoComplete="new-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-form-type="other"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Price (optional)"
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
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  {getFieldError(
                    `optionCategories.${categoryIndex}.choices`
                  ) && (
                    <p className="text-red-600 text-sm mt-1">
                      {getFieldError(
                        `optionCategories.${categoryIndex}.choices`
                      )}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => actions.addChoiceToCategory(categoryIndex)}
                    className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer"
          >
            Add Option Category
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivateEventOptionsFields;
