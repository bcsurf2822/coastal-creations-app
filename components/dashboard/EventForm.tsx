"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

interface EventFormData {
  eventName: string;
  eventType: "class" | "workshop" | "camp";
  description: string;
  price: string;
  startDate: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  isRecurring: boolean;
  recurringPattern: "daily" | "weekly" | "monthly" | "yearly";
  recurringEndDate: string;
  hasOptions: boolean;
  optionCategories: Array<{
    categoryName: string;
    categoryDescription: string;
    choices: Array<{
      name: string;
    }>;
  }>;
  image: File | null;
}

interface FormErrors {
  eventName?: string;
  eventType?: string;
  description?: string;
  price?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  recurringEndDate?: string;
  image?: string;
}

const EventForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    eventType: "class",
    description: "",
    price: "",
    startDate: "",
    startTime: dayjs(),
    endTime: dayjs().add(1, "hour"),
    isRecurring: false,
    recurringPattern: "weekly",
    recurringEndDate: "",
    hasOptions: false,
    optionCategories: [
      {
        categoryName: "",
        categoryDescription: "",
        choices: [{ name: "" }],
      },
    ],
    image: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else if (
      type === "file" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      setFormData({
        ...formData,
        [name]: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleTimeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [hours, minutes] = value.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      setFormData({
        ...formData,
        [name]: dayjs().hour(hours).minute(minutes).second(0),
      });
    }
  };

  const validate = (data: EventFormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.eventName.trim()) {
      newErrors.eventName = "Event name is required";
    }
    if (!data.eventType) {
      newErrors.eventType = "Event type is required";
    }
    if (!data.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (
      !data.price ||
      isNaN(parseFloat(data.price)) ||
      parseFloat(data.price) < 0
    ) {
      newErrors.price = "Valid positive price is required";
    }
    if (!data.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const startDate = dayjs(data.startDate);
      if (!startDate.isValid()) {
        newErrors.startDate = "Invalid start date format";
      } else if (startDate.isBefore(dayjs(), "day")) {
      }
    }
    if (!data.startTime) {
      newErrors.startTime = "Start time is required";
    } else if (!dayjs(data.startTime).isValid()) {
      newErrors.startTime = "Invalid start time format";
    }

    if (data.isRecurring) {
      if (!data.recurringEndDate) {
        newErrors.recurringEndDate =
          "Recurring end date is required for recurring events";
      } else {
        const recurringEndDate = dayjs(data.recurringEndDate);
        const startDate = dayjs(data.startDate);
        if (!recurringEndDate.isValid()) {
          newErrors.recurringEndDate = "Invalid recurring end date format";
        } else if (recurringEndDate.isBefore(startDate, "day")) {
          newErrors.recurringEndDate =
            "Recurring end date must be after the start date";
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      try {
        // Format the data for API to match Event.ts model structure exactly
        const apiData = {
          eventName: formData.eventName,
          eventType: formData.eventType, // Already restricted to valid enum values in the interface
          description: formData.description,
          price: parseFloat(formData.price),
          // Match dates structure from Event.ts model
          dates: {
            startDate: formData.startDate, // Send the date string
            isRecurring: formData.isRecurring,
            recurringPattern: formData.isRecurring
              ? formData.recurringPattern
              : undefined,
            recurringEndDate: formData.isRecurring
              ? formData.recurringEndDate
              : undefined,
          },
          // Match time structure from Event.ts model
          time: {
            startTime: formData.startTime
              ? formData.startTime.format("HH:mm")
              : "",
            endTime: formData.endTime ? formData.endTime.format("HH:mm") : "",
          },
          // Add options if they exist
          options: formData.hasOptions
            ? formData.optionCategories.filter(
                (cat) => cat.categoryName.trim() !== ""
              )
            : undefined,
          // Note: Image handling will need to be addressed separately
        };

        // Send data to API
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create event");
        }

        setSubmitSuccess(true);

        setTimeout(() => {
          router.push("/admin/dashboard/");
        }, 2000);
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmitError(
          typeof error === "string" ? error : (error as Error).message
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    // Start at 9 AM (hour 9) and end at 7 PM (hour 19)
    for (let hour = 9; hour <= 19; hour++) {
      for (const minute of [0, 30]) {
        const time = dayjs().hour(hour).minute(minute).second(0);
        const timeStr = time.format("HH:mm");
        options.push(
          <option key={timeStr} value={timeStr}>
            {time.format("h:mm A")}
          </option>
        );
      }
    }
    return options;
  };

  // Add these new functions to handle options
  const handleOptionCategoryChange = (
    index: number,
    field: keyof (typeof formData.optionCategories)[0],
    value: string
  ) => {
    const updatedCategories = [...formData.optionCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      optionCategories: updatedCategories,
    });
  };

  const handleOptionChoiceChange = (
    categoryIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    const updatedCategories = [...formData.optionCategories];
    updatedCategories[categoryIndex].choices[choiceIndex] = {
      name: value,
    };
    setFormData({
      ...formData,
      optionCategories: updatedCategories,
    });
  };

  const addOptionCategory = () => {
    setFormData({
      ...formData,
      optionCategories: [
        ...formData.optionCategories,
        {
          categoryName: "",
          categoryDescription: "",
          choices: [{ name: "" }],
        },
      ],
    });
  };

  const removeOptionCategory = (index: number) => {
    const updatedCategories = [...formData.optionCategories];
    updatedCategories.splice(index, 1);
    setFormData({
      ...formData,
      optionCategories: updatedCategories.length
        ? updatedCategories
        : [
            {
              categoryName: "",
              categoryDescription: "",
              choices: [{ name: "" }],
            },
          ],
    });
  };

  const addOptionChoice = (categoryIndex: number) => {
    const updatedCategories = [...formData.optionCategories];
    updatedCategories[categoryIndex].choices.push({
      name: "",
    });
    setFormData({
      ...formData,
      optionCategories: updatedCategories,
    });
  };

  const removeOptionChoice = (categoryIndex: number, choiceIndex: number) => {
    const updatedCategories = [...formData.optionCategories];
    updatedCategories[categoryIndex].choices.splice(choiceIndex, 1);
    if (updatedCategories[categoryIndex].choices.length === 0) {
      updatedCategories[categoryIndex].choices.push({
        name: "",
      });
    }
    setFormData({
      ...formData,
      optionCategories: updatedCategories,
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create New Event
      </h2>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Event created successfully! Redirecting to events dashboard...
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          Error: {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="col-span-1 md:col-span-2">
          <label
            htmlFor="eventName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.eventName ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter event name"
          />
          {errors.eventName && (
            <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="eventType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.eventType ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="class">Class</option>
            <option value="workshop">Workshop</option>
            <option value="camp">Camp</option>
          </select>
          {errors.eventType && (
            <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter Price"
            min="0"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={
                formData.startTime ? formData.startTime.format("HH:mm") : ""
              }
              onChange={handleTimeSelectChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select start time</option>
              {generateTimeOptions()}
            </select>
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime ? formData.endTime.format("HH:mm") : ""}
              onChange={handleTimeSelectChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select end time</option>
              {generateTimeOptions()}
            </select>
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isRecurring"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Is this a recurring event?
          </label>
        </div>

        {formData.isRecurring && (
          <>
            <div>
              <label
                htmlFor="recurringPattern"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recurring Pattern
              </label>
              <select
                id="recurringPattern"
                name="recurringPattern"
                value={formData.recurringPattern}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="recurringEndDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recurring End Date
              </label>
              <input
                type="date"
                id="recurringEndDate"
                name="recurringEndDate"
                value={formData.recurringEndDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.recurringEndDate ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.recurringEndDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.recurringEndDate}
                </p>
              )}
            </div>
          </>
        )}

        <div className="col-span-1 md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
            placeholder="Provide a detailed description of the event"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center mt-4">
          <input
            type="checkbox"
            id="hasOptions"
            name="hasOptions"
            checked={formData.hasOptions}
            onChange={(e) =>
              setFormData({
                ...formData,
                hasOptions: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="hasOptions"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Does this event have options? (Optional)
          </label>
        </div>

        {formData.hasOptions && (
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Event Options
            </h3>

            {formData.optionCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="mb-6 p-4 bg-white rounded-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-700">
                    Option Category {categoryIndex + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOptionCategory(categoryIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor={`categoryName-${categoryIndex}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category Name
                    </label>
                    <input
                      type="text"
                      id={`categoryName-${categoryIndex}`}
                      value={category.categoryName}
                      onChange={(e) =>
                        handleOptionCategoryChange(
                          categoryIndex,
                          "categoryName",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Category"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`categoryDescription-${categoryIndex}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category Description
                    </label>
                    <input
                      type="text"
                      id={`categoryDescription-${categoryIndex}`}
                      value={category.categoryDescription}
                      onChange={(e) =>
                        handleOptionCategoryChange(
                          categoryIndex,
                          "categoryDescription",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Category Description"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choices
                  </label>
                  {category.choices.map((choice, choiceIndex) => (
                    <div
                      key={choiceIndex}
                      className="flex flex-row gap-3 mb-3 p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <label
                          htmlFor={`choice-name-${categoryIndex}-${choiceIndex}`}
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Choice Name
                        </label>
                        <input
                          type="text"
                          id={`choice-name-${categoryIndex}-${choiceIndex}`}
                          value={choice.name}
                          onChange={(e) =>
                            handleOptionChoiceChange(
                              categoryIndex,
                              choiceIndex,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Choice"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeOptionChoice(categoryIndex, choiceIndex)
                          }
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionChoice(categoryIndex)}
                    className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
                  >
                    + Add Choice
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOptionCategory}
              className="mt-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md"
            >
              + Add Option Category
            </button>
          </div>
        )}

        {/* <div className="col-span-1 md:col-span-2">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className={`w-full text-sm text-gray-700
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-gray-50 file:text-gray-700
                           hover:file:bg-gray-100
                           ${errors.image ? "border-red-500" : "border-gray-300"}`}
          />
          {formData.image && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {formData.image.name}
            </p>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div> */}

        <div className="col-span-1 md:col-span-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
