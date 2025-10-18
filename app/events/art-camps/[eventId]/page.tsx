"use client";

import EventDetails from "@/components/calendar/eventDetails/EventDetails";

export default function ArtCampsEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): React.ReactElement {
  return <EventDetails params={params} />;
}
