"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useState, useEffect } from "react";
import "./calendar.css";
import { useRouter } from "next/navigation";
import { CalendarEvent, ApiEvent } from "@/types/interfaces";

export default function NewCalendar() {
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const router = useRouter();

  // Add state to track the currently visible tooltip
  const [activeTooltip, setActiveTooltip] = useState<HTMLElement | null>(null);
  const [tooltipTimeoutId, setTooltipTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const resources = [
    { id: "class", title: "Classes", eventColor: "#3788d8" },
    { id: "camp", title: "Camps", eventColor: "green" },
    { id: "workshop", title: "Workshops", eventColor: "orange" },
  ];

  // Add a helper function to convert 24-hour time to 12-hour time
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Transform API events to FullCalendar format
  const transformEvents = (apiEvents: ApiEvent[]): CalendarEvent[] => {
    let calendarEvents: CalendarEvent[] = [];

    apiEvents.forEach((event) => {
      // Format time display with 12-hour conversion
      const startTime12h = convertTo12Hour(event.time.startTime);
      const endTime12h = event.time.endTime
        ? convertTo12Hour(event.time.endTime)
        : "";
      const timeDisplay = `${startTime12h}${endTime12h ? ` - ${endTime12h}` : ""}`;

      // Handle non-recurring events
      if (!event.dates.isRecurring) {
        const startDate = new Date(event.dates.startDate);
        const endDate = event.dates.endDate
          ? new Date(event.dates.endDate)
          : null;

        // If event spans multiple days, create individual instances for each day
        // Compare only the date parts, not time
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const endDateOnly = endDate
          ? new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            )
          : null;

        if (
          endDate &&
          endDateOnly &&
          endDateOnly.getTime() !== startDateOnly.getTime()
        ) {
          // Generate individual instances for each day in the range
          const instances = generateRecurringEvents(
            event._id,
            event.eventName,
            startDateOnly,
            endDateOnly!, // We know endDateOnly is not null here due to the if condition
            "daily", // Treat as daily to create individual instances
            event.time.startTime,
            event.time.endTime,
            []
          );

          // Add extended props to each instance
          instances.forEach((instance) => {
            instance.resourceId = event.eventType;
            instance.extendedProps = {
              ...instance.extendedProps,
              _id: event._id,
              description: event.description,
              eventType: event.eventType,
              price: event.price,
              timeDisplay,
              isRecurring: false,
              isMultiDay: true,
            };
          });

          calendarEvents = [...calendarEvents, ...instances];
        } else {
          // Single day event - handle normally
          const startTime = event.time.startTime;

          // Create start datetime by combining date and time
          let start = startDate;
          if (startTime) {
            const [hours, minutes] = startTime.split(":").map(Number);
            start = new Date(startDate);
            start.setHours(hours || 0, minutes || 0);
          }

          // Create end datetime if endTime exists
          let end = undefined;
          if (event.time.endTime) {
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
              _id: event._id,
              description: event.description,
              eventType: event.eventType,
              price: event.price,
              timeDisplay,
              isRecurring: false,
            },
          });
        }
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
            _id: event._id,
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

          // If end time is earlier than start time, this might be a data error
          // For daily recurring events, we should keep them on the same day
          if (eventEnd < currentDate) {
            // For daily recurring events, don't span to next day as it creates visual issues
            // Instead, log a warning and keep the end time on the same day
            console.warn(
              `Event "${title}" has end time before start time. This may be a data entry error.`
            );
            // Set end time to null to make it a point-in-time event
            eventEnd = undefined;
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
   
          if (Array.isArray(data.events) && data.events.length > 0) {
            const calendarEvents = transformEvents(data.events);
            setEvents(calendarEvents);
          } else {
            // No events found, set empty array
            setEvents([]);
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
  const navigateToEvent = (eventId: string) => {
    // console.log(`Navigating to event: ${eventTitle} (ID: ${eventId})`);
    router.push(`/calendar/${eventId}`);
  };

  // Cleanup function for tooltips
  useEffect(() => {
    return () => {
      // Remove any tooltips when component unmounts
      if (activeTooltip && document.body.contains(activeTooltip)) {
        document.body.removeChild(activeTooltip);
      }
    };
  }, [activeTooltip]);

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
          left: "",
          center: "prev title next",
          right: "",
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
        eventMouseEnter={(info) => {
          // Remove any existing tooltip DOM element
          if (activeTooltip && document.body.contains(activeTooltip)) {
            document.body.removeChild(activeTooltip);
            // Note: activeTooltip state will be updated by setActiveTooltip(tooltip) below
          }

          // Clear any pending hide timeout for a previous tooltip, as we are showing a new one.
          if (tooltipTimeoutId) {
            clearTimeout(tooltipTimeoutId);
            setTooltipTimeoutId(null);
          }

          // Create new tooltip
          const tooltip = document.createElement("div");
          tooltip.className = "event-tooltip";

          // Build tooltip content
          let tooltipContent = `<div class="tooltip-title">${info.event.title}</div>`;

          if (info.event.extendedProps?.timeDisplay) {
            tooltipContent += `<div class="tooltip-time">${info.event.extendedProps.timeDisplay}</div>`;
          }

          // if (info.event.extendedProps?.eventType) {
          //   tooltipContent += `<div class="tooltip-type">Type: ${info.event.extendedProps.eventType}</div>`;
          // }

          if (info.event.extendedProps?.price) {
            tooltipContent += `<div class="tooltip-price">Price: $${info.event.extendedProps.price}</div>`;
          }

          if (info.event.extendedProps?.isRecurring) {
            tooltipContent += `<div class="tooltip-recurring">
              Recurring ${info.event.extendedProps.recurringPattern} 
              ${info.event.extendedProps.recurringEndDate ? `until ${new Date(info.event.extendedProps.recurringEndDate).toLocaleDateString()}` : ""}
            </div>`;
          }

          if (info.event.extendedProps?.description) {
            tooltipContent += `<div class="tooltip-description">${info.event.extendedProps.description}</div>`;
          }

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
              <button id="signup-${info.event.extendedProps?._id || "event"}" type="button">Sign Up</button>
            </div>`;
          }

          tooltip.innerHTML = tooltipContent;

          // Add to body first to get accurate dimensions
          document.body.appendChild(tooltip);

          // Position the tooltip with smart boundary checking
          const rect = info.el.getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate initial centered position
          let left = rect.left + rect.width / 2;
          let top = rect.top - 10;
          let transformX = "-50%";
          let transformY = "-100%";

          // Check horizontal boundaries
          const tooltipHalfWidth = tooltipRect.width / 2;
          const margin = 16; // Minimum margin from screen edge

          if (left - tooltipHalfWidth < margin) {
            // Too far left - align to left edge with margin
            left = margin;
            transformX = "0%";
          } else if (left + tooltipHalfWidth > viewportWidth - margin) {
            // Too far right - align to right edge with margin
            left = viewportWidth - margin;
            transformX = "-100%";
          }

          // Check vertical boundaries
          const tooltipHeight = tooltipRect.height;
          const spaceAbove = rect.top;
          const spaceBelow = viewportHeight - rect.bottom;

          if (
            spaceAbove < tooltipHeight + margin &&
            spaceBelow > tooltipHeight + margin
          ) {
            // Not enough space above, position below
            top = rect.bottom + 10;
            transformY = "0%";
          } else if (
            spaceAbove < tooltipHeight + margin &&
            spaceBelow < tooltipHeight + margin
          ) {
            // Not enough space above or below, center vertically
            top = viewportHeight / 2;
            transformY = "-50%";

            // If centering vertically, also ensure we're not too close to edges horizontally
            if (left < viewportWidth / 2) {
              left = Math.max(margin, rect.right + 10);
              transformX = "0%";
            } else {
              left = Math.min(viewportWidth - margin, rect.left - 10);
              transformX = "-100%";
            }
          }

          // Apply positioning
          tooltip.style.position = "fixed";
          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
          tooltip.style.transform = `translate(${transformX}, ${transformY})`;
          tooltip.style.zIndex = "99999";
          tooltip.style.display = "block";

          setActiveTooltip(tooltip);

          // Add event listeners to the tooltip itself
          tooltip.addEventListener("mouseenter", () => {
            // If a hide timer was set by eventMouseLeave, cancel it because mouse is now over tooltip
            if (tooltipTimeoutId) {
              clearTimeout(tooltipTimeoutId);
              setTooltipTimeoutId(null);
            }
          });

          tooltip.addEventListener("mouseleave", () => {
            // Mouse left the tooltip, so remove it
            if (document.body.contains(tooltip)) {
              document.body.removeChild(tooltip);
            }
            // If this tooltip was the active one, update state
            if (activeTooltip === tooltip) {
              setActiveTooltip(null);
            }
            // Clear any lingering timeout (safety measure)
            if (tooltipTimeoutId) {
              clearTimeout(tooltipTimeoutId);
              setTooltipTimeoutId(null);
            }
          });

          // Add event listener for the signup button
          setTimeout(() => {
            const signupButton = document.getElementById(
              `signup-${info.event.extendedProps?._id || "event"}`
            );
            if (signupButton) {
              signupButton.addEventListener("click", (e) => {
                e.stopPropagation();
                navigateToEvent(info.event.extendedProps?._id || "unknown");
              });
            }
          }, 0);
        }}
        eventMouseLeave={(leaveInfo) => {
          const relatedTarget = leaveInfo.jsEvent.relatedTarget as Node | null;

          if (
            activeTooltip &&
            relatedTarget &&
            (activeTooltip === relatedTarget ||
              activeTooltip.contains(relatedTarget))
          ) {
            if (tooltipTimeoutId) {
              clearTimeout(tooltipTimeoutId);
              setTooltipTimeoutId(null);
            }
            return;
          }

          const newTimeoutId = setTimeout(() => {
            if (activeTooltip && document.body.contains(activeTooltip)) {
              document.body.removeChild(activeTooltip);
              setActiveTooltip(null);
            }
            setTooltipTimeoutId(null); // Clear the ID as the timeout has executed
          }, 3000); // Adjust delay as needed (e.g., 150ms)
          setTooltipTimeoutId(newTimeoutId);
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
        }}
      />
    </div>
  );
}
