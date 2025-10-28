"use client";

import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { DashboardPrivateEvent } from "@/types/interfaces";
import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
  RiEyeLine,
  RiUserLine,
} from "react-icons/ri";
import AddButton from "@/components/dashboard/shared/AddButton";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface PrivateEventApiData {
  _id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
  isDepositRequired?: boolean;
  depositAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const PrivateOfferings = (): ReactElement => {
  const [privateEvents, setPrivateEvents] = useState<DashboardPrivateEvent[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingEventIds, setDeletingEventIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchPrivateEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/private-events", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch private events");
        }

        const result = await response.json();
        const privateEventsData = result.privateEvents || result.data || result;

        if (Array.isArray(privateEventsData)) {
          const transformedEvents: DashboardPrivateEvent[] =
            privateEventsData.map((event: PrivateEventApiData) => ({
              id: event._id,
              title: event.title,
              description: event.description,
              eventType: "private-event" as const,
              price: event.price,
              image: event.image,
              options: event.options,
              isDepositRequired: event.isDepositRequired,
              depositAmount: event.depositAmount,
              dates: event.createdAt ? [new Date(event.createdAt)] : [],
            }));
          setPrivateEvents(transformedEvents);
        }
      } catch (error) {
        console.error(
          "[PRIVATE-OFFERINGS-fetchPrivateEvents] Error fetching private events:",
          error
        );
        setError(typeof error === "string" ? error : (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivateEvents();
  }, []);

  const handleDeletePrivateEvent = async (eventId: string) => {
    if (
      !confirm("Are you sure you want to delete this private event offering?")
    ) {
      return;
    }

    setDeletingEventIds((prev) => new Set(prev).add(eventId));

    try {
      const response = await fetch(`/api/private-events?id=${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete private event");
      }

      setPrivateEvents((prev) => prev.filter((event) => event.id !== eventId));
      console.log(
        "[PRIVATE-OFFERINGS-handleDeletePrivateEvent] Private event deleted successfully"
      );
    } catch (error) {
      console.error(
        "[PRIVATE-OFFERINGS-handleDeletePrivateEvent] Error deleting private event:",
        error
      );
      alert("Failed to delete private event. Please try again.");
    } finally {
      setDeletingEventIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const filteredEvents = privateEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Private Event Offerings
              </h1>
            </div>
            <AddButton
              href="/admin/dashboard/add-private-event"
              label="Add Private Event"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search private events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <RiEyeLine className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "No matching private events found"
                    : "No private events yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Get started by creating your first private event offering."}
                </p>
                {!searchTerm && (
                  <AddButton
                    href="/admin/dashboard/add-private-event"
                    label="Create First Private Event"
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all ${
                      deletingEventIds.has(event.id)
                        ? "opacity-50 pointer-events-none relative"
                        : ""
                    }`}
                  >
                    {deletingEventIds.has(event.id) && (
                      <div className="absolute inset-0 bg-white/75 rounded-lg flex items-center justify-center z-10">
                        <div className="flex items-center space-x-2 text-red-600">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">
                            Deleting...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Image display */}
                    {event.image && (
                      <div className="mb-4">
                        <div className="w-full h-32 rounded-lg overflow-hidden">
                          <Image
                            src={
                              urlFor(event.image)
                                ?.width(300)
                                .height(128)
                                .url() || ""
                            }
                            alt={event.title || "Private event image"}
                            width={300}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                        Private Event
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium text-gray-900">
                          ${event.price}
                        </span>
                      </div>

                      {/* Deposit Information */}
                      {event.isDepositRequired && event.depositAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Deposit Required:
                          </span>
                          <span className="font-medium text-blue-600">
                            ${event.depositAmount}
                          </span>
                        </div>
                      )}

                      {/* Options Information */}
                      {event.options && event.options.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700 mb-2 block">
                            Available Options:
                          </span>
                          <div className="space-y-2">
                            {event.options.map((category, categoryIndex) => (
                              <div
                                key={categoryIndex}
                                className="bg-gray-50 rounded p-2"
                              >
                                <div className="text-xs font-medium text-gray-800">
                                  {category.categoryName}
                                </div>
                                {category.categoryDescription && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    {category.categoryDescription}
                                  </div>
                                )}
                                <div className="text-xs text-gray-700">
                                  {category.choices.map(
                                    (choice, choiceIndex) => (
                                      <div
                                        key={choiceIndex}
                                        className="flex justify-between items-center"
                                      >
                                        <span>{choice.name}</span>
                                        {choice.price && choice.price > 0 && (
                                          <span className="font-medium text-gray-900">
                                            +${choice.price}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/dashboard/private-events/${event.id}/customers`}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View customers"
                        >
                          <RiUserLine className="w-4 h-4 mr-1" />
                          Customers
                        </Link>
                        <Link
                          href={`/admin/dashboard/edit-private-event?id=${event.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="Edit private event"
                        >
                          <RiEdit2Line className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </div>

                      <button
                        onClick={() => handleDeletePrivateEvent(event.id)}
                        disabled={deletingEventIds.has(event.id)}
                        className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                          deletingEventIds.has(event.id)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        }`}
                        title="Delete private event"
                      >
                        {deletingEventIds.has(event.id) ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin mr-1"></div>
                        ) : (
                          <RiDeleteBinLine className="w-4 h-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateOfferings;
