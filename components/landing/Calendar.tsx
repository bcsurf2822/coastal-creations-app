"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import { useCustomers, useEvents, usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import { motion } from "motion/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ApiEvent } from "@/types/interfaces";
import { Button } from "@/components/ui";

dayjs.extend(utc);
dayjs.extend(timezone);

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const formatEventTime = (startTime?: string): string => {
  if (!startTime) {
    return "All Day";
  }

  if (!startTime.match(/^\d{1,2}:\d{2}$/)) {
    return startTime;
  }

  const [hours, minutes] = startTime.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const formatEventType = (eventType: string): string => {
  if (eventType === "artist") {
    return "Live Demo";
  }

  if (eventType === "camp") {
    return "Art Camp";
  }

  return "Workshop";
};

const EVENT_TYPE_COLORS: Record<string, { bg: string; hover: string }> = {
  "adult-class": { bg: "bg-[#326C85]", hover: "hover:bg-[#2a5b71]" },
  "kid-class": { bg: "bg-[#5b9aab]", hover: "hover:bg-[#4d8999]" },
  camp: { bg: "bg-[#e8875b]", hover: "hover:bg-[#d6764a]" },
  artist: { bg: "bg-[#8b6aad]", hover: "hover:bg-[#7a5c9a]" },
  event: { bg: "bg-[#326C85]", hover: "hover:bg-[#2a5b71]" },
};

const getEventColors = (eventType: string): { bg: string; hover: string } => {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.event;
};

interface DaySlot {
  date: dayjs.Dayjs;
  dateKey: string;
  weekday: string;
  dayNum: string;
  month: string;
  events: ApiEvent[];
}

const Calendar = (): ReactElement => {
  const router = useRouter();
  const { content } = usePageContent();
  const { data: eventsData, isLoading, error } = useEvents();
  const { data: customersData } = useCustomers();

  const subtitle = content?.homepage?.upcomingWorkshops?.subtitle
    ? portableTextToPlainText(content.homepage.upcomingWorkshops.subtitle)
    : DEFAULT_TEXT.homepage.upcomingWorkshops.subtitle;

  const eventParticipantCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};

    if (!customersData) {
      return counts;
    }

    customersData.forEach((customer) => {
      const eventId =
        typeof customer.event === "object"
          ? customer.event?._id
          : (customer.event as unknown as string);

      if (eventId) {
        counts[eventId] = (counts[eventId] || 0) + customer.quantity;
      }
    });

    return counts;
  }, [customersData]);

  const upcomingEvents = useMemo<ApiEvent[]>(() => {
    const events = eventsData || [];
    const today = dayjs().tz("America/New_York").startOf("day");

    return events
      .filter((event) => {
        const startDate = dayjs(event.dates.startDate).tz("America/New_York").startOf("day");
        return !startDate.isBefore(today);
      })
      .sort(
        (firstEvent, secondEvent) =>
          new Date(firstEvent.dates.startDate).getTime() -
          new Date(secondEvent.dates.startDate).getTime()
      );
  }, [eventsData]);

  const weekSlots = useMemo<DaySlot[]>(() => {
    const today = dayjs().tz("America/New_York").startOf("day");
    const slots: DaySlot[] = [];

    for (let i = 0; i < 7; i++) {
      const date = today.add(i, "day");
      const dateKey = date.format("YYYY-MM-DD");
      const dayEvents = upcomingEvents.filter((event) => {
        const eventStart = dayjs(event.dates.startDate).tz("America/New_York").startOf("day");
        return eventStart.format("YYYY-MM-DD") === dateKey;
      });

      slots.push({
        date,
        dateKey,
        weekday: date.format("ddd"),
        dayNum: date.format("D"),
        month: date.format("MMM"),
        events: dayEvents,
      });
    }

    return slots;
  }, [upcomingEvents]);

  const handleEventClick = (event: ApiEvent): void => {
    if (event.eventType === "artist") {
      router.push(`/events/live-artist/${event._id}`);
      return;
    }
    const params = new URLSearchParams();
    params.set("eventId", event._id);
    params.set("eventTitle", event.eventName);
    if (event.isFree || event.price === 0) {
      params.set("price", "0");
      params.set("isFree", "true");
    } else if (event.price !== undefined) {
      params.set("price", String(event.price));
    }
    router.push(`/payments?${params.toString()}`);
  };

  return (
    <section id="upcoming-workshops" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/65 bg-white/82 p-6 shadow-[0_14px_26px_rgba(12,74,110,0.08)] backdrop-blur-[2px] md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            {content?.homepage?.upcomingWorkshops?.label ||
              DEFAULT_TEXT.homepage.upcomingWorkshops.label}
          </p>
          <h2
            className={`${ebGaramond.className} mb-4 text-4xl font-bold text-primary md:text-5xl`}
          >
            {content?.homepage?.upcomingWorkshops?.title ||
              DEFAULT_TEXT.homepage.upcomingWorkshops.title}
          </h2>
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-slate-700">{subtitle}</p>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid rgba(50,108,133,0.15)",
                  borderTopColor: "#326C85",
                  borderRadius: "50%",
                }}
              />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-lg font-semibold text-red-600">
              Error loading workshops. Please check the full calendar.
            </p>
          ) : (
            <>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekSlots.map((slot, slotIndex) => {
                const isToday = slotIndex === 0;
                return (
                  <div
                    key={slot.dateKey}
                    className={`py-3 text-center ${isToday ? "border-b-2 border-[#326C85]" : ""}`}
                  >
                    <span className={`text-sm font-semibold ${isToday ? "text-[#326C85]" : "text-slate-500"}`}>
                      {slot.weekday}
                    </span>
                    <span className={`ml-1.5 text-sm ${isToday ? "font-bold text-[#326C85]" : "text-slate-400"}`}>
                      {slot.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Day columns with events */}
            <div className="grid grid-cols-7 min-h-[260px]">
              {weekSlots.map((slot, slotIndex) => (
                <div
                  key={slot.dateKey}
                  className={`flex flex-col gap-2.5 p-2 pt-3 ${slotIndex < 6 ? "border-r border-slate-100" : ""}`}
                >
                  {slot.events.length > 0 ? (
                    slot.events.map((event) => {
                      const currentParticipants = eventParticipantCounts[event._id] || 0;
                      const capacity = event.numberOfParticipants || 20;
                      const isSoldOut =
                        event.eventType !== "artist" && currentParticipants >= capacity;
                      const colors = getEventColors(event.eventType);
                      const priceLabel = event.isFree || event.price === 0 ? "Free" : event.price ? `$${event.price}` : null;

                      return (
                        <button
                          key={event._id}
                          type="button"
                          onClick={() => handleEventClick(event)}
                          disabled={isSoldOut}
                          className={`group relative flex flex-1 flex-col rounded-xl p-3 text-left text-white transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${colors.bg} ${colors.hover}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                            {formatEventType(event.eventType)}
                          </span>
                          <span className={`${ebGaramond.className} mt-1 text-base font-bold leading-tight`}>
                            {event.eventName}
                          </span>
                          {event.description && (
                            <div className="mt-2 flex-1 overflow-y-auto text-xs font-medium leading-relaxed text-white/90 scrollbar-thin" style={{ maxHeight: "140px" }}>
                              {event.description}
                            </div>
                          )}
                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-white/80">
                              {formatEventTime(event.time.startTime)}
                            </span>
                            {priceLabel && (
                              <span className="text-xs font-bold">
                                {priceLabel}
                              </span>
                            )}
                          </div>
                          <span className={`mt-2 self-stretch rounded-lg py-1.5 text-center text-[11px] font-bold uppercase tracking-wide transition-colors ${
                            isSoldOut
                              ? "bg-white/20 text-white/60"
                              : "bg-white/25 text-white group-hover:bg-white/35"
                          }`}>
                            {isSoldOut ? "Sold Out" : "Sign Up"}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <span className="text-xs text-slate-300">--</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </>
          )}

          <div className="mt-10 flex justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => router.push("/calendar")}
            >
              View Full Calendar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calendar;
