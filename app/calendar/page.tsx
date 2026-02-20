import type { Metadata } from "next";
import PageHeader from "@/components/classes/PageHeader";
import NewCalendar from "@/components/calendar/NewCalendar";
import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "Browse the full schedule of art classes, workshops, camps, and events at Coastal Creations Studio in Ocean City, NJ.",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      <PageHeader
        title="Events Calendar"
        subtitle="Browse our full schedule of classes, workshops, camps, and events. Find the perfect creative experience for you."
        leftIcon={<FaCalendarAlt />}
        rightIcon={<FaCalendarAlt />}
      />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-[0_8px_24px_rgba(12,74,110,0.08)] backdrop-blur-sm sm:p-6 md:p-8">
          <NewCalendar />
        </div>
      </div>
    </div>
  );
}
