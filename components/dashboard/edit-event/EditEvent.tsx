"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string; price?: number }>;
}

interface EventData {
  _id?: string;
  eventName: string;
  description: string;
  eventType: "class" | "camp" | "workshop" | "artist" | "reservation";
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
    startTime: Dayjs | null;
    endTime: Dayjs | null;
  };
  options?: EventOption[];
  image?: string;
  imageFile?: File | null;
  isDiscountAvailable?: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
    name: string;
    description?: string;
  };
  reservationSettings?: {
    dailyCapacity?: number;
  };
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
      startTime: null,
      endTime: null,
    },
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const prepareDateForSubmit = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toISOString();
  };

  useEffect(() => {
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

        if (event.time?.startTime) {
          const [hours, minutes] = event.time.startTime.split(":").map(Number);
          event.time.startTime = dayjs().hour(hours).minute(minutes).second(0);
        } else {
          event.time.startTime = null;
        }

        if (event.time?.endTime) {
          const [hours, minutes] = event.time.endTime.split(":").map(Number);
          event.time.endTime = dayjs().hour(hours).minute(minutes).second(0);
        } else {
          event.time.endTime = null;
        }
        setEventData(event);

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
      setIsImageLoading(true);
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
      if (file && eventData.eventName) {
        handleImageUpload(file);
      }
      return;
    }

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
        } else if (parent === "reservationSettings") {
          return {
            ...prev,
            reservationSettings: {
              ...prev.reservationSettings,
              [child]: updatedValue === "" ? undefined : Number(updatedValue),
            },
          };
        } else {
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

      if (isSavingRef.current) return;

      isSavingRef.current = true;
      setIsSaving(true);

      const loadingToastId = toast.loading("Saving changes...", {
        duration: Infinity,
      });

      try {
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
          time: {
            startTime: eventData.time.startTime?.format("HH:mm") || "",
            endTime: eventData.time.endTime?.format("HH:mm") || "",
          },
          options: eventData.options,
          image: uploadedImageUrl || eventData.image || undefined,
          isDiscountAvailable: eventData.isDiscountAvailable,
          discount: eventData.discount,
          reservationSettings: eventData.reservationSettings,
        };

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

        toast.dismiss(loadingToastId);
        toast.success("Event updated successfully! Redirecting...", {
          duration: 2000,
        });

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } catch (err) {
        console.error("[EditEvent-handleSubmit] Error updating event:", err);

        toast.dismiss(loadingToastId);
        toast.error(
          err instanceof Error
            ? err.message
            : "An error occurred while updating the event"
        );

        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [eventData, eventId, router, uploadedImageUrl]
  );

  const handleTimeChange = useCallback(
    (
      event: React.ChangeEvent<HTMLSelectElement>,
      field: "startTime" | "endTime"
    ) => {
      const timeValue = event.target.value;
      if (timeValue) {
        const [hours, minutes] = timeValue.split(":").map(Number);
        const timeObj = dayjs().hour(hours).minute(minutes).second(0);
        setEventData((prev) => ({
          ...prev,
          time: {
            ...prev.time,
            [field]: timeObj,
          },
        }));
      } else {
        setEventData((prev) => ({
          ...prev,
          time: {
            ...prev.time,
            [field]: null,
          },
        }));
      }
    },
    []
  );

  const generateTimeOptions = (
    isEndTime = false,
    selectedStartTime?: Dayjs | null
  ) => {
    const options = [];

    if (isEndTime && selectedStartTime) {
      const startTimeHour = selectedStartTime.hour();
      const startTimeMinute = selectedStartTime.minute();

      let minEndTimeHour = startTimeHour;
      let minEndTimeMinute = startTimeMinute + 30;

      if (minEndTimeMinute >= 60) {
        minEndTimeHour += 1;
        minEndTimeMinute = 0;
      }

      for (let hour = minEndTimeHour; hour <= 21; hour++) {
        for (const minute of [0, 30]) {
          if (hour === 21 && minute > 0) continue;

          if (hour === minEndTimeHour && minute < minEndTimeMinute) continue;

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
    } else {
      for (let hour = 9; hour <= 21; hour++) {
        for (const minute of [0, 30]) {
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
    }
    return options;
  };

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
    field: "name" | "price",
    value: string | number
  ) => {
    setEventData((prev) => {
      const updatedOptions = [...(prev.options || [])];
      updatedOptions[categoryIndex].choices[choiceIndex] = {
        ...updatedOptions[categoryIndex].choices[choiceIndex],
        [field]: value,
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
          choices: [{ name: "", price: 0 }],
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
      updatedOptions[categoryIndex].choices.push({ name: "", price: 0 });
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

      if (updatedOptions[categoryIndex].choices.length === 0) {
        updatedOptions[categoryIndex].choices.push({ name: "", price: 0 });
      }

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const handleDiscountChange = (
    field: keyof NonNullable<EventData["discount"]>,
    value: string | number
  ) => {
    setEventData((prev) => ({
      ...prev,
      discount: {
        type: prev.discount?.type || "percentage",
        value: prev.discount?.value || 0,
        minParticipants: prev.discount?.minParticipants || 2,
        name: prev.discount?.name || "",
        description: prev.discount?.description || "",
        ...prev.discount,
        [field]: value,
      },
    }));
  };

  const calculateDiscountedPrice = (): string => {
    if (
      !eventData.price ||
      !eventData.discount?.value ||
      !eventData.isDiscountAvailable
    ) {
      return "";
    }

    const price = eventData.price;
    const discountValue = eventData.discount.value;

    if (isNaN(price) || isNaN(discountValue)) {
      return "";
    }

    let discountedPrice: number;
    if (eventData.discount.type === "percentage") {
      discountedPrice = price - (price * discountValue) / 100;
    } else {
      discountedPrice = price - discountValue;
    }

    return discountedPrice > 0 ? `$${discountedPrice.toFixed(2)}` : "$0.00";
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Edit Event
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Hidden inputs to prevent autocomplete */}
        <div style={{ display: "none" }}>
          <input type="text" name="username" autoComplete="username" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
          />
        </div>
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
            value={eventData.eventName}
            onChange={handleInputChange}
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event name"
          />
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
            value={eventData.eventType}
            onChange={handleInputChange}
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="class">Class</option>
            <option value="workshop">Workshop</option>
            <option value="camp">Camp</option>
            <option value="artist">Artist</option>
            <option value="reservation">Reservation</option>
          </select>
        </div>

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" && (
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
                value={eventData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    handleInputChange(e);
                  }
                }}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Price"
              />
            </div>
          )}

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" && (
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
                value={eventData.numberOfParticipants || ""}
                onChange={handleInputChange}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div
          className={`col-span-1 md:col-span-2 grid grid-cols-1 ${eventData.eventType === "reservation" ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
        >
          <div>
            <label
              htmlFor="dates.startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {eventData.eventType === "reservation" && (
            <div>
              <label
                htmlFor="dates.endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="dates.endDate"
                name="dates.endDate"
                value={eventData.dates?.endDate || ""}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="time.startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time
            </label>
            <select
              id="time.startTime"
              name="time.startTime"
              value={
                eventData.time?.startTime
                  ? eventData.time.startTime.format("HH:mm")
                  : ""
              }
              onChange={(e) => handleTimeChange(e, "startTime")}
              required
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select start time</option>
              {generateTimeOptions()}
            </select>
          </div>
          <div>
            <label
              htmlFor="time.endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <select
              id="time.endTime"
              name="time.endTime"
              value={
                eventData.time?.endTime
                  ? eventData.time.endTime.format("HH:mm")
                  : ""
              }
              onChange={(e) => handleTimeChange(e, "endTime")}
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select end time</option>
              {generateTimeOptions(true, eventData.time?.startTime)}
            </select>
          </div>
        </div>

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" && (
            <div className="col-span-1 md:col-span-2 flex items-center">
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
                Recurring Event
              </label>
            </div>
          )}

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" &&
          eventData.dates?.isRecurring && (
            <>
              <div>
                <label
                  htmlFor="dates.recurringPattern"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recurring Pattern
                </label>
                <select
                  id="dates.recurringPattern"
                  name="dates.recurringPattern"
                  value={eventData.dates?.recurringPattern || "weekly"}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
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
                  htmlFor="dates.recurringEndDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  onClick={() => handleDateInputClick(recurringEndDateInputRef)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
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
            value={eventData.description}
            onChange={handleInputChange}
            rows={4}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide a detailed description of the event"
          ></textarea>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label
            htmlFor="imageFile"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
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
              <p className="text-sm text-gray-600">Preview:</p>
              <div className="relative inline-block">
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded event image"
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

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" && (
            <div className="col-span-1 md:col-span-2 flex items-center mt-4">
              <input
                type="checkbox"
                id="hasOptions"
                name="hasOptions"
                checked={eventData.options && eventData.options.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    addOptionCategory();
                  } else {
                    setEventData((prev) => ({
                      ...prev,
                      options: undefined,
                    }));
                  }
                }}
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

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" &&
          eventData.options &&
          eventData.options.length > 0 && (
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Event Options
              </h3>

              {eventData.options.map((option, categoryIndex) => (
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
                        value={option.categoryName}
                        onChange={(e) =>
                          handleOptionCategoryChange(
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
                        value={option.categoryDescription || ""}
                        onChange={(e) =>
                          handleOptionCategoryChange(
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Category Description"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choices
                    </label>
                    {option.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex flex-col gap-3 mb-3 p-3 bg-gray-50 rounded-md"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
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
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter Choice"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`choice-price-${categoryIndex}-${choiceIndex}`}
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Choice Price (Optional)
                            </label>
                            <input
                              type="text"
                              id={`choice-price-${categoryIndex}-${choiceIndex}`}
                              value={choice.price?.toString() || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                  handleOptionChoiceChange(
                                    categoryIndex,
                                    choiceIndex,
                                    "price",
                                    parseFloat(value) || 0
                                  );
                                }
                              }}
                              autoComplete="new-password"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck="false"
                              data-lpignore="true"
                              data-form-type="other"
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
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

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" && (
            <div className="col-span-1 md:col-span-2 flex items-center mt-4">
              <input
                type="checkbox"
                id="isDiscountAvailable"
                name="isDiscountAvailable"
                checked={eventData.isDiscountAvailable || false}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    isDiscountAvailable: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isDiscountAvailable"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Add Discount
              </label>
            </div>
          )}

        {/* Reservation Settings (only for reservation events) */}
        {eventData.eventType === "reservation" && (
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Reservation Settings
            </h3>

            {/* Max Participants Per Day */}
            <div>
              <label
                htmlFor="reservationSettings.dailyCapacity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Daily Capacity (Optional)
              </label>
              <select
                id="reservationSettings.dailyCapacity"
                name="reservationSettings.dailyCapacity"
                value={eventData.reservationSettings?.dailyCapacity || ""}
                onChange={handleInputChange}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No capacity limit</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num} participant{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {eventData.eventType !== "artist" &&
          eventData.eventType !== "reservation" &&
          eventData.isDiscountAvailable && (
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Discount Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="discountName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    id="discountName"
                    value={eventData.discount?.name || ""}
                    onChange={(e) =>
                      handleDiscountChange("name", e.target.value)
                    }
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Discount Name to appear on class card"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    value={eventData.discount?.type || "percentage"}
                    onChange={(e) =>
                      handleDiscountChange(
                        "type",
                        e.target.value as "percentage" | "fixed"
                      )
                    }
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="discountValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Value{" "}
                    {eventData.discount?.type === "percentage" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="text"
                    id="discountValue"
                    value={eventData.discount?.value?.toString() || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleDiscountChange("value", parseFloat(value) || 0);
                      }
                    }}
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      eventData.discount?.type === "percentage"
                        ? "Enter percentage"
                        : "Enter dollar amount"
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="minParticipants"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Participants for Discount
                  </label>
                  <select
                    id="minParticipants"
                    value={eventData.discount?.minParticipants || 2}
                    onChange={(e) =>
                      handleDiscountChange(
                        "minParticipants",
                        parseInt(e.target.value)
                      )
                    }
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => (
                      <option key={num} value={num}>
                        {num} participants
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="discountDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="discountDescription"
                    value={eventData.discount?.description || ""}
                    onChange={(e) =>
                      handleDiscountChange("description", e.target.value)
                    }
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description that will display when condition is met in payments page"
                  />
                </div>
              </div>

              {eventData.price && eventData.discount?.value && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Original Price:</span> $
                    {eventData.price}
                    <br />
                    <span className="font-medium">Discounted Price:</span>{" "}
                    {calculateDiscountedPrice()}
                    <br />
                    <span className="text-xs">
                      (Applies when {eventData.discount?.minParticipants || 2}{" "}
                      or more participants sign up)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

        <div className="col-span-1 md:col-span-2 text-center">
          <button
            type="submit"
            disabled={
              isSaving || isImageUploading || isImageLoading || isDeletingImage
            }
            className={`w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center ${
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
}
