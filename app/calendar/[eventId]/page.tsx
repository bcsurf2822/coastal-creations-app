"use client";

import EventDetails from "@/components/eventDetails/EventDetails";



export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return <EventDetails params={params} />;
}
