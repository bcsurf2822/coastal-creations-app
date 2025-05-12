"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useState, useEffect } from "react";
import "./calendar.css";

// Define the type for calendar events
interface CalendarEvent {
  title: string;
  start: Date | string;
  end?: Date | string;
  resourceId?: string;
  allDay?: boolean;
  id?: string;
  extendedProps?: {
    description?: string;
    eventType?: string;
    price?: number;
    timeDisplay?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringEndDate?: string | Date;
    originalStartDate?: string;
  };
}

// Define the type for API events based on your mongoose model
interface ApiEvent {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: string;
    recurringEndDate?: string;
    specificDates?: string[];
    excludeDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function NewCalendar() {
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const resources = [
    { id: "class", title: "Classes", eventColor: "#3788d8" },
    { id: "camp", title: "Camps", eventColor: "green" },
    { id: "workshop", title: "Workshops", eventColor: "orange" },
  ];

  // Transform API events to FullCalendar format
  const transformEvents = (apiEvents: ApiEvent[]): CalendarEvent[] => {
    let calendarEvents: CalendarEvent[] = [];

    apiEvents.forEach((event) => {
      // Format time display
      const timeDisplay = `${event.time.startTime}${event.time.endTime ? ` - ${event.time.endTime}` : ""}`;

      // Handle non-recurring events
      if (!event.dates.isRecurring) {
        // Create a date object for the start date
        const startDate = new Date(event.dates.startDate);
        const startTime = event.time.startTime;

        // Create start datetime by combining date and time
        let start = startDate;
        if (startTime) {
          const [hours, minutes] = startTime.split(":").map(Number);
          start = new Date(startDate);
          start.setHours(hours || 0, minutes || 0);
        }

        // Create end datetime if endDate or endTime exists
        let end = undefined;
        if (event.dates.endDate) {
          end = new Date(event.dates.endDate);

          // Add end time if it exists
          if (event.time.endTime) {
            const [hours, minutes] = event.time.endTime.split(":").map(Number);
            end.setHours(hours || 0, minutes || 0);
          }
        } else if (event.time.endTime && !event.dates.endDate) {
          // If no end date but end time exists, use start date with end time
          const [hours, minutes] = event.time.endTime.split(":").map(Number);
          end = new Date(startDate);
          end.setHours(hours || 0, minutes || 0);
        }

        calendarEvents.push({
          id: event._id,
          title: event.eventName,
          start,
          end,
          resourceId: event.eventType,
          extendedProps: {
            description: event.description,
            eventType: event.eventType,
            price: event.price,
            timeDisplay,
            isRecurring: false,
          },
        });
      }
      // Handle recurring events
      else if (event.dates.isRecurring && event.dates.recurringPattern) {
        const startDate = new Date(event.dates.startDate);
        const recurringEndDate = event.dates.recurringEndDate
          ? new Date(event.dates.recurringEndDate)
          : null;

        // If there's no end date, use a reasonable default (e.g., 3 months from start)
        const endDate =
          recurringEndDate ||
          new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        // Generate recurring event instances
        const instances = generateRecurringEvents(
          event._id,
          event.eventName,
          startDate,
          endDate,
          event.dates.recurringPattern,
          event.time.startTime,
          event.time.endTime,
          event.dates.excludeDates || []
        );

        // Add extended props to each instance
        instances.forEach((instance) => {
          instance.resourceId = event.eventType;
          instance.extendedProps = {
            ...instance.extendedProps,
            description: event.description,
            eventType: event.eventType,
            price: event.price,
            timeDisplay,
            isRecurring: true,
            recurringPattern: event.dates.recurringPattern,
            recurringEndDate: event.dates.recurringEndDate,
          };
        });

        calendarEvents = [...calendarEvents, ...instances];
      }
    });

    return calendarEvents;
  };

  // Helper function to generate recurring event instances
  const generateRecurringEvents = (
    id: string,
    title: string,
    startDate: Date,
    endDate: Date,
    pattern: string,
    startTime: string,
    endTime?: string,
    excludeDates: string[] = []
  ): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const excludeDatesSet = new Set(
      excludeDates.map((d) => new Date(d).toDateString())
    );

    // Convert time strings to hours and minutes
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime
      ? endTime.split(":").map(Number)
      : [0, 0];

    // Create a copy of the start date to avoid modifying the original
    let currentDate = new Date(startDate);

    // Set the time on the current date
    currentDate.setHours(startHours || 0, startMinutes || 0, 0, 0);

    // Calculate interval based on pattern
    let dayInterval = 1;
    switch (pattern) {
      case "daily":
        dayInterval = 1;
        break;
      case "weekly":
        dayInterval = 7;
        break;
      case "monthly":
        // For simplicity, we'll consider a month as 30 days
        dayInterval = 30;
        break;
      case "yearly":
        // For simplicity, we'll consider a year as 365 days
        dayInterval = 365;
        break;
    }

    // Generate events until end date
    while (currentDate <= endDate) {
      // Check if this date should be excluded
      if (!excludeDatesSet.has(currentDate.toDateString())) {
        let eventEnd;

        if (endTime) {
          eventEnd = new Date(currentDate);
          eventEnd.setHours(endHours, endMinutes, 0, 0);

          // If end time is earlier than start time, assume it's the next day
          if (eventEnd < currentDate) {
            eventEnd.setDate(eventEnd.getDate() + 1);
          }
        }

        events.push({
          id: `${id}-${currentDate.getTime()}`,
          title: title,
          start: new Date(currentDate),
          end: eventEnd,
          extendedProps: {
            originalStartDate: new Date(startDate).toISOString(),
          },
        });
      }

      // Move to the next occurrence
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + dayInterval);
    }

    return events;
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.success) {
          console.log("Fetched events:", data.events);
          if (Array.isArray(data.events) && data.events.length > 0) {
            const calendarEvents = transformEvents(data.events);
            setEvents(calendarEvents);
          } else {
            // Fallback for testing if no events exist
            setEvents([
              { title: "Test Class", start: new Date(), resourceId: "class" },
              {
                title: "Test Camp",
                start: new Date(Date.now() + 86400000),
                end: new Date(Date.now() + 172800000),
                resourceId: "camp",
              },
              {
                title: "Test Workshop",
                start: new Date(Date.now() + 345600000),
                resourceId: "workshop",
              },
            ]);
          }
        } else {
          console.error("Failed to fetch events:", data.error);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, []);

  // Define a function to get event colors based on type
  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case "class":
        return "#3788d8"; // Blue
      case "camp":
        return "green";
      case "workshop":
        return "orange";
      default:
        return "#3788d8"; // Default blue
    }
  };

  // Add a handler for event signup
  const handleEventSignup = (eventId: string, eventTitle: string) => {
    // You can replace this with actual signup functionality
    console.log(`Signing up for event: ${eventTitle} (ID: ${eventId})`);
    alert(
      `You've signed up for ${eventTitle}! A confirmation email will be sent shortly.`
    );
    // Here you would typically call an API to handle the signup
  };

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
        eventClassNames={(arg) => {
          const eventType =
            arg.event.extendedProps?.eventType ||
            arg.event.getResources()[0]?.id ||
            "";
          return [`event-type-${eventType}`];
        }}
        eventContent={(arg) => {
          return {
            html: `<div class="fc-event-title">${arg.event.title}</div>`,
          };
        }}
        eventDidMount={(info) => {
          // Set event color based on event type
          const eventType =
            info.event.extendedProps?.eventType ||
            (info.event.getResources().length > 0
              ? info.event.getResources()[0].id
              : "");

          if (eventType) {
            info.el.style.backgroundColor = getEventColor(eventType);
          }

          // Create tooltip with all event details
          const tooltip = document.createElement("div");
          tooltip.className = "event-tooltip";

          // Build tooltip content
          let tooltipContent = `<div class="tooltip-title">${info.event.title}</div>`;

          if (info.event.extendedProps?.timeDisplay) {
            tooltipContent += `<div class="tooltip-time">${info.event.extendedProps.timeDisplay}</div>`;
          }

          if (info.event.extendedProps?.eventType) {
            tooltipContent += `<div class="tooltip-type">Type: ${info.event.extendedProps.eventType}</div>`;
          }

          if (info.event.extendedProps?.price) {
            tooltipContent += `<div class="tooltip-price">Price: $${info.event.extendedProps.price}</div>`;
          }

          if (info.event.extendedProps?.isRecurring) {
            tooltipContent += `<div class="tooltip-recurring">
              Recurring: ${info.event.extendedProps.recurringPattern} 
              ${info.event.extendedProps.recurringEndDate ? `until ${new Date(info.event.extendedProps.recurringEndDate).toLocaleDateString()}` : ""}
            </div>`;
          }

          if (info.event.extendedProps?.description) {
            tooltipContent += `<div class="tooltip-description">${info.event.extendedProps.description.substring(0, 100)}${info.event.extendedProps.description.length > 100 ? "..." : ""}</div>`;
          }

          // Add signup button - only for non-recurring events or the first occurrence of recurring events
          const isRecurring = info.event.extendedProps?.isRecurring;
          const isFirstOccurrence = isRecurring
            ? info.event.start &&
              info.event.extendedProps?.originalStartDate &&
              new Date(info.event.start).toDateString() ===
                new Date(
                  info.event.extendedProps.originalStartDate
                ).toDateString()
            : true;

          if (!isRecurring || isFirstOccurrence) {
            tooltipContent += `<div class="tooltip-signup">
              <button id="signup-${info.event.id || "event"}" type="button">Sign Up</button>
            </div>`;
          }

          tooltip.innerHTML = tooltipContent;
          info.el.appendChild(tooltip);

          // Add event listener to the signup button
          setTimeout(() => {
            const signupButton = document.getElementById(
              `signup-${info.event.id || "event"}`
            );
            if (signupButton) {
              signupButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent event from closing
                handleEventSignup(info.event.id || "unknown", info.event.title);
              });
            }
          }, 0);
        }}
      />
    </div>
  );
}
