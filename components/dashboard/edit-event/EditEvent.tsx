"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string }>;
}

interface EventData {
  _id?: string;
  eventName: string;
  description: string;
  eventType: "class" | "camp" | "workshop" | "artist";
  price: number;
  numberOfParticipants?: number;
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
  image?: string;
  imageFile?: File | null;
}

export default function EditEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(
    null
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const isSavingRef = useRef(false);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const recurringEndDateInputRef = useRef<HTMLInputElement>(null);

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

        // Set existing image URL if available
        if (event.image) {
          setUploadedImageUrl(event.image);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleImageUpload = async (file: File) => {
    if (!eventData.eventName) {
      toast.error(
        "Please make sure event has a name before uploading an image"
      );
      return;
    }

    setIsImageUploading(true);
    setImageUploadStatus("Uploading image...");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("title", eventData.eventName);

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
      setIsImageLoading(true); // Start image loading for preview
      setImageUploadStatus("Image uploaded successfully!");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setImageUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error(
        "[EditEvent-handleImageUpload] Error uploading image:",
        error
      );
      setImageUploadStatus("Failed to upload image. Please try again.");
      toast.error("Failed to upload image");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!uploadedImageUrl) return;

    setIsDeletingImage(true);
    const loadingToastId = toast.loading("Deleting image...");

    try {
      const response = await fetch(
        `/api/delete-image?imageUrl=${encodeURIComponent(uploadedImageUrl)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setUploadedImageUrl(null);
      setEventData((prev) => ({
        ...prev,
        image: undefined,
      }));

      toast.dismiss(loadingToastId);
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error(
        "[EditEvent-handleImageDelete] Error deleting image:",
        error
      );
      toast.dismiss(loadingToastId);
      toast.error("Failed to delete image");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (
      type === "file" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      const file = e.target.files[0];
      setEventData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      // Auto-upload image when selected
      if (file && eventData.eventName) {
        handleImageUpload(file);
      }
      return;
    }

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

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  const handleDateInputClick = (
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!eventId) {
        toast.error("No event ID provided");
        return;
      }

      // Prevent double submission
      if (isSavingRef.current) return;

      isSavingRef.current = true;
      setIsSaving(true);

      // Show loading toast
      const loadingToastId = toast.loading("Saving changes...", {
        duration: Infinity,
      });

      try {
        // Create a copy of the event data to modify dates for submission
        const submissionData = {
          _id: eventData._id,
          eventName: eventData.eventName,
          description: eventData.description,
          eventType: eventData.eventType,
          price: eventData.price,
          numberOfParticipants: eventData.numberOfParticipants,
          dates: {
            ...eventData.dates,
          },
          time: eventData.time,
          options: eventData.options,
          // Include image URL if available, exclude imageFile
          image: uploadedImageUrl || eventData.image || undefined,
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

        // Add minimum loading duration of 1 second for better UX
        const [response] = await Promise.all([
          fetch(`/api/event/${eventId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1 second loading
        ]);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update event");
        }

        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success("Event updated successfully! Redirecting...", {
          duration: 2000,
        });

        // Keep loading state active during redirect
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } catch (err) {
        console.error("[EditEvent-handleSubmit] Error updating event:", err);

        // Dismiss loading toast and show error
        toast.dismiss(loadingToastId);
        toast.error(
          err instanceof Error
            ? err.message
            : "An error occurred while updating the event"
        );

        // Only reset loading state on error
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [eventData, eventId, router, uploadedImageUrl]
  );

  // Generate time options from 9:00 AM to 9:00 PM
  const generateTimeOptions = () => {
    const options = [];
    // Start at 9 AM (hour 9) and end at 21:00 (9:00 PM)
    for (let hour = 9; hour <= 21; hour++) {
      for (const minute of [0, 30]) {
        // Skip 9:30 PM (21:30) since we only want up to 9:00 PM
        if (hour === 21 && minute > 0) continue;

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
                <option value="artist">Artist</option>
              </select>
            </div>

            {eventData.eventType !== "artist" && (
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
            )}

            {eventData.eventType !== "artist" && (
              <div>
                <label
                  htmlFor="numberOfParticipants"
                  className="block text-sm font-bold text-gray-700"
                >
                  Number of Participants (Optional)
                </label>
                <select
                  id="numberOfParticipants"
                  name="numberOfParticipants"
                  value={eventData.numberOfParticipants || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select number of participants</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} participant{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                ref={startDateInputRef}
                type="date"
                id="dates.startDate"
                name="dates.startDate"
                value={eventData.dates?.startDate || ""}
                onChange={handleInputChange}
                onClick={() => handleDateInputClick(startDateInputRef)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {eventData.eventType !== "artist" && (
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
            )}

            {eventData.eventType !== "artist" &&
              eventData.dates?.isRecurring && (
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
                      ref={recurringEndDateInputRef}
                      type="date"
                      id="dates.recurringEndDate"
                      name="dates.recurringEndDate"
                      value={eventData.dates?.recurringEndDate || ""}
                      onChange={handleInputChange}
                      onClick={() =>
                        handleDateInputClick(recurringEndDateInputRef)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
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

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-xl text-gray-700 font-semibold">Event Image</h2>

            <div>
              <label
                htmlFor="imageFile"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Event Image (Optional)
              </label>
              {!eventData.eventName && (
                <p className="text-sm text-gray-500 mb-2">
                  Please make sure event has a name before uploading an image
                </p>
              )}
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleInputChange}
                disabled={!eventData.eventName}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!eventData.eventName ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  <p className="text-sm text-gray-600">Current image:</p>
                  <div className="relative inline-block">
                    <Image
                      src={uploadedImageUrl}
                      alt="Event image"
                      width={128}
                      height={128}
                      className="mt-1 h-32 w-auto object-cover rounded-md"
                      onLoad={handleImageLoad}
                      onLoadStart={handleImageLoadStart}
                    />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isDeletingImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete image"
                    >
                      {isDeletingImage ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        "×"
                      )}
                    </button>
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-md">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          {eventData.eventType !== "artist" && (
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
                      <span className="material-symbols-outlined mr-1">
                        add
                      </span>
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
                                    removeOptionChoice(
                                      categoryIndex,
                                      choiceIndex
                                    )
                                  }
                                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                                >
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
                      <span className="material-symbols-outlined mr-1">
                        add
                      </span>
                      Add Option Category
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

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
              disabled={
                isSaving ||
                isImageUploading ||
                isImageLoading ||
                isDeletingImage
              }
              className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center ${
                isSaving
                  ? "bg-blue-400 cursor-not-allowed"
                  : isImageUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isImageLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : isDeletingImage
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              )}
              {isSaving
                ? "Saving Changes..."
                : isImageUploading
                  ? "Image Uploading... Please Wait"
                  : isImageLoading
                    ? "Image Loading... Please Wait"
                    : isDeletingImage
                      ? "Deleting Image... Please Wait"
                      : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
