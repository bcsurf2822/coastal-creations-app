import { ReactElement } from "react";
import { ReservationFormState, ReservationFormActions } from "../types/reservationForm.types";
import { formatNumberInput, parseNumberValue } from "../../../event-form/shared/utils/formHelpers";

interface ReservationOptionsFieldsProps {
  formData: ReservationFormState;
  actions: ReservationFormActions;
  errors: { [key: string]: string };
}

const ReservationOptionsFields = ({
  formData,
  actions,
  errors,
}: ReservationOptionsFieldsProps): ReactElement => {
  const getFieldError = (fieldPath: string): string | null => {
    return errors[fieldPath] || null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="has-options"
          checked={formData.hasOptions}
          onChange={(e) => actions.handleInputChange("hasOptions", e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="has-options" className="text-sm font-medium text-gray-700">
          Add Optional Add-ons/Extras
        </label>
      </div>

      {formData.hasOptions && (
        <div className="space-y-4 border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Reservation Add-ons</h3>
            <button
              type="button"
              onClick={actions.addOptionCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Category
            </button>
          </div>

          {formData.optionCategories.length === 0 && (
            <p className="text-gray-500 text-sm">
              No option categories added yet. Click &quot;Add Category&quot; to get started.
            </p>
          )}

          {formData.optionCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-300 rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">
                  Category {categoryIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => actions.removeOptionCategory(categoryIndex)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={category.categoryName}
                    onChange={(e) =>
                      actions.updateOptionCategory(categoryIndex, "categoryName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lunch Options"
                  />
                  {getFieldError(`optionCategories.${categoryIndex}.categoryName`) && (
                    <p className="text-red-600 text-sm mt-1">
                      {getFieldError(`optionCategories.${categoryIndex}.categoryName`)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={category.categoryDescription || ""}
                    onChange={(e) =>
                      actions.updateOptionCategory(categoryIndex, "categoryDescription", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Choices <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => actions.addChoiceToCategory(categoryIndex)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Add Choice
                  </button>
                </div>

                {category.choices.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No choices added yet. Click &quot;Add Choice&quot; to get started.
                  </p>
                )}

                {category.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={choice.name}
                        onChange={(e) =>
                          actions.updateChoice(categoryIndex, choiceIndex, "name", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Choice name"
                      />
                      {getFieldError(`optionCategories.${categoryIndex}.choices.${choiceIndex}.name`) && (
                        <p className="text-red-600 text-sm mt-1">
                          {getFieldError(`optionCategories.${categoryIndex}.choices.${choiceIndex}.name`)}
                        </p>
                      )}
                    </div>

                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
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
                                value ? parseNumberValue(value) : undefined
                              );
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      {getFieldError(`optionCategories.${categoryIndex}.choices.${choiceIndex}.price`) && (
                        <p className="text-red-600 text-sm mt-1">
                          {getFieldError(`optionCategories.${categoryIndex}.choices.${choiceIndex}.price`)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => actions.removeChoiceFromCategory(categoryIndex, choiceIndex)}
                      className="text-red-600 hover:text-red-700 px-2 py-1 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {getFieldError(`optionCategories.${categoryIndex}.choices`) && (
                  <p className="text-red-600 text-sm">
                    {getFieldError(`optionCategories.${categoryIndex}.choices`)}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Add-ons let customers customize their reservation experience.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationOptionsFields;