"use client";

import EventDetails from "@/components/calendar/eventDetails/EventDetails";

export default function ClassesWorkshopsEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): React.ReactElement {
  return <EventDetails params={params} />;
}
