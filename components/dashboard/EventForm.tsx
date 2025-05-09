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
          // Note: Image handling will need to be addressed separately
        };

        console.log("Sending data to API:", apiData);

        // Send data to API
        const response = await fetch("/api/add-event", {
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
        console.log("Event created successfully:", result.event);

        // Redirect or clear form after successful submission
        setTimeout(() => {
          router.push("/dashboard/events");
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
      console.log("Form has validation errors:", validationErrors);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
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
            placeholder="e.g., 25.00"
            step="0.01"
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

        <div className="col-span-1 md:col-span-2">
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
        </div>

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
