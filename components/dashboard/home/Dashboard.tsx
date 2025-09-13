"use client";

import EventContainer from "@/components/dashboard/home/EventContainer";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Management
        </h2>
        <div className="inline-flex">
          {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Generate Report
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

      <div className="mt-8">
        <EventContainer />
      </div>
    </div>
  );
}
