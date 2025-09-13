'use client'
import { ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EventFormBase from "./EventFormBase";
import { useEventData } from "./shared/hooks/useEventData";

const EditEventForm = (): ReactElement => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const { eventData, isLoading, error, existingImageUrl } = useEventData(eventId);

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

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Error</h1>
          <p className="text-red-500">No event ID provided</p>
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
      <EventFormBase
        mode="edit"
        eventId={eventId}
        title="Edit Event"
        existingImageUrl={existingImageUrl}
        initialData={eventData || undefined}
      />
    </div>
  );
};

export default EditEventForm;