import { MetadataRoute } from "next";
import { connectMongo } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import Reservation from "@/lib/models/Reservations";

const BASE_URL = "https://coastalcreationsstudio.com";

// Map event types to their URL path segments
const EVENT_TYPE_PATHS: Record<string, string> = {
  "adult-class": "adult-classes",
  "kid-class": "kid-classes",
  camp: "camps",
  event: "events",
  artist: "live-artist",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/gallery`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/calendar`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/events/classes-workshops`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/events/adult-classes`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/kid-classes`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/camps`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/events`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/live-artist`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events/private-events`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/reservations`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/gift-cards`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Fetch dynamic event pages
  let eventPages: MetadataRoute.Sitemap = [];
  let reservationPages: MetadataRoute.Sitemap = [];

  try {
    await connectMongo();

    const events = await Event.find({}, { _id: 1, eventType: 1, updatedAt: 1 }).lean();
    eventPages = events
      .filter((event) => {
        const pathSegment = EVENT_TYPE_PATHS[event.eventType as string];
        return !!pathSegment;
      })
      .map((event) => {
        const pathSegment = EVENT_TYPE_PATHS[event.eventType as string];
        return {
          url: `${BASE_URL}/events/${pathSegment}/${event._id}`,
          lastModified: (event.updatedAt as Date) || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        };
      });

    const reservations = await Reservation.find({}, { _id: 1, updatedAt: 1 }).lean();
    reservationPages = reservations.map((reservation) => ({
      url: `${BASE_URL}/reservations/${reservation._id}`,
      lastModified: (reservation.updatedAt as Date) || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[SITEMAP] Error fetching dynamic pages:", error);
  }

  return [...staticPages, ...eventPages, ...reservationPages];
}
