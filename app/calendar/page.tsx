// import Calendar from "@/components/calendar/MonthCalendar";

import NewCalendar from "@/components/calendar/NewCalendar";
import React from "react";

export default function CalendarPage() {
  return (
    <main className="min-h-screen py-12">
      <h1 className="text-center text-2xl font-bold mb-6">Events Calendar</h1>
      <NewCalendar />
    </main>
  );
}
