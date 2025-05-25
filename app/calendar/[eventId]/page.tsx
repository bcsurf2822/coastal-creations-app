"use client";

import EventDetails from "@/components/calendar/eventDetails/EventDetails";



export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return <EventDetails params={params} />;
}
