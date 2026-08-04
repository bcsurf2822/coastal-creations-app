"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./calendar.css";
import { useRouter } from "next/navigation";
import { CalendarEvent, ApiEvent } from "@/types/interfaces";
import type { EventClickArg, EventHoveringArg } from "@fullcalendar/core";
import EventPopover, { type PopoverEvent, type PopoverMode } from "./EventPopover";

// Hover-intent delay: only open a preview once the pointer rests on an event,
// so sweeping across stacked events doesn't spawn/flicker popovers.
const HOVER_OPEN_DELAY_MS = 220;
// Grace period before closing on pointer-leave, so crossing the gap between
// the event chip and the popover (the "hover bridge") doesn't kill it early.
const HOVER_CLOSE_DELAY_MS = 180;

export default function NewCalendar() {
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventParticipantCounts, setEventParticipantCounts] = useState<
    Record<string, number>
  >({});

  const router = useRouter();

  const [popover, setPopover] = useState<{
    event: PopoverEvent;
    anchorRect: DOMRect;
    mode: PopoverMode;
  } | null>(null);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closePopover = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    setPopover(null);
  }, [clearOpenTimer, clearCloseTimer]);

  // Cancel a pending close — called when the pointer (re)enters either the
  // event chip or the popover itself, so moving between them never drops it.
  const cancelClose = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setPopover(null);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const scheduleOpen = useCallback(
    (event: PopoverEvent, anchorRect: DOMRect) => {
      clearOpenTimer();
      clearCloseTimer();
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        setPopover({ event, anchorRect, mode: "hover" });
      }, HOVER_OPEN_DELAY_MS);
    },
    [clearOpenTimer, clearCloseTimer]
  );

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearOpenTimer, clearCloseTimer]);

  // Any popover (hover or pinned) is anchored to a specific chip's on-screen
  // position captured at open time — scrolling, resizing, or paging the
  // calendar to a new month all invalidate that position, so close rather
  // than risk a stale, misplaced card.
  useEffect(() => {
    if (!popover) return;
    const dismiss = (): void => closePopover();
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [popover, closePopover]);

  const resources = [
    { id: "class", title: "Classes", eventColor: "#0c4a6e" },
    { id: "camp", title: "Camps", eventColor: "#0369a1" },
    { id: "workshop", title: "Workshops", eventColor: "#fb923c" },
  ];

  // Add a helper function to convert 24-hour time to 12-hour time
  const convertTo12Hour = useCallback((time24: string): string => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  }, []);

  // Transform API events to FullCalendar format
  const transformEvents = useCallback(
    (apiEvents: ApiEvent[]): CalendarEvent[] => {
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
                isFree: event.isFree,
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
              const [hours, minutes] = event.time.endTime
                .split(":")
                .map(Number);
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
                isFree: event.isFree,
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
              isFree: event.isFree,
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
    },
    [convertTo12Hour]
  );

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

    // Generate events until end date (compare date portions only,
    // since endDate may have earlier hours than the event start time)
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
    while (currentDate <= endDateOnly) {
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

    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customer", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error(
            "Failed to parse customer response as JSON:",
            parseError
          );
          return;
        }

        if (!response.ok) {
          console.error(
            "Failed to fetch customers:",
            result.error || "Unknown error"
          );
          return;
        }

        // Calculate participant counts per event
        const participantCounts: Record<string, number> = {};

        if (result.data && Array.isArray(result.data)) {
          result.data.forEach(
            (customer: { event?: { _id: string }; quantity: number }) => {
              const eventId = customer.event?._id;
              if (eventId) {
                // Add the quantity (number of participants) for this registration
                participantCounts[eventId] =
                  (participantCounts[eventId] || 0) + customer.quantity;
              }
            }
          );
        }
        setEventParticipantCounts(participantCounts);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchEvents();
    fetchCustomers();
  }, [transformEvents]);

  // Event colors using brand palette
  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case "kid-class":
      case "adult-class":
      case "adult-kid-class":
      case "class":
        return "#0c4a6e"; // --color-primary
      case "camp":
        return "#0369a1"; // --color-secondary
      case "event":
      case "workshop":
        return "#fb923c"; // --color-accent
      case "artist":
        return "#326C85"; // --color-blue-medium
      default:
        return "#0c4a6e"; // --color-primary
    }
  };

  const navigateToPayment = (eventId: string, eventTitle: string, price?: number, isFree?: boolean) => {
    const params = new URLSearchParams();
    params.set("eventId", eventId);
    params.set("eventTitle", eventTitle);
    if (isFree || price === 0) {
      params.set("price", "0");
      params.set("isFree", "true");
    } else if (price !== undefined) {
      params.set("price", String(price));
    }
    router.push(`/payments?${params.toString()}`);
  };

  // Shared by both the hover preview and the click/tap popover — previously
  // duplicated between eventMouseEnter and eventClick, which is how they'd
  // drifted into showing two different views of the same event.
  const toPopoverEvent = useCallback(
    (event: EventClickArg["event"] | EventHoveringArg["event"]): PopoverEvent => {
      const props = event.extendedProps as Record<string, unknown>;
      const eventType = (props?.eventType as string) || "";
      const eventId = (props?._id as string) || "";
      const currentSignups = eventId
        ? eventParticipantCounts[eventId] || 0
        : 0;
      const maxParticipants = 20;
      return {
        title: event.title,
        eventType,
        timeDisplay: (props?.timeDisplay as string) || "",
        price: props?.price as number | undefined,
        isFree: props?.isFree as boolean | undefined,
        description: props?.description as string | undefined,
        currentSignups,
        isRecurring: props?.isRecurring as boolean | undefined,
        recurringPattern: props?.recurringPattern as string | undefined,
        recurringEndDate: props?.recurringEndDate as string | Date | undefined,
        _id: eventId,
        isSoldOut: eventType !== "artist" && currentSignups >= maxParticipants,
      };
    },
    [eventParticipantCounts]
  );

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
        editable={false}
        selectable={false}
        events={events}
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        resources={calendarView.includes("resource") ? resources : undefined}
        datesSet={(dateInfo) => {
          setCalendarView(dateInfo.view.type);
          // Paging to a new month invalidates any open popover's anchor position.
          closePopover();
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
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          clearOpenTimer();
          clearCloseTimer();
          setPopover({
            event: toPopoverEvent(info.event),
            anchorRect: info.el.getBoundingClientRect(),
            mode: "pinned",
          });
        }}
        eventMouseEnter={(info) => {
          // A pinned (clicked/tapped) popover is only dismissed explicitly —
          // hovering a different chip must not silently steal it away.
          if (popover?.mode === "pinned") return;
          // Only open hover previews on devices with a true hover-capable,
          // fine pointer (mouse). Touch/coarse pointers rely on eventClick's
          // pinned popover instead — a synthetic hover must never leave a
          // stuck popover behind on a device that can't "leave" it.
          if (
            typeof window !== "undefined" &&
            !window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            return;
          }
          scheduleOpen(toPopoverEvent(info.event), info.el.getBoundingClientRect());
        }}
        eventMouseLeave={() => {
          // Never let hover tracking close a pinned popover — see eventMouseEnter.
          if (popover?.mode === "pinned") return;
          clearOpenTimer();
          // Grace period, not immediate removal — gives the pointer time to
          // cross the gap onto the popover itself (the "hover bridge") without
          // the popover disappearing out from under it.
          scheduleClose();
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

      {popover && (
        <EventPopover
          event={popover.event}
          anchorRect={popover.anchorRect}
          mode={popover.mode}
          eventColor={getEventColor(popover.event.eventType)}
          onRequestClose={closePopover}
          // Bridge-safe dismissal only applies to a hover preview — a pinned
          // (clicked/tapped) popover stays open regardless of pointer
          // position until explicitly dismissed.
          onPointerEnter={popover.mode === "hover" ? cancelClose : () => {}}
          onPointerLeave={popover.mode === "hover" ? scheduleClose : () => {}}
          onSignUp={() => {
            const { _id, title, price, isFree } = popover.event;
            closePopover();
            navigateToPayment(_id, title, price, isFree);
          }}
          onViewDetails={() => {
            const { _id } = popover.event;
            closePopover();
            router.push(`/events/live-artist/${_id}`);
          }}
        />
      )}
    </div>
  );
}
