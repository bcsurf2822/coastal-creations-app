"use client";

import { ReactElement } from "react";

interface ReservationOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
    price?: number;
  }>;
}

interface OptionsSelectorProps {
  options: ReservationOption[];
  selectedOptions: Array<{ categoryName: string; choiceName: string }>;
  onOptionChange: (categoryName: string, choiceName: string, price: number) => void;
}

export default function OptionsSelector({
  options,
  selectedOptions,
  onOptionChange,
}: OptionsSelectorProps): ReactElement {
  const formatChoiceDisplay = (choice: {
    name: string;
    price?: number;
  }): string => {
    if (!choice.price || choice.price === 0) {
      return `${choice.name} - Free`;
    }
    return `${choice.name} - $${choice.price.toFixed(2)}`;
  };

  const getChoicePrice = (
    categoryName: string,
    choiceName: string
  ): number => {
    const option = options.find((opt) => opt.categoryName === categoryName);
    const choice = option?.choices.find((c) => c.name === choiceName);
    return choice?.price || 0;
  };

  const handleChange = (
    categoryName: string,
    choiceName: string
  ): void => {
    console.log(`[OptionsSelector-handleChange] Selected ${choiceName} for ${categoryName}`);
    const price = getChoicePrice(categoryName, choiceName);
    onOptionChange(categoryName, choiceName, price);
  };

  if (options.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Additional Options
      </h3>
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        {options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {option.categoryName}
              {option.categoryDescription && (
                <span className="text-gray-500 text-xs ml-1">
                  - {option.categoryDescription}
                </span>
              )}
            </label>
            <select
              value={
                selectedOptions.find(
                  (so) => so.categoryName === option.categoryName
                )?.choiceName || option.choices[0]?.name || ""
              }
              onChange={(e) => handleChange(option.categoryName, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {option.choices.map((choice, choiceIndex) => (
                <option key={choiceIndex} value={choice.name}>
                  {formatChoiceDisplay(choice)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
