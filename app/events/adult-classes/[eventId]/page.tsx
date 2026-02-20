import type { Metadata } from "next";
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import EventDetails from "@/components/calendar/eventDetails/EventDetails";
import { extractEventIdFromSlug } from "@/lib/utils/slugify";

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId: slug } = await params;
  const eventId = extractEventIdFromSlug(slug);

  try {
    await connectMongo();
    const event = await Event.findById(eventId, { eventName: 1 }).lean();
    if (event) {
      const name = event.eventName as string;
      return {
        title: name,
        description: `Sign up for ${name} at Coastal Creations Studio in Ocean City, NJ.`,
      };
    }
  } catch {
    // Fall through to default
  }

  return { title: "Adult Workshop" };
}

export default async function AdultClassEventPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { eventId: slug } = await params;
  const eventId = extractEventIdFromSlug(slug);

  return <EventDetails params={Promise.resolve({ eventId })} />;
}
