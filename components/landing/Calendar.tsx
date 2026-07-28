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

  const featuredEvents = useMemo<ApiEvent[]>(
    () => upcomingEvents.slice(0, 6),
    [upcomingEvents]
  );

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

  const renderEventCard = (event: ApiEvent): ReactElement => {
    const currentParticipants = eventParticipantCounts[event._id] || 0;
    const capacity = event.numberOfParticipants || 20;
    const isSoldOut =
      event.eventType !== "artist" && currentParticipants >= capacity;
    const priceLabel =
      event.isFree || event.price === 0
        ? "Free"
        : event.price
          ? `$${event.price}`
          : null;
    const start = dayjs(event.dates.startDate).tz("America/New_York");

    return (
      <button
        key={event._id}
        type="button"
        onClick={() => handleEventClick(event)}
        disabled={isSoldOut}
        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_6px_18px_rgba(12,74,110,0.08)] transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-[var(--color-secondary)] hover:shadow-[0_14px_30px_rgba(12,74,110,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-secondary)]">
            {formatEventType(event.eventType)}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {start.format("ddd, MMM D")}
          </span>
        </div>
        <h3 className={`${ebGaramond.className} mt-3 text-xl font-bold leading-tight text-[var(--color-primary)]`}>
          {event.eventName}
        </h3>
        {event.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {event.description}
          </p>
        )}
        <div className="mt-auto">
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-semibold text-slate-700">
              {formatEventTime(event.time.startTime)}
            </span>
            {priceLabel && (
              <span className="text-base font-bold text-[var(--color-primary)]">
                {priceLabel}
              </span>
            )}
          </div>
          <span
            className={`mt-3 block w-full rounded-lg py-2.5 text-center text-sm font-bold uppercase tracking-wide transition-colors ${
              isSoldOut
                ? "bg-slate-200 text-slate-500"
                : "bg-[var(--color-primary)] text-white group-hover:bg-[var(--color-primary-dark)]"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Sign Up"}
          </span>
        </div>
      </button>
    );
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
          ) : featuredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <p className="text-lg font-semibold text-primary">
                No upcoming workshops scheduled right now.
              </p>
              <p className="text-sm text-slate-500">
                Check the full calendar for everything we have planned.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => renderEventCard(event))}
            </div>
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
