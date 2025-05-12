"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useState } from "react";
import "./calendar.css";

export default function NewCalendar() {
  const [calendarView, setCalendarView] = useState("dayGridMonth");

  const resources = [
    { id: "a", title: "Auditorium A" },
    { id: "b", title: "Auditorium B", eventColor: "green" },
    { id: "c", title: "Auditorium C", eventColor: "orange" },
  ];

  const events = [
    { title: "Meeting", start: new Date(), resourceId: "a" },
    {
      title: "Conference",
      start: new Date(Date.now() + 86400000),
      end: new Date(Date.now() + 172800000),
      resourceId: "b",
    },
    {
      title: "Workshop",
      start: new Date(Date.now() + 345600000),
      resourceId: "c",
    },
  ];

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[
          resourceTimelinePlugin,
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
        ]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "resourceTimelineWeek,dayGridMonth,timeGridWeek",
        }}
        initialView="dayGridMonth"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={events}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        resources={calendarView.includes("resource") ? resources : undefined}
        datesSet={(dateInfo) => {
          setCalendarView(dateInfo.view.type);
        }}
        height="auto"
      />
    </div>
  );
}
