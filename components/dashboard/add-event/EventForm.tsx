/**
 * @fileoverview Event form component with React Hook Form and Zod validation
 * @module components/dashboard/add-event/EventForm
 */

"use client";

import React, { ReactElement, useRef, useCallback, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  unifiedEventFormSchema,
  UnifiedEventFormData,
  getDefaultValuesForEventType,
  EventType,
} from "../../../lib/validations/eventFormValidation";

const EventForm = (): ReactElement => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const recurringEndDateInputRef = useRef<HTMLInputElement>(null);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    control,
    clearErrors,
    setError,
    reset,
  } = useForm<UnifiedEventFormData>({
    resolver: zodResolver(unifiedEventFormSchema),
    defaultValues: getDefaultValuesForEventType("class"),
    mode: "onBlur",
  });

  // Watch event type to conditionally show/hide fields
  const eventType = watch("eventType");
  const isRecurring = watch("isRecurring");
  const hasOptions = watch("hasOptions");
  const isDiscountAvailable = watch("isDiscountAvailable");
  const isReservationEvent = eventType === "reservation";

  // Field arrays for dynamic option categories
  const {
    fields: optionCategoryFields,
    append: appendOptionCategory,
    remove: removeOptionCategory,
  } = useFieldArray({
    control,
    name: "optionCategories",
  });

  // State for image upload (not part of form since we upload separately)
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(
    null
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Handle event type change and reset form values accordingly
  const handleEventTypeChange = useCallback(
    (newEventType: EventType) => {
      const defaultValues = getDefaultValuesForEventType(newEventType);
      reset(defaultValues);
      setUploadedImageUrl(null);
      setImageUploadStatus(null);
    },
    [reset]
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      const eventName = watch("eventName");
      if (!eventName) {
        setError("image", { message: "Please enter an event name first" });
        return;
      }

      setIsImageUploading(true);
      setImageUploadStatus("Uploading image...");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("eventName", eventName);

        const response = await fetch("/api/events/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setUploadedImageUrl(data.imageUrl);
        setValue("imageUrl", data.imageUrl);
        clearErrors("image");
        setImageUploadStatus("Image uploaded successfully!");

        setTimeout(() => setImageUploadStatus(null), 3000);
      } catch (error) {
        console.error("Image upload failed:", error);
        setError("image", {
          message: "Failed to upload image. Please try again.",
        });
        setImageUploadStatus("Failed to upload image");
      } finally {
        setIsImageUploading(false);
      }
    },
    [watch, setValue, clearErrors, setError]
  );

  // Handle file upload with form integration
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue("image", file);
        const eventName = watch("eventName");
        if (eventName) {
          handleImageUpload(file);
        } else {
          setError("image", { message: "Please enter an event name first" });
        }
      }
    },
    [setValue, watch, setError, handleImageUpload]
  );

  // Option category management
  const addOptionCategory = useCallback(() => {
    appendOptionCategory({
      categoryName: "",
      categoryDescription: "",
      choices: [{ name: "", price: "" }],
    });
  }, [appendOptionCategory]);

  const addChoiceToCategory = useCallback(
    (categoryIndex: number) => {
      const currentCategories = watch("optionCategories") || [];
      const updatedCategories = [...currentCategories];
      updatedCategories[categoryIndex].choices.push({ name: "", price: "" });
      setValue("optionCategories", updatedCategories);
    },
    [setValue, watch]
  );

  const removeChoiceFromCategory = useCallback(
    (categoryIndex: number, choiceIndex: number) => {
      const currentCategories = watch("optionCategories") || [];
      const updatedCategories = [...currentCategories];
      updatedCategories[categoryIndex].choices.splice(choiceIndex, 1);
      setValue("optionCategories", updatedCategories);
    },
    [setValue, watch]
  );

  // Handle form submission
  const onSubmit: SubmitHandler<UnifiedEventFormData> = async (data) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    try {
      // Transform form data to match Event model structure
      const eventData = {
        ...data,
        imageUrl: uploadedImageUrl,
        // Transform dates for different event types
        dates: {
          startDate: data.startDate,
          isRecurring:
            data.eventType !== "reservation"
              ? data.isRecurring || false
              : false,
          ...(data.eventType === "reservation" &&
            data.endDate && {
              endDate: data.endDate,
            }),
          ...(data.eventType !== "reservation" &&
            data.isRecurring && {
              recurringPattern: data.recurringPattern,
              recurringEndDate: data.recurringEndDate,
            }),
        },
        time: {
          startTime: data.startTime,
          endTime: data.endTime,
        },
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const getFieldError = (fieldPath: string) => {
    const paths = fieldPath.split(".");
    let error: unknown = errors;
    for (const path of paths) {
      if (error && typeof error === "object" && path in error) {
        error = (error as Record<string, unknown>)[path];
      } else {
        return null;
      }
    }
    return (error as { message?: string })?.message || null;
  };

  // Generate time options from 9:00 AM to 9:00 PM with smart filtering
  const generateTimeOptions = (isEndTime = false, selectedStartTime?: string) => {
    const options = [];
    
    // For end time, filter to only show times after start time
    if (isEndTime && selectedStartTime) {
      const [startHourStr, startMinuteStr] = selectedStartTime.split(':');
      const startTimeHour = parseInt(startHourStr);
      const startTimeMinute = parseInt(startMinuteStr);
      
      // Calculate minimum end time (start time + 30 minutes)
      let minEndTimeHour = startTimeHour;
      let minEndTimeMinute = startTimeMinute + 30;
      
      if (minEndTimeMinute >= 60) {
        minEndTimeHour += 1;
        minEndTimeMinute = 0;
      }
      
      // Add options from minimum end time
      for (let hour = minEndTimeHour; hour <= 21; hour++) {
        for (const minute of [0, 30]) {
          // Skip 9:30 PM (21:30) since we only want up to 9:00 PM
          if (hour === 21 && minute > 0) continue;
          
          // Skip times before the minimum end time
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
      // Standard time options for start time or when no filtering needed
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
    }
    return options;
  };

  // Handle date input click to show picker
  const handleDateInputClick = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="bg-white rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create New Event
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* Hidden inputs to prevent autocomplete */}
          <div style={{ display: 'none' }}>
            <input type="text" name="username" autoComplete="username" />
            <input type="password" name="password" autoComplete="current-password" />
          </div>
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("eventType", {
                onChange: (e) =>
                  handleEventTypeChange(e.target.value as EventType),
              })}
              autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck="false"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">Class</option>
              <option value="workshop">Workshop</option>
              <option value="camp">Camp</option>
              <option value="artist">Artist</option>
              <option value="reservation">Reservation</option>
            </select>
            {getFieldError("eventType") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("eventType")}
              </p>
            )}
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("eventName")}
              autoComplete="new-password"
              autoCapitalize="none" 
              autoCorrect="off" 
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event name"
            />
            {getFieldError("eventName") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("eventName")}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              autoComplete="new-password"
              autoCapitalize="none" 
              autoCorrect="off" 
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event description"
            />
            {getFieldError("description") && (
              <p className="text-red-600 text-sm mt-1">
                {getFieldError("description")}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div
            className={`grid grid-cols-1 ${isReservationEvent ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate", {
                  setValueAs: (value) => value,
                })}
                ref={startDateInputRef}
                onClick={() => handleDateInputClick(startDateInputRef)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              {getFieldError("startDate") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("startDate")}
                </p>
              )}
            </div>

            {/* TODO: Implement proper reservation date range selection */}
            {isReservationEvent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("endDate", {
                    setValueAs: (value) => value,
                  })}
                  ref={endDateInputRef}
                  onClick={() => handleDateInputClick(endDateInputRef)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                {getFieldError("endDate") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("endDate")}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                {...register("startTime")}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select start time</option>
                {generateTimeOptions()}
              </select>
              {getFieldError("startTime") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("startTime")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                {...register("endTime")}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select end time</option>
                {generateTimeOptions(true, watch("startTime"))}
              </select>
              {getFieldError("endTime") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("endTime")}
                </p>
              )}
            </div>
          </div>

          {/* Pricing and Participants (not for artist or reservation events) */}
          {eventType !== "artist" && eventType !== "reservation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("price", {
                    onChange: (e) => {
                      const value = e.target.value;
                      if (!/^\d*\.?\d*$/.test(value)) {
                        e.target.value = value.slice(0, -1);
                      }
                    },
                  })}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Price"
                />
                {getFieldError("price") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("price")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Participants <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("numberOfParticipants")}
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select number of participants</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num.toString()}>
                      {num} participant{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                {getFieldError("numberOfParticipants") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("numberOfParticipants")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              {uploadedImageUrl ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImageUrl}
                    alt="Event preview"
                    className="max-w-full h-auto max-h-64 mx-auto rounded-md"
                    onLoad={() => setIsImageLoading(false)}
                    onLoadStart={() => setIsImageLoading(true)}
                  />
                  {isImageLoading && (
                    <div className="text-blue-600">Loading image...</div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-6xl text-gray-400 mb-4">📷</div>
                  <p className="text-gray-500 mb-4">
                    Upload an image for your event
                  </p>
                </>
              )}

              <div className="mt-4">
                <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  {isImageUploading ? "Uploading..." : "Choose File"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isImageUploading}
                  />
                </label>
              </div>

              {imageUploadStatus && (
                <p
                  className={`text-sm mt-2 ${
                    imageUploadStatus.includes("successfully")
                      ? "text-green-600"
                      : imageUploadStatus.includes("Failed")
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {imageUploadStatus}
                </p>
              )}

              {getFieldError("image") && (
                <p className="text-red-600 text-sm mt-2">
                  {getFieldError("image")}
                </p>
              )}
            </div>
          </div>

          {/* Recurring Events (not for artist or reservation events) */}
          {eventType !== "artist" && eventType !== "reservation" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("isRecurring")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is a recurring event
                </label>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recurring Pattern <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("recurringPattern")}
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    {getFieldError("recurringPattern") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("recurringPattern")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("recurringEndDate", {
                        setValueAs: (value) => value,
                      })}
                      ref={recurringEndDateInputRef}
                      onClick={() => handleDateInputClick(recurringEndDateInputRef)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    {getFieldError("recurringEndDate") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("recurringEndDate")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Options System (not for artist or reservation events) */}
          {eventType !== "artist" && eventType !== "reservation" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("hasOptions")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  This event has additional options
                </label>
              </div>

              {hasOptions && (
                <div className="ml-6 space-y-6">
                  {optionCategoryFields.map((field, categoryIndex) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">
                          Option Category {categoryIndex + 1}
                        </h4>
                        {optionCategoryFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionCategory(categoryIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove Category
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(
                              `optionCategories.${categoryIndex}.categoryName`
                            )}
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
                            {...register(
                              `optionCategories.${categoryIndex}.categoryDescription`
                            )}
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
                            {(
                              watch(
                                `optionCategories.${categoryIndex}.choices`
                              ) || []
                            ).map((_, choiceIndex: number) => (
                              <div
                                key={choiceIndex}
                                className="flex space-x-2 items-end"
                              >
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    {...register(
                                      `optionCategories.${categoryIndex}.choices.${choiceIndex}.name`
                                    )}
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
                                    {...register(
                                      `optionCategories.${categoryIndex}.choices.${choiceIndex}.price`,
                                      {
                                        onChange: (e) => {
                                          const value = e.target.value;
                                          if (!/^\d*\.?\d*$/.test(value)) {
                                            e.target.value = value.slice(0, -1);
                                          }
                                        },
                                      }
                                    )}
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
                                {(
                                  watch(
                                    `optionCategories.${categoryIndex}.choices`
                                  ) || []
                                ).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeChoiceFromCategory(
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
                            onClick={() => addChoiceToCategory(categoryIndex)}
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
                    onClick={addOptionCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Option Category
                  </button>

                  {getFieldError("optionCategories") && (
                    <p className="text-red-600 text-sm">
                      {getFieldError("optionCategories")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Discount System (not for artist events) */}
          {eventType !== "artist" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("isDiscountAvailable")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Offer discount for multiple participants
                </label>
              </div>

              {isDiscountAvailable && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("discount.name")}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Group Discount"
                    />
                    {getFieldError("discount.name") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("discount.name")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("discount.type")}
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    {getFieldError("discount.type") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("discount.type")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("discount.value", {
                        onChange: (e) => {
                          const value = e.target.value;
                          if (!/^\d*\.?\d*$/.test(value)) {
                            e.target.value = value.slice(0, -1);
                          }
                        },
                      })}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        watch("discount.type") === "percentage"
                          ? "Enter percentage"
                          : "Enter dollar amount"
                      }
                    />
                    {getFieldError("discount.value") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("discount.value")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Participants{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("discount.minParticipants")}
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 19 }, (_, i) => i + 2).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} participants
                          </option>
                        )
                      )}
                    </select>
                    {getFieldError("discount.minParticipants") && (
                      <p className="text-red-600 text-sm mt-1">
                        {getFieldError("discount.minParticipants")}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Description
                    </label>
                    <textarea
                      {...register("discount.description")}
                      rows={2}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional description of the discount"
                    />
                  </div>

                  {/* Discount Calculation Preview */}
                  {watch("price") && watch("discount.value") && (
                    <div className="md:col-span-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">Original Price:</span> $
                        {watch("price")}
                        <br />
                        <span className="font-medium">Discounted Price:</span>{" "}
                        {(() => {
                          const price = parseFloat(watch("price") || "0");
                          const discountValue = parseFloat(watch("discount.value") || "0");
                          const discountType = watch("discount.type");
                          
                          if (isNaN(price) || isNaN(discountValue)) {
                            return "";
                          }

                          let discountedPrice: number;
                          if (discountType === "percentage") {
                            discountedPrice = price - (price * discountValue) / 100;
                          } else {
                            discountedPrice = price - discountValue;
                          }

                          return discountedPrice > 0 ? `$${discountedPrice.toFixed(2)}` : "$0.00";
                        })()}
                        <br />
                        <span className="text-xs">
                          (Applies when {watch("discount.minParticipants") || 2} or
                          more participants sign up)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Reservation Discounts */}
              {eventType === "reservation" && isDiscountAvailable && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <h4 className="text-md font-semibold text-blue-900">
                    Reservation Discount Options
                  </h4>
                  <p className="text-sm text-blue-700">
                    Configure advanced discount options for multi-day
                    reservations
                  </p>
                  <p className="text-xs text-orange-600">
                    Note: These advanced options will be available in a future
                    update. For now, use the basic discount settings above.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reservation Settings (only for reservation events) */}
          {isReservationEvent && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Reservation Settings
              </h3>

              {/* Daily Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Capacity (Optional)
                </label>
                <select
                  {...register("reservationSettings.dailyCapacity")}
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No capacity limit</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} participant{num > 1 ? "s" : ""} per day
                    </option>
                  ))}
                </select>
                {getFieldError("reservationSettings.dailyCapacity") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("reservationSettings.dailyCapacity")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>

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
