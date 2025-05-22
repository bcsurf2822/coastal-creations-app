"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string }>;
}

interface EventData {
  _id?: string;
  eventName: string;
  description: string;
  eventType: "class" | "camp" | "workshop";
  price: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurringEndDate?: string;
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  options?: EventOption[];
}

export default function EditEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [eventData, setEventData] = useState<EventData>({
    eventName: "",
    description: "",
    eventType: "class",
    price: 0,
    dates: {
      startDate: "",
      isRecurring: false,
    },
    time: {
      startTime: "",
    },
  });

  // Format date string to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    // Create date with no timezone conversion
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Prepare date for submission to prevent timezone issues
  const prepareDateForSubmit = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    // Create a Date object using local components to prevent timezone shift
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toISOString();
  };

  useEffect(() => {
    // Fetch event data
    const fetchEvent = async () => {
      if (!eventId) {
        setError("No event ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/event/${eventId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();

        if (!data.success || !data.event) {
          throw new Error(data.error || "Event not found");
        }

        // Format dates for input fields
        const event = data.event;
        if (event.dates?.startDate) {
          event.dates.startDate = formatDateForInput(event.dates.startDate);
        }
        if (event.dates?.endDate) {
          event.dates.endDate = formatDateForInput(event.dates.endDate);
        }
        if (event.dates?.recurringEndDate) {
          event.dates.recurringEndDate = formatDateForInput(
            event.dates.recurringEndDate
          );
        }

        setEventData(event);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEventData((prev) => {
        const updatedValue =
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        if (parent === "dates") {
          return {
            ...prev,
            dates: {
              ...prev.dates,
              [child]: updatedValue,
            },
          };
        } else if (parent === "time") {
          return {
            ...prev,
            time: {
              ...prev.time,
              [child]: updatedValue,
            },
          };
        } else {
          // For other nested objects (like options)
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof EventData] as object),
              [child]: updatedValue,
            },
          };
        }
      });
    } else {
      // Handle direct properties
      setEventData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) {
      setError("No event ID provided");
      return;
    }

    try {
      setIsSaving(true);

      // Create a copy of the event data to modify dates for submission
      const submissionData = {
        ...eventData,
        dates: {
          ...eventData.dates,
        },
      };

      // Prepare dates for submission
      if (submissionData.dates.startDate) {
        submissionData.dates.startDate = prepareDateForSubmit(
          submissionData.dates.startDate
        );
      }
      if (submissionData.dates.endDate) {
        submissionData.dates.endDate = prepareDateForSubmit(
          submissionData.dates.endDate
        );
      }
      if (submissionData.dates.recurringEndDate) {
        submissionData.dates.recurringEndDate = prepareDateForSubmit(
          submissionData.dates.recurringEndDate
        );
      }

      const response = await fetch(`/api/event/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event");
      }

      // Redirect to dashboard on success
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSaving(false);
    }
  };

  // Generate time options from 9:00 AM to 8:30 PM
  const generateTimeOptions = () => {
    const options = [];
    // Start at 9 AM (hour 9) and end at 20:30 (8:30 PM)
    for (let hour = 9; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
        // Skip 9:00 PM (21:00) since we only want up to 8:30 PM
        if (hour === 20 && minute > 30) continue;

        const time = new Date();
        time.setHours(hour, minute, 0);

        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const formattedTime = time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });

        options.push(
          <option key={timeStr} value={timeStr}>
            {formattedTime}
          </option>
        );
      }
    }
    return options;
  };

  // Options management functions
  const handleOptionCategoryChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: value,
      };
      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const handleOptionChoiceChange = (
    categoryIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[categoryIndex].choices[choiceIndex] = {
        name: value,
      };
      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const addOptionCategory = () => {
    setEventData((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        {
          categoryName: "",
          categoryDescription: "",
          choices: [{ name: "" }],
        },
      ],
    }));
  };

  const removeOptionCategory = (index: number) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions.splice(index, 1);
      return {
        ...prev,
        options: updatedOptions.length > 0 ? updatedOptions : undefined,
      };
    });
  };

  const addOptionChoice = (categoryIndex: number) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[categoryIndex].choices.push({ name: "" });
      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const removeOptionChoice = (categoryIndex: number, choiceIndex: number) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[categoryIndex].choices.splice(choiceIndex, 1);

      // If no choices left, add an empty one
      if (updatedOptions[categoryIndex].choices.length === 0) {
        updatedOptions[categoryIndex].choices.push({ name: "" });
      }

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Error</h1>
          <p className="text-red-500">{error}</p>
          <div className="mt-4">
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="eventName"
                className="block text-sm font-bold text-gray-700"
              >
                Event Name
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={eventData.eventName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="eventType"
                className="block text-sm font-bold text-gray-700"
              >
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                value={eventData.eventType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="class">Class</option>
                <option value="workshop">Workshop</option>
                <option value="camp">Camp</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-bold text-gray-700"
              >
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={eventData.price}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h2 className="text-xl text-gray-700 font-semibold">Edit Dates</h2>

            <div>
              <label
                htmlFor="dates.startDate"
                className="block text-sm font-bold text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="dates.startDate"
                name="dates.startDate"
                value={eventData.dates?.startDate || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dates.isRecurring"
                name="dates.isRecurring"
                checked={eventData.dates?.isRecurring || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="dates.isRecurring"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Is this a recurring event?
              </label>
            </div>

            {eventData.dates?.isRecurring && (
              <>
                <div>
                  <label
                    htmlFor="dates.recurringPattern"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Recurring Pattern
                  </label>
                  <select
                    id="dates.recurringPattern"
                    name="dates.recurringPattern"
                    value={eventData.dates?.recurringPattern || "weekly"}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="dates.recurringEndDate"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Recurring End Date
                  </label>
                  <input
                    type="date"
                    id="dates.recurringEndDate"
                    name="dates.recurringEndDate"
                    value={eventData.dates?.recurringEndDate || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Time */}
          <div className="space-y-4">
            <h2 className="text-xl text-gray-700 font-semibold">Time</h2>

            <div>
              <label
                htmlFor="time.startTime"
                className="block text-sm font-bold text-gray-700"
              >
                Start Time
              </label>
              <select
                id="time.startTime"
                name="time.startTime"
                value={eventData.time?.startTime || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a time</option>
                {generateTimeOptions()}
              </select>
            </div>

            <div>
              <label
                htmlFor="time.endTime"
                className="block text-sm font-bold text-gray-700"
              >
                End Time (if applicable)
              </label>
              <select
                id="time.endTime"
                name="time.endTime"
                value={eventData.time?.endTime || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a time</option>
                {generateTimeOptions()}
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h2 className="text-xl text-gray-700 font-semibold">Options</h2>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              {(!eventData.options || eventData.options.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">
                    No options available for this event
                  </p>
                  <button
                    type="button"
                    onClick={addOptionCategory}
                    className="px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md flex items-center mx-auto"
                  >
                    <span className="material-symbols-outlined mr-1">add</span>
                    Add Option Category
                  </button>
                </div>
              )}

              {eventData.options && eventData.options.length > 0 && (
                <>
                  {eventData.options.map((option, categoryIndex) => (
                    <div
                      key={categoryIndex}
                      className="mb-6 p-4 bg-white rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-bold text-gray-700">
                          Option Category {categoryIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeOptionCategory(categoryIndex)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <span className="material-symbols-outlined mr-1">
                            delete
                          </span>
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
                            value={option.categoryName}
                            onChange={(e) =>
                              handleOptionCategoryChange(
                                categoryIndex,
                                "categoryName",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            value={option.categoryDescription || ""}
                            onChange={(e) =>
                              handleOptionCategoryChange(
                                categoryIndex,
                                "categoryDescription",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Choices
                        </label>
                        {option.choices.map((choice, choiceIndex) => (
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
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  removeOptionChoice(categoryIndex, choiceIndex)
                                }
                                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                              >
                                <span className="material-symbols-outlined text-sm mr-1">
                                  close
                                </span>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOptionChoice(categoryIndex)}
                          className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md flex items-center"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">
                            add
                          </span>
                          Add Choice
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addOptionCategory}
                    className="mt-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md flex items-center"
                  >
                    <span className="material-symbols-outlined mr-1">add</span>
                    Add Option Category
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
