"use client";

import { useState, useEffect } from "react";
import { IEvent } from "@/lib/models/Event";
import {
  RiCalendarEventLine,
  RiTimeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowRightLine,
} from "react-icons/ri";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface Event {
  id: string;
  name: string;
  description?: string;
  eventType?: string;
  price?: number;
  numberOfParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  recurringEndDate?: Date;
  startTime?: string;
  endTime?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
    }>;
  }>;
}

// Define types for SimpleDialog props
interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
  };
  onDelete: (eventId: string, onSuccess?: () => void) => void;
  isDeleting: boolean;
}

// Define types for EventDetailsDialog props
interface EventDetailsDialogProps {
  eventDetails: {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
  };
  onClose: () => void;
  onDelete: (eventId: string, onSuccess?: () => void) => void;
  isDeleting: boolean;
}

// Update EventDetailsDialog component with types
function EventDetailsDialog({
  eventDetails,
  onClose,
  onDelete,
  isDeleting,
}: EventDetailsDialogProps) {
  if (!eventDetails) return null;

  return (
    <div className="p-4">
      <Typography variant="h6">{eventDetails.name}</Typography>
      <Typography variant="body1">{eventDetails.description}</Typography>
      <Typography variant="body2" color="textSecondary">
        Date:{" "}
        {eventDetails.startDate
          ? new Date(eventDetails.startDate).toLocaleDateString()
          : "N/A"}
      </Typography>
      <div className="flex space-x-2 mt-4">
        <Link
          href={`/admin/dashboard/edit-event?id=${eventDetails.id}`}
          className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
        >
          <RiEdit2Line className="w-5 h-5" />
        </Link>
        <button
          className={`p-2 rounded-lg transition-colors relative ${
            isDeleting
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
          }`}
          onClick={() => onDelete(eventDetails.id, onClose)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-gray-300 cursor-not-allowed border-t-red-600 rounded-full animate-spin"></div>
          ) : (
            <RiDeleteBinLine className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function SimpleDialog({
  open,
  onClose,
  eventDetails,
  onDelete,
  isDeleting,
}: SimpleDialogProps) {
  return (
    <Dialog onClose={onClose} open={open}>
      <div className="flex justify-between items-center">
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <EventDetailsDialog
        eventDetails={eventDetails}
        onClose={onClose}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}

// Function to determine recurrence pattern
const getRecurrencePattern = (event: Event) => {
  if (!event.isRecurring) return "";

  // Example logic to determine if the event is daily or weekly
  // This can be adjusted based on actual data structure or requirements
  const startDate = new Date(event.startDate!);
  const recurringEndDate = new Date(event.recurringEndDate!);
  const diffInDays =
    (recurringEndDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  if (diffInDays <= 7) {
    return "Daily";
  } else {
    return "Weekly";
  }
};

export default function EventContainer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [deletingEventIds, setDeletingEventIds] = useState<Set<string>>(
    new Set()
  );
  const [eventParticipantCounts, setEventParticipantCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error("API returned invalid JSON response");
        }

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch events");
        }

        // Check if result.events exists, otherwise try to use result directly
        const eventsData = result.events || result;

        if (!Array.isArray(eventsData)) {
          throw new Error("API did not return an array of events");
        }

        // Transform the API data to match our Event interface
        const transformedEvents = eventsData.map((event: IEvent) => ({
          id: event._id,
          name: event.eventName,
          description: event.description,
          eventType: event.eventType,
          price: event.price,
          numberOfParticipants: event.numberOfParticipants,
          startDate: event.dates?.startDate,
          endDate: event.dates?.endDate,
          isRecurring: event.dates?.isRecurring,
          recurringEndDate: event.dates?.recurringEndDate,
          startTime: event.time?.startTime,
          endTime: event.time?.endTime,
          options: event.options,
        }));

        // Sort events by start date - closest events first, furthest events last
        const sortedEvents = transformedEvents.sort((a, b) => {
          const dateA = new Date(a.startDate || 0);
          const dateB = new Date(b.startDate || 0);
          return dateA.getTime() - dateB.getTime();
        });

        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(typeof error === "string" ? error : (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customer", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error(
            "Failed to parse customer response as JSON:",
            parseError
          );
          return;
        }

        if (!response.ok) {
          console.error(
            "Failed to fetch customers:",
            result.error || "Unknown error"
          );
          return;
        }

        // Calculate participant counts per event
        const participantCounts: Record<string, number> = {};

        if (result.data && Array.isArray(result.data)) {
          result.data.forEach(
            (customer: { event?: { _id: string }; quantity: number }) => {
              const eventId = customer.event?._id;
              if (eventId) {
                // Add the quantity (number of participants) for this registration
                participantCounts[eventId] =
                  (participantCounts[eventId] || 0) + customer.quantity;
              }
            }
          );
        }
        setEventParticipantCounts(participantCounts);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchEvents();
    fetchCustomers();
  }, []);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = async (eventId: string, onSuccess?: () => void) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    // Add event ID to deleting set
    setDeletingEventIds((prev) => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove event from local state immediately for real-time update
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));

      // Clear selected event if it was the one being deleted
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }

      // Call success callback if provided (for dialog close)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      // Remove event ID from deleting set
      setDeletingEventIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  // Format date function
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A";

    // Handle various time formats (HH:MM, HH:MM:SS, etc.)
    const timeParts = timeString.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
  };

  // Filter events based on search term and type filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesFilter = !filterType || event.eventType === filterType;

    return matchesSearch && matchesFilter;
  });

  // Get unique event types for filter
  const eventTypes = Array.from(
    new Set(events.map((event) => event.eventType))
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with filters */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Events
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <select
                value={filterType || ""}
                onChange={(e) => setFilterType(e.target.value || null)}
                className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full sm:w-auto"
              >
                <option value="">All Types</option>
                {eventTypes.map(
                  (type) =>
                    type && (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                )}
              </select>
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 dark:text-red-400 font-medium">
              {error}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No matching events found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Events list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg border ${
                    selectedEvent?.id === event.id
                      ? "border-blue-500 dark:border-blue-400"
                      : "border-gray-200 dark:border-gray-700"
                  } p-4 transition-all hover:shadow-md ${
                    deletingEventIds.has(event.id)
                      ? "opacity-50 pointer-events-none relative"
                      : ""
                  }`}
                >
                  {deletingEventIds.has(event.id) && (
                    <div className="absolute inset-0 bg-white/75 dark:bg-gray-800/75 rounded-lg flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Deleting...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {event.name}
                      </h4>
                      <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <RiCalendarEventLine className="mr-1" />
                        <span>{formatDate(event.startDate)}</span>
                        {event.startTime && (
                          <>
                            <RiTimeLine className="ml-3 mr-1" />
                            <span>{formatTime(event.startTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          event.eventType === "class"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : event.eventType === "workshop"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {event.eventType || "Event"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    {event.price !== undefined && (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${event.price}
                      </div>
                    )}
                    {event.eventType !== "artist" && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {eventParticipantCounts[event.id] || 0} /{" "}
                        {event.numberOfParticipants || 20} participants
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected event details */}
            {selectedEvent && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-fadeIn shadow-sm relative ${
                  deletingEventIds.has(selectedEvent.id) ? "opacity-75" : ""
                }`}
              >
                {deletingEventIds.has(selectedEvent.id) && (
                  <div className="absolute inset-0 bg-white/75 dark:bg-gray-800/75 rounded-lg flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-lg font-medium">
                        Deleting Event...
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {selectedEvent.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/dashboard/edit-event?id=${selectedEvent.id}`}
                      className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <RiEdit2Line className="w-5 h-5" />
                    </Link>
                    <button
                      className={`p-2 rounded-lg transition-colors relative ${
                        deletingEventIds.has(selectedEvent.id)
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                      }`}
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      disabled={deletingEventIds.has(selectedEvent.id)}
                    >
                      {deletingEventIds.has(selectedEvent.id) ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <RiDeleteBinLine className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider mb-3">
                      Details
                    </h4>

                    <div className="space-y-3">
                      {selectedEvent.description && (
                        <div className="text-gray-700 dark:text-gray-300 mb-4">
                          {selectedEvent.description}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedEvent.eventType || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Price
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedEvent.price !== undefined
                              ? `$${selectedEvent.price}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedEvent.options &&
                      selectedEvent.options.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider mb-3">
                            Options
                          </h4>
                          <div className="space-y-4">
                            {selectedEvent.options.map((option, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                              >
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {option.categoryName}
                                </h5>
                                {option.categoryDescription && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">
                                    {option.categoryDescription}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {option.choices.map((choice, choiceIndex) => (
                                    <span
                                      key={choiceIndex}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                      {choice.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider mb-3">
                      Schedule
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Start Date
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedEvent.startDate)}
                          </p>
                        </div>
                        {selectedEvent.endDate && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              End Date
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(selectedEvent.endDate)}
                            </p>
                          </div>
                        )}
                        {selectedEvent.isRecurring &&
                          selectedEvent.recurringEndDate && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Recurring Until
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatDate(selectedEvent.recurringEndDate)}
                              </p>
                            </div>
                          )}
                        {selectedEvent.startTime && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Time
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatTime(selectedEvent.startTime)}
                              {selectedEvent.endTime
                                ? ` - ${formatTime(selectedEvent.endTime)}`
                                : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/admin/dashboard/edit-event?id=${selectedEvent.id}`}
                        className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <span>Edit Event Details</span>
                        <RiArrowRightLine className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>

                {selectedEvent.isRecurring && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider mb-3">
                      Recurrence
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pattern
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getRecurrencePattern(selectedEvent)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Recurring Until
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedEvent.recurringEndDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <SimpleDialog
        open={isDialogOpen}
        onClose={closeDialog}
        eventDetails={
          selectedEvent || {
            id: "",
            name: "",
            description: "",
            startDate: undefined,
          }
        }
        onDelete={handleDeleteEvent}
        isDeleting={
          selectedEvent ? deletingEventIds.has(selectedEvent.id) : false
        }
      />
    </div>
  );
}
