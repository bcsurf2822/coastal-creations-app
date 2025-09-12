/**
 * @fileoverview Event form component with controlled form inputs and native validation
 * @module components/dashboard/add-event/EventForm
 */

"use client";

import React, { ReactElement, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  EventFormData,
  EventType,
  getDefaultValuesForEventType,
  validators,
  OptionCategory,
} from "../../../lib/types/eventTypes";

const EventForm = (): ReactElement => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const recurringEndDateInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<EventFormData>(() => 
    getDefaultValuesForEventType("class") as EventFormData
  );
  
  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Image upload state
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Prepare date for submission to prevent timezone issues
  const prepareDateForSubmit = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    // Create a Date object using local components to prevent timezone shift
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toISOString();
  };

  // Handle form field changes
  const handleInputChange = useCallback((field: keyof EventFormData, value: string | boolean | File | null | OptionCategory[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle nested field changes (like discount.value)
  const handleNestedChange = useCallback((field: string, value: string | number) => {
    const fieldParts = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < fieldParts.length - 1; i++) {
        if (!current[fieldParts[i]]) {
          current[fieldParts[i]] = {};
        }
        current = current[fieldParts[i]];
      }
      
      current[fieldParts[fieldParts.length - 1]] = value;
      return newData;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle event type change and reset form values accordingly
  const handleEventTypeChange = useCallback((newEventType: EventType) => {
    const defaultValues = getDefaultValuesForEventType(newEventType);
    setFormData(defaultValues as EventFormData);
    setUploadedImageUrl(null);
    setImageUploadStatus(null);
    setErrors({});
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!formData.eventName) {
      setErrors(prev => ({ ...prev, image: "Please enter an event name first" }));
      return;
    }

    setIsImageUploading(true);
    setImageUploadStatus("Uploading image...");

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("eventName", formData.eventName);

      const response = await fetch("/api/events/upload-image", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setUploadedImageUrl(data.imageUrl);
      setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
      setImageUploadStatus("Image uploaded successfully!");

      setTimeout(() => setImageUploadStatus(null), 3000);
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors(prev => ({ ...prev, image: "Failed to upload image. Please try again." }));
      setImageUploadStatus("Failed to upload image");
    } finally {
      setIsImageUploading(false);
    }
  }, [formData.eventName]);

  // Handle file upload with form integration
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      if (formData.eventName) {
        handleImageUpload(file);
      } else {
        setErrors(prev => ({ ...prev, image: "Please enter an event name first" }));
      }
    }
  }, [formData.eventName, handleImageUpload]);

  // Option category management
  const addOptionCategory = useCallback(() => {
    const newCategory: OptionCategory = {
      categoryName: "",
      categoryDescription: "",
      choices: [{ name: "", price: "" }],
    };
    
    setFormData(prev => ({
      ...prev,
      optionCategories: [...(prev.optionCategories || []), newCategory]
    }));
  }, []);

  const removeOptionCategory = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      optionCategories: prev.optionCategories?.filter((_, i) => i !== index)
    }));
  }, []);

  const addChoiceToCategory = useCallback((categoryIndex: number) => {
    setFormData(prev => {
      const newCategories = [...(prev.optionCategories || [])];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        choices: [...newCategories[categoryIndex].choices, { name: "", price: "" }]
      };
      return { ...prev, optionCategories: newCategories };
    });
  }, []);

  const removeChoiceFromCategory = useCallback((categoryIndex: number, choiceIndex: number) => {
    setFormData(prev => {
      const newCategories = [...(prev.optionCategories || [])];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        choices: newCategories[categoryIndex].choices.filter((_, i) => i !== choiceIndex)
      };
      return { ...prev, optionCategories: newCategories };
    });
  }, []);

  const updateOptionCategory = useCallback((categoryIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newCategories = [...(prev.optionCategories || [])];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        [field]: value
      };
      return { ...prev, optionCategories: newCategories };
    });
  }, []);

  const updateChoice = useCallback((categoryIndex: number, choiceIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newCategories = [...(prev.optionCategories || [])];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        choices: newCategories[categoryIndex].choices.map((choice, i) => 
          i === choiceIndex ? { ...choice, [field]: value } : choice
        )
      };
      return { ...prev, optionCategories: newCategories };
    });
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validations
    const requiredError = validators.required(formData.eventName, "Event name");
    if (requiredError) newErrors.eventName = requiredError;

    const descError = validators.required(formData.description, "Description");
    if (descError) newErrors.description = descError;
    else {
      const minLengthError = validators.minLength(formData.description, 10, "Description");
      if (minLengthError) newErrors.description = minLengthError;
    }

    const startDateError = validators.required(formData.startDate, "Start date");
    if (startDateError) newErrors.startDate = startDateError;
    else {
      const dateFormatError = validators.dateFormat(formData.startDate, "Start date");
      if (dateFormatError) newErrors.startDate = dateFormatError;
      else {
        const futureDateError = validators.futureDate(formData.startDate, "Start date");
        if (futureDateError) newErrors.startDate = futureDateError;
      }
    }

    const startTimeError = validators.required(formData.startTime, "Start time");
    if (startTimeError) newErrors.startTime = startTimeError;
    else {
      const timeFormatError = validators.timeFormat(formData.startTime, "Start time");
      if (timeFormatError) newErrors.startTime = timeFormatError;
    }

    const endTimeError = validators.required(formData.endTime, "End time");
    if (endTimeError) newErrors.endTime = endTimeError;
    else {
      const timeFormatError = validators.timeFormat(formData.endTime, "End time");
      if (timeFormatError) newErrors.endTime = timeFormatError;
      else {
        const endAfterStartError = validators.endTimeAfterStart(formData.startTime, formData.endTime);
        if (endAfterStartError) newErrors.endTime = endAfterStartError;
      }
    }

    // Event type specific validations
    if (formData.eventType !== "artist" && formData.eventType !== "reservation") {
      const priceError = validators.required(formData.price, "Price");
      if (priceError) newErrors.price = priceError;
      else {
        const numError = validators.positiveNumber(formData.price, "Price");
        if (numError) newErrors.price = numError;
      }

      const participantsError = validators.required(formData.numberOfParticipants, "Number of participants");
      if (participantsError) newErrors.numberOfParticipants = participantsError;
      else {
        const rangeError = validators.range(formData.numberOfParticipants, 1, 20, "Number of participants");
        if (rangeError) newErrors.numberOfParticipants = rangeError;
      }
    }

    // Reservation specific validations
    if (formData.eventType === "reservation") {
      const endDateError = validators.required(formData.endDate, "End date");
      if (endDateError) newErrors.endDate = endDateError;
      else {
        const dateFormatError = validators.dateFormat(formData.endDate, "End date");
        if (dateFormatError) newErrors.endDate = dateFormatError;
        else {
          const futureDateError = validators.futureDate(formData.endDate, "End date");
          if (futureDateError) newErrors.endDate = futureDateError;
          else {
            const endAfterStartError = validators.endDateAfterStart(formData.startDate, formData.endDate);
            if (endAfterStartError) newErrors.endDate = endAfterStartError;
          }
        }
      }
    }

    // Recurring event validations
    if (formData.eventType !== "artist" && formData.eventType !== "reservation" && formData.isRecurring) {
      const recurringEndError = validators.required(formData.recurringEndDate, "Recurring end date");
      if (recurringEndError) newErrors.recurringEndDate = recurringEndError;
      else {
        const dateFormatError = validators.dateFormat(formData.recurringEndDate, "Recurring end date");
        if (dateFormatError) newErrors.recurringEndDate = dateFormatError;
        else {
          const futureDateError = validators.futureDate(formData.recurringEndDate, "Recurring end date");
          if (futureDateError) newErrors.recurringEndDate = futureDateError;
          else {
            const endAfterStartError = validators.endDateAfterStart(formData.startDate, formData.recurringEndDate);
            if (endAfterStartError) newErrors.recurringEndDate = endAfterStartError;
          }
        }
      }
    }

    // Options validations
    if (formData.eventType !== "artist" && formData.eventType !== "reservation" && formData.hasOptions) {
      if (!formData.optionCategories || formData.optionCategories.length === 0) {
        newErrors.optionCategories = "At least one option category is required when options are enabled";
      } else {
        formData.optionCategories.forEach((category, categoryIndex) => {
          if (!category.categoryName.trim()) {
            newErrors[`optionCategories.${categoryIndex}.categoryName`] = "Category name is required";
          }
          category.choices.forEach((choice, choiceIndex) => {
            if (!choice.name.trim()) {
              newErrors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.name`] = "Choice name is required";
            }
            if (choice.price && choice.price.trim()) {
              const priceError = validators.positiveNumber(choice.price, "Choice price");
              if (priceError) {
                newErrors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.price`] = priceError;
              }
            }
          });
        });
      }
    }

    // Discount validations
    if (formData.eventType !== "artist" && formData.isDiscountAvailable && formData.discount) {
      if (!formData.discount.name.trim()) {
        newErrors["discount.name"] = "Discount name is required";
      }
      
      const discountValueError = validators.required(formData.discount.value, "Discount value");
      if (discountValueError) newErrors["discount.value"] = discountValueError;
      else {
        const numError = validators.positiveNumber(formData.discount.value, "Discount value");
        if (numError) newErrors["discount.value"] = numError;
        else {
          const discountValue = parseFloat(formData.discount.value);
          if (formData.discount.type === "percentage" && discountValue > 100) {
            newErrors["discount.value"] = "Percentage discount cannot exceed 100%";
          }
          if (formData.discount.type === "fixed" && formData.price) {
            const price = parseFloat(formData.price);
            if (discountValue >= price) {
              newErrors["discount.value"] = "Fixed discount cannot be greater than or equal to the price";
            }
          }
        }
      }

      const minParticipantsError = validators.required(formData.discount.minParticipants, "Minimum participants");
      if (minParticipantsError) newErrors["discount.minParticipants"] = minParticipantsError;
      else {
        const rangeError = validators.range(formData.discount.minParticipants, 2, 20, "Minimum participants");
        if (rangeError) newErrors["discount.minParticipants"] = rangeError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(`Validation error: ${firstError}`);
      }
      return;
    }

    isSubmittingRef.current = true;

    try {
      console.log("[EventForm-onSubmit] Raw form data received:", {
        startDate: formData.startDate,
        endDate: formData.endDate,
        recurringEndDate: formData.recurringEndDate,
        eventName: formData.eventName,
        eventType: formData.eventType,
        description: formData.description,
        price: formData.price,
        numberOfParticipants: formData.numberOfParticipants,
        startTime: formData.startTime,
        endTime: formData.endTime,
        allData: formData,
      });

      // Transform form data to match Event model structure
      const eventData = {
        ...formData,
        image: uploadedImageUrl,
        // Transform dates for different event types
        dates: {
          startDate: prepareDateForSubmit(formData.startDate),
          isRecurring:
            formData.eventType !== "reservation"
              ? formData.isRecurring || false
              : false,
          ...(formData.eventType === "reservation" &&
            formData.endDate && {
              endDate: prepareDateForSubmit(formData.endDate),
            }),
          ...(formData.eventType !== "reservation" &&
            formData.isRecurring && {
              recurringPattern: formData.recurringPattern,
              recurringEndDate: prepareDateForSubmit(formData.recurringEndDate || ""),
            }),
        },
        time: {
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        // Transform options data structure and field name
        ...(formData.hasOptions && formData.optionCategories && formData.optionCategories.length > 0 && {
          options: formData.optionCategories.map(category => ({
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription,
            choices: category.choices.map(choice => ({
              name: choice.name,
              price: choice.price ? parseFloat(choice.price) : 0,
            })),
          })),
        }),
        // Transform discount data to numbers
        ...(formData.isDiscountAvailable && formData.discount && {
          discount: {
            ...formData.discount,
            value: parseFloat(formData.discount.value),
            minParticipants: parseInt(formData.discount.minParticipants, 10),
          },
        }),
        // Transform price and numberOfParticipants to numbers
        ...(formData.price && { price: parseFloat(formData.price) }),
        ...(formData.numberOfParticipants && { numberOfParticipants: parseInt(formData.numberOfParticipants, 10) }),
        // Remove form-only fields that shouldn't be sent to API
        hasOptions: undefined,
        optionCategories: undefined,
        isDiscountAvailable: undefined,
        imageUrl: undefined,
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
    return errors[fieldPath] || null;
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

  const isReservationEvent = formData.eventType === "reservation";

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="bg-white rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              value={formData.eventType}
              onChange={(e) => handleEventTypeChange(e.target.value as EventType)}
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
              value={formData.eventName}
              onChange={(e) => handleInputChange("eventName", e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
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
                  value={formData.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
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
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
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
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select end time</option>
                {generateTimeOptions(true, formData.startTime)}
              </select>
              {getFieldError("endTime") && (
                <p className="text-red-600 text-sm mt-1">
                  {getFieldError("endTime")}
                </p>
              )}
            </div>
          </div>

          {/* Pricing and Participants (not for artist or reservation events) */}
          {formData.eventType !== "artist" && formData.eventType !== "reservation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      handleInputChange("price", value);
                    }
                  }}
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
                  value={formData.numberOfParticipants || ""}
                  onChange={(e) => handleInputChange("numberOfParticipants", e.target.value)}
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
                  <Image
                    src={uploadedImageUrl}
                    alt="Event preview"
                    width={400}
                    height={256}
                    className="max-w-full h-auto max-h-64 mx-auto rounded-md object-contain"
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
          {formData.eventType !== "artist" && formData.eventType !== "reservation" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring || false}
                  onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is a recurring event
                </label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recurring Pattern <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.recurringPattern || "weekly"}
                      onChange={(e) => handleInputChange("recurringPattern", e.target.value)}
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
                      value={formData.recurringEndDate || ""}
                      onChange={(e) => handleInputChange("recurringEndDate", e.target.value)}
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
          {formData.eventType !== "artist" && formData.eventType !== "reservation" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasOptions || false}
                  onChange={(e) => handleInputChange("hasOptions", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  This event has additional options
                </label>
              </div>

              {formData.hasOptions && (
                <div className="ml-6 space-y-6">
                  {(formData.optionCategories || []).map((category, categoryIndex) => (
                    <div
                      key={categoryIndex}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">
                          Option Category {categoryIndex + 1}
                        </h4>
                        {(formData.optionCategories || []).length > 1 && (
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
                            value={category.categoryName}
                            onChange={(e) => updateOptionCategory(categoryIndex, "categoryName", e.target.value)}
                            autoComplete="new-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-form-type="other"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Add-ons, Extras"
                          />
                          {getFieldError(`optionCategories.${categoryIndex}.categoryName`) && (
                            <p className="text-red-600 text-sm mt-1">
                              {getFieldError(`optionCategories.${categoryIndex}.categoryName`)}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Description
                          </label>
                          <textarea
                            value={category.categoryDescription || ""}
                            onChange={(e) => updateOptionCategory(categoryIndex, "categoryDescription", e.target.value)}
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
                            {category.choices.map((choice, choiceIndex) => (
                              <div
                                key={choiceIndex}
                                className="flex space-x-2 items-end"
                              >
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={choice.name}
                                    onChange={(e) => updateChoice(categoryIndex, choiceIndex, "name", e.target.value)}
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
                                    value={choice.price || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (/^\d*\.?\d*$/.test(value)) {
                                        updateChoice(categoryIndex, choiceIndex, "price", value);
                                      }
                                    }}
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
                                {category.choices.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeChoiceFromCategory(categoryIndex, choiceIndex)}
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
          {formData.eventType !== "artist" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDiscountAvailable || false}
                  onChange={(e) => handleInputChange("isDiscountAvailable", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Offer discount for multiple participants
                </label>
              </div>

              {formData.isDiscountAvailable && formData.discount && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.discount.name}
                      onChange={(e) => handleNestedChange("discount.name", e.target.value)}
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
                      value={formData.discount.type}
                      onChange={(e) => handleNestedChange("discount.type", e.target.value)}
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
                      value={formData.discount.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          handleNestedChange("discount.value", value);
                        }
                      }}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        formData.discount.type === "percentage"
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
                      value={formData.discount.minParticipants}
                      onChange={(e) => handleNestedChange("discount.minParticipants", e.target.value)}
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
                      value={formData.discount.description || ""}
                      onChange={(e) => handleNestedChange("discount.description", e.target.value)}
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
                  {formData.price && formData.discount.value && (
                    <div className="md:col-span-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">Original Price:</span> $
                        {formData.price}
                        <br />
                        <span className="font-medium">Discounted Price:</span>{" "}
                        {(() => {
                          const price = parseFloat(formData.price || "0");
                          const discountValue = parseFloat(formData.discount?.value || "0");
                          const discountType = formData.discount?.type;
                          
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
                          (Applies when {formData.discount?.minParticipants || 2} or
                          more participants sign up)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Reservation Discounts */}
              {formData.eventType === "reservation" && formData.isDiscountAvailable && (
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
                  value={formData.reservationSettings?.dailyCapacity || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    setFormData(prev => ({
                      ...prev,
                      reservationSettings: {
                        ...prev.reservationSettings,
                        dayPricing: prev.reservationSettings?.dayPricing || [{ numberOfDays: 1, price: 75 }],
                        dailyCapacity: value
                      }
                    }));
                  }}
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
              disabled={isSubmittingRef.current}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingRef.current ? "Creating..." : "Create Event"}
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