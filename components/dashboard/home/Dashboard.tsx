"use client";

import EventContainer from "@/components/dashboard/home/EventContainer";
import AddButton from "@/components/dashboard/shared/AddButton";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Management
        </h2>
        <AddButton href="/admin/dashboard/add-event" label="Add Event" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

      <div className="mt-8">
        <EventContainer />
      </div>
    </div>
  );
}
