"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React from "react";

interface EventFormData {
  eventName: string;
  eventType: "class" | "workshop" | "camp" | "artist";
  description: string;
  price: string;
  numberOfParticipants: string;
  startDate: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  isRecurring: boolean;
  recurringPattern: "daily" | "weekly";
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
  imageUrl?: string;
}

interface FormErrors {
  eventName?: string;
  eventType?: string;
  description?: string;
  price?: string;
  numberOfParticipants?: string;
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
    numberOfParticipants: "",
    startDate: "",
    startTime: null,
    endTime: null,
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
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(
    null
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      const file = e.target.files[0];
      setFormData({
        ...formData,
        [name]: file,
      });
      // Auto-upload image when selected
      if (file && formData.eventName) {
        handleImageUpload(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!formData.eventName) {
      setErrors({ ...errors, image: "Please enter an event name first" });
      return;
    }

    setIsImageUploading(true);
    setImageUploadStatus("Uploading image...");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("title", formData.eventName);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      setUploadedImageUrl(result.imageUrl);
      setImageUploadStatus("Image uploaded successfully!");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setImageUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageUploadStatus("Failed to upload image. Please try again.");
      setErrors({ ...errors, image: "Failed to upload image" });
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (value === "") {
      setFormData({
        ...formData,
        [name]: null,
      });
    } else {
      const [hours, minutes] = value.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        setFormData({
          ...formData,
          [name]: dayjs().hour(hours).minute(minutes).second(0),
        });
      }
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
      data.eventType !== "artist" &&
      (!data.price ||
        isNaN(parseFloat(data.price)) ||
        parseFloat(data.price) < 0)
    ) {
      newErrors.price = "Price is required";
    }
    if (data.eventType !== "artist") {
      if (!data.numberOfParticipants) {
        newErrors.numberOfParticipants = "Number of participants is required";
      } else if (
        isNaN(parseInt(data.numberOfParticipants)) ||
        parseInt(data.numberOfParticipants) < 1
      ) {
        newErrors.numberOfParticipants =
          "Number of participants must be a positive number";
      }
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
    }
    if (!data.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (data.eventType !== "artist" && data.isRecurring) {
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
    
    setIsSubmitting(true);
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length === 0) {

      try {
        // Format the data for API to match Event.ts model structure exactly
        const apiData = {
          eventName: formData.eventName,
          eventType: formData.eventType, // Already restricted to valid enum values in the interface
          description: formData.description,
          price:
            formData.eventType !== "artist"
              ? parseFloat(formData.price)
              : undefined,
          numberOfParticipants:
            formData.eventType !== "artist"
              ? parseInt(formData.numberOfParticipants)
              : undefined,
          // Match dates structure from Event.ts model
          dates: {
            startDate: formData.startDate, // Send the date string as-is, let schema handle timezone
            isRecurring:
              formData.eventType !== "artist" ? formData.isRecurring : false,
            recurringPattern:
              formData.eventType !== "artist" && formData.isRecurring
                ? formData.recurringPattern
                : undefined,
            recurringEndDate:
              formData.eventType !== "artist" && formData.isRecurring
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
          options:
            formData.eventType !== "artist" && formData.hasOptions
              ? formData.optionCategories.filter(
                  (cat) => cat.categoryName.trim() !== ""
                )
              : undefined,
          // Image is already uploaded to Sanity, include URL if available
          image: uploadedImageUrl || undefined,
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
      setIsSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (const minute of [0, 30]) {
        // Skip 9:30 PM (21:30) since we only want up to 9:00 PM
        if (hour === 21 && minute > 0) continue;
        const time = dayjs().hour(hour).minute(minute).second(0);
        const timeStr = time.format("HH:mm");
        options.push(timeStr);
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
            <option value="artist">Artist</option>
          </select>
          {errors.eventType && (
            <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
          )}
        </div>

        {formData.eventType !== "artist" && (
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price ($)
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  handleChange(e);
                }
              }}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter Price"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
        )}

        {formData.eventType !== "artist" && (
          <div>
            <label
              htmlFor="numberOfParticipants"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Participants
            </label>
            <select
              id="numberOfParticipants"
              name="numberOfParticipants"
              value={formData.numberOfParticipants}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.numberOfParticipants ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select number of participants</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num.toString()}>
                  {num} participant{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            {errors.numberOfParticipants && (
              <p className="mt-1 text-sm text-red-600">
                {errors.numberOfParticipants}
              </p>
            )}
          </div>
        )}

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
              onChange={handleTimeChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select start time</option>
              {generateTimeOptions().map((time) => (
                <option key={time} value={time}>
                  {dayjs()
                    .hour(Number(time.split(":")[0]))
                    .minute(Number(time.split(":")[1]))
                    .format("h:mm A")}
                </option>
              ))}
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
              onChange={handleTimeChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select end time</option>
              {generateTimeOptions().map((time) => (
                <option key={time} value={time}>
                  {dayjs()
                    .hour(Number(time.split(":")[0]))
                    .minute(Number(time.split(":")[1]))
                    .format("h:mm A")}
                </option>
              ))}
            </select>
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {formData.eventType !== "artist" && (
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
              Recurring Event
            </label>
          </div>
        )}

        {formData.eventType !== "artist" && formData.isRecurring && (
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

        <div className="col-span-1 md:col-span-2">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Image (Optional)
          </label>
          {!formData.eventName && (
            <p className="text-sm text-gray-500 mb-2">
              Please enter an event name before uploading an image
            </p>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            disabled={!formData.eventName}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.image ? "border-red-500" : "border-gray-300"} ${!formData.eventName ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {imageUploadStatus && (
            <p
              className={`mt-1 text-sm ${imageUploadStatus.includes("successfully") ? "text-green-600" : imageUploadStatus.includes("Failed") ? "text-red-600" : "text-blue-600"}`}
            >
              {imageUploadStatus}
            </p>
          )}
          {uploadedImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Preview:</p>
              <img
                src={uploadedImageUrl}
                alt="Uploaded event image"
                className="mt-1 h-32 w-auto object-cover rounded-md"
              />
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>

        {formData.eventType !== "artist" && (
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
              Add Options
            </label>
          </div>
        )}

        {formData.eventType !== "artist" && formData.hasOptions && (
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
                    className="text-red-600 hover:text-red-800 cursor-pointer"
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

        <div className="col-span-1 md:col-span-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting || isImageUploading}
            className={`w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : isImageUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            )}
            {isSubmitting
              ? "Creating Event..."
              : isImageUploading
                ? "Image Uploading... Please Wait"
                : "Create Event"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        /* Hide the spinner for number inputs */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default EventForm;
