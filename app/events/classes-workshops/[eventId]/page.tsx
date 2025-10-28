"use client";

import EventDetails from "@/components/calendar/eventDetails/EventDetails";
import { extractEventIdFromSlug } from "@/lib/utils/slugify";
import { use } from "react";

export default function ClassesWorkshopsEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): React.ReactElement {
  const unwrappedParams = use(params);
  const eventId = extractEventIdFromSlug(unwrappedParams.eventId);

  return <EventDetails params={Promise.resolve({ eventId })} />;
}
