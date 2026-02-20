"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import { useCustomers, useEvents, usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import type { ApiEvent } from "@/types/interfaces";
import { Button, Card, Skeleton } from "@/components/ui";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const formatEventDate = (dateString: string): string => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date TBA";
  }

  return parsedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        const startDate = new Date(event.dates.startDate);
        return !Number.isNaN(startDate.getTime()) && startDate >= today;
      })
      .sort(
        (firstEvent, secondEvent) =>
          new Date(firstEvent.dates.startDate).getTime() -
          new Date(secondEvent.dates.startDate).getTime()
      );
  }, [eventsData]);

  const previewEvents = upcomingEvents.slice(0, 4);
  const hasSingleEvent = previewEvents.length === 1;

  return (
    <section id="upcoming-workshops" className="bg-transparent py-16 md:py-24">
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
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_18px_rgba(12,74,110,0.1)]"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Skeleton variant="rounded" width={90} height={24} />
                    <Skeleton variant="text" width={80} height={16} />
                  </div>
                  <Skeleton variant="text" height={28} className="mb-2 w-3/4" />
                  <div className="mb-5 space-y-2">
                    <Skeleton variant="text" height={16} className="w-full" />
                    <Skeleton variant="text" height={16} className="w-full" />
                    <Skeleton variant="text" height={16} className="w-2/3" />
                  </div>
                  <div className="mb-5 flex items-center justify-between">
                    <Skeleton variant="text" width={70} height={14} />
                    <Skeleton variant="text" width={80} height={14} />
                  </div>
                  <Skeleton variant="rounded" height={40} className="mt-auto w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-10 text-center text-lg font-semibold text-red-600">
              Error loading workshops. Please check the full calendar.
            </p>
          ) : previewEvents.length === 0 ? (
            <Card
              variant="featured"
              className="rounded-2xl border border-sky-100 bg-white py-12 text-center shadow-[0_8px_20px_rgba(12,74,110,0.08)]"
            >
              <p className="mb-4 text-lg font-semibold text-slate-700">
                New workshops are on the way.
              </p>
              <p className="text-base text-slate-600">
                Check the full calendar for the latest updates and new openings.
              </p>
            </Card>
          ) : (
            <div
              className={`grid gap-5 ${
                hasSingleEvent ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
              }`}
            >
              {previewEvents.map((event) => {
                const currentParticipants = eventParticipantCounts[event._id] || 0;
                const capacity = event.numberOfParticipants || 20;
                const isSoldOut =
                  event.eventType !== "artist" && currentParticipants >= capacity;

                return (
                  <article
                    key={event._id}
                    className={`flex h-full flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_18px_rgba(12,74,110,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(12,74,110,0.14)] ${
                      hasSingleEvent ? "md:p-8" : ""
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        {formatEventType(event.eventType)}
                      </span>
                      <span className="text-sm font-semibold text-slate-600">
                        {formatEventDate(event.dates.startDate)}
                      </span>
                    </div>

                    <h3
                      className={`${ebGaramond.className} mb-2 text-2xl font-semibold leading-tight text-primary`}
                    >
                      {event.eventName}
                    </h3>

                    <div
                      className={`mb-5 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2.5 text-sm leading-relaxed text-slate-600 ${
                        hasSingleEvent
                          ? ""
                          : "max-h-[4.5rem] overflow-y-auto scrollbar-thin"
                      }`}
                    >
                      <p>{event.description}</p>
                    </div>

                    <div className="mb-5 flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>{formatEventTime(event.time.startTime)}</span>
                      {event.eventType === "artist" ? (
                        <span className="text-amber-700">Live Demo</span>
                      ) : (
                        <span>
                          {Math.max(capacity - currentParticipants, 0)} spots left
                        </span>
                      )}
                    </div>

                    <Button
                      variant={isSoldOut ? "secondary" : "primary"}
                      className="mt-auto w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      disabled={isSoldOut}
                      onClick={() => {
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
                      }}
                    >
                      {isSoldOut
                        ? "Sold Out"
                        : event.eventType === "artist"
                          ? "View Event"
                          : "Sign Up"}
                    </Button>
                  </article>
                );
              })}
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
