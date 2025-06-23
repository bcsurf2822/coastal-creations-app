"use client";

import { RiCalendarEventFill, RiMoneyDollarCircleFill } from "react-icons/ri";
import EventContainer from "@/components/dashboard/home/EventContainer";

// Stat card component
function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "positive",
}: {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  const changeColor = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
          {change && (
            <p className={`text-sm mt-2 ${changeColor[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // These would typically come from API calls in a real implementation
  const stats = {
    totalEvents: "TBD",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="inline-flex">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

      {/* Events section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Event Management
        </h3>
        <EventContainer />
      </div>
    </div>
  );
}
