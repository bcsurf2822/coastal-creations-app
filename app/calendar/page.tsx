import PageHeader from "@/components/classes/PageHeader";
import NewCalendar from "@/components/calendar/NewCalendar";
import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function CalendarPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Events Calendar"
        subtitle="Browse our full schedule of classes, workshops, camps, and events. Find the perfect creative experience for you."
        leftIcon={<FaCalendarAlt />}
        rightIcon={<FaCalendarAlt />}
      />
      <div className="py-12 pb-20">
        <NewCalendar />
      </div>
    </div>
  );
}
