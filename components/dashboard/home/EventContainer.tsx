"use client";

import { useState, useEffect } from "react";
import { IEvent } from "@/lib/models/Event";
import { DashboardEvent, DashboardReservation } from "@/types/interfaces";
import {
  RiCalendarEventLine,
  RiTimeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
} from "react-icons/ri";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";

type DashboardItem = DashboardEvent | DashboardReservation;

interface ReservationApiData {
  _id: string;
  eventName: string;
  description?: string;
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay?: number;
  dates?: {
    startDate: string;
    endDate: string;
  };
  time?: {
    startTime: string;
    endTime: string;
  };
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{ name: string }>;
  }>;
  isDiscountAvailable?: boolean;
  discount?: {
    type?: string;
    value?: number;
    description?: string;
  };
  dailyAvailability?: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}

// Define types for SimpleDialog props
interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  itemDetails: DashboardItem;
  onDelete: (itemId: string, onSuccess?: () => void) => void;
  isDeleting: boolean;
}

interface ItemDetailsDialogProps {
  itemDetails: DashboardItem;
  onClose: () => void;
  onDelete: (itemId: string, onSuccess?: () => void) => void;
  isDeleting: boolean;
}

function ItemDetailsDialog({
  itemDetails,
  onClose,
  onDelete,
  isDeleting,
}: ItemDetailsDialogProps) {
  if (!itemDetails) return null;

  const editUrl = itemDetails.eventType === "reservation"
    ? `/admin/dashboard/edit-reservation?id=${itemDetails.id}`
    : `/admin/dashboard/edit-event?id=${itemDetails.id}`;

  return (
    <div className="p-4">
      <Typography variant="h6">{itemDetails.name}</Typography>
      <Typography variant="body1">{itemDetails.description}</Typography>
      <Typography variant="body2" color="textSecondary">
        Date:{" "}
        {itemDetails.startDate
          ? new Date(itemDetails.startDate).toLocaleDateString()
          : "N/A"}
      </Typography>
      <div className="flex space-x-2 mt-4">
        <Link
          href={editUrl}
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
          onClick={() => onDelete(itemDetails.id, onClose)}
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
  itemDetails,
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
      <ItemDetailsDialog
        itemDetails={itemDetails}
        onClose={onClose}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}


const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function EventContainer() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [deletingItemIds, setDeletingItemIds] = useState<Set<string>>(
    new Set()
  );
  const [itemParticipantCounts, setItemParticipantCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);

        // Fetch events and reservations in parallel
        const [eventsResponse, reservationsResponse] = await Promise.all([
          fetch("/api/events", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/reservations", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        ]);

        // Process events
        let allItems: DashboardItem[] = [];

        if (eventsResponse.ok) {
          const eventsText = await eventsResponse.text();
          const eventsResult = eventsText ? JSON.parse(eventsText) : {};
          const eventsData = eventsResult.events || eventsResult;

          if (Array.isArray(eventsData)) {
            const transformedEvents: DashboardEvent[] = eventsData.map((event: IEvent) => ({
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
              image: event.image,
              options: event.options,
              isDiscountAvailable: event.isDiscountAvailable,
              discount: event.discount,
            }));
            allItems = [...allItems, ...transformedEvents];
          }
        }

        // Process reservations
        if (reservationsResponse.ok) {
          const reservationsText = await reservationsResponse.text();
          const reservationsResult = reservationsText ? JSON.parse(reservationsText) : {};
          const reservationsData = reservationsResult.data || reservationsResult.reservations || reservationsResult;

          if (Array.isArray(reservationsData)) {
            const transformedReservations: DashboardReservation[] = reservationsData.map((reservation: ReservationApiData) => ({
              id: reservation._id,
              name: reservation.eventName,
              description: reservation.description,
              eventType: "reservation" as const,
              pricePerDayPerParticipant: reservation.pricePerDayPerParticipant,
              maxParticipantsPerDay: reservation.maxParticipantsPerDay ||
                (reservation.dailyAvailability && reservation.dailyAvailability.length > 0
                  ? reservation.dailyAvailability[0].maxParticipants
                  : 10),
              startDate: reservation.dates?.startDate ? new Date(reservation.dates.startDate) : undefined,
              endDate: reservation.dates?.endDate ? new Date(reservation.dates.endDate) : undefined,
              startTime: reservation.time?.startTime,
              endTime: reservation.time?.endTime,
              image: reservation.image,
              options: reservation.options,
              isDiscountAvailable: reservation.isDiscountAvailable,
              discount: reservation.discount,
              dailyAvailability: reservation.dailyAvailability || [],
            }));
            allItems = [...allItems, ...transformedReservations];
          }
        }

        // Sort items by start date - closest items first, furthest items last
        const sortedItems = allItems.sort((a, b) => {
          const dateA = new Date(a.startDate || 0);
          const dateB = new Date(b.startDate || 0);
          return dateA.getTime() - dateB.getTime();
        });

        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
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
        setItemParticipantCounts(participantCounts);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchItems();
    fetchCustomers();
  }, []);

  // const handleEventClick = (event: Event) => {
  //   setSelectedEvent(event);
  //   setIsDialogOpen(true);
  // };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteItem = async (itemId: string, onSuccess?: () => void) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    // Add item ID to deleting set
    setDeletingItemIds((prev) => new Set(prev).add(itemId));

    try {
      // Determine the API endpoint based on item type
      const item = items.find(i => i.id === itemId);
      const endpoint = item?.eventType === "reservation"
        ? `/api/reservations?id=${itemId}`
        : `/api/events?id=${itemId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Remove item from local state immediately for real-time update
      setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));

      // Clear selected item if it was the one being deleted
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }

      // Call success callback if provided (for dialog close)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      // Remove item ID from deleting set
      setDeletingItemIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
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

  // Filter items based on search term and type filter
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesFilter = !filterType || item.eventType === filterType;

    return matchesSearch && matchesFilter;
  });

  const itemTypes = Array.from(
    new Set(items.map((item) => item.eventType))
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
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

            <div className="relative">
              <select
                value={filterType || ""}
                onChange={(e) => setFilterType(e.target.value || null)}
                className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full sm:w-auto"
              >
                <option value="">All Types</option>
                {itemTypes.map(
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No matching items found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg border ${
                    selectedItem?.id === item.id
                      ? "border-blue-500 dark:border-blue-400"
                      : "border-gray-200 dark:border-gray-700"
                  } p-4 transition-all hover:shadow-md ${
                    deletingItemIds.has(item.id)
                      ? "opacity-50 pointer-events-none relative"
                      : ""
                  }`}
                >
                  {deletingItemIds.has(item.id) && (
                    <div className="absolute inset-0 bg-white/75 dark:bg-gray-800/75 rounded-lg flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Deleting...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      {item.image && (
                        <div className="flex-shrink-0">
                          <Image
                            src={urlFor(item.image)?.width(80).height(60).url() || ''}
                            alt={item.name}
                            width={80}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <RiCalendarEventLine className="mr-1" />
                          <span>{formatDate(item.startDate)}</span>
                          {item.startTime && (
                            <>
                              <RiTimeLine className="ml-3 mr-1" />
                              <span>{formatTime(item.startTime)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.eventType === "class"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : item.eventType === "workshop"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : item.eventType === "reservation"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {item.eventType || "Event"}
                      </span>
                      {item.isDiscountAvailable && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-medium">
                          Discount
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    {item.eventType === "reservation" ? (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(item as DashboardReservation).pricePerDayPerParticipant}/day/participant
                      </div>
                    ) : (
                      (item as DashboardEvent).price !== undefined && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item as DashboardEvent).price}
                        </div>
                      )
                    )}
                    {item.eventType !== "artist" && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {itemParticipantCounts[item.id] || 0} /{" "}
                        {item.eventType === "reservation"
                          ? (item as DashboardReservation).maxParticipantsPerDay
                          : (item as DashboardEvent).numberOfParticipants || 20
                        } participants
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={item.eventType === "reservation"
                          ? `/admin/dashboard/reservations/${item.id}`
                          : `/admin/dashboard/events/${item.id}`
                        }
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                      >
                        <span>
                          {item.eventType === "reservation" ? "View Reservation" : "View Event"}
                        </span>
                      </Link>
                      <Link
                        href={item.eventType === "reservation"
                          ? `/admin/dashboard/edit-reservation?id=${item.id}`
                          : `/admin/dashboard/edit-event?id=${item.id}`
                        }
                        className="flex items-center space-x-1 p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <RiEdit2Line className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </Link>
                    </div>

                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        deletingItemIds.has(item.id)
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                      }`}
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deletingItemIds.has(item.id)}
                      title={`Delete ${item.eventType === "reservation" ? "reservation" : "event"}`}
                    >
                      {deletingItemIds.has(item.id) ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <RiDeleteBinLine className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {selectedItem && (
        <SimpleDialog
          open={isDialogOpen}
          onClose={closeDialog}
          itemDetails={selectedItem}
          onDelete={handleDeleteItem}
          isDeleting={deletingItemIds.has(selectedItem.id)}
        />
      )}
    </div>
  );
}
