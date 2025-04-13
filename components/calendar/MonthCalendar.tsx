"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

type EventType = "class" | "workshop" | "event" | "exhibition";

interface CalendarEvent {
  date: Date;
  title: string;
  time: string;
  type: EventType;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Mock events data
  const events: CalendarEvent[] = [
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5),
      title: "Watercolor Workshop",
      time: "10:00 AM",
      type: "class",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8),
      title: "Kids Craft Hour",
      time: "3:30 PM",
      type: "workshop",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12),
      title: "Advanced Pottery",
      time: "6:00 PM",
      type: "class",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
      title: "Paint & Sip",
      time: "7:00 PM",
      type: "event",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 20),
      title: "Coastal Art Exhibition",
      time: "All Day",
      type: "exhibition",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 22),
      title: "Beginners Sketching",
      time: "4:00 PM",
      type: "class",
    },
    {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 25),
      title: "Photography Basics",
      time: "1:00 PM",
      type: "workshop",
    },
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const getEventTypeColor = (type: EventType) => {
    const colors = {
      class: "bg-blue-100 text-blue-800",
      workshop: "bg-green-100 text-green-800",
      event: "bg-purple-100 text-purple-800",
      exhibition: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // List of all months for the dropdown
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  // Generate array of years (current year and 2 years before and after)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
          Calendar of Events
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold order-first sm:order-none">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <div className="flex gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={handleMonthChange}
              className="py-2 px-3 border border-gray-300 rounded-md"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={handleYearChange}
              className="py-2 px-3 border border-gray-300 rounded-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-bold py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-8">
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div
              key={`empty-start-${index}`}
              className="bg-gray-50 min-h-[100px] border border-gray-200 rounded"
            ></div>
          ))}

          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-1 sm:p-2 border ${
                  isToday(day) ? "border-2 border-primary" : "border-gray-200"
                } rounded flex flex-col overflow-hidden`}
              >
                <div className="text-right font-medium">{format(day, "d")}</div>
                <div className="flex flex-col gap-1 flex-grow overflow-y-auto">
                  {dayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={`mt-1 p-1 sm:p-2 rounded text-xs sm:text-sm ${getEventTypeColor(
                        event.type
                      )}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs">{event.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <div
              key={`empty-end-${index}`}
              className="bg-gray-50 min-h-[100px] border border-gray-200 rounded"
            ></div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-6 py-3 bg-primary text-white text-lg font-medium rounded-md shadow-md hover:bg-primary/90 transition-colors">
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
