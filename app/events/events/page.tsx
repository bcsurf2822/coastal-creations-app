"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function EventsPage() {
  return (
    <EventsContainer
      config={{
        title: "Events",
        titleIcons: {
          left: <FaPalette />,
          right: <GiPaintBrush />,
        },
        subtitle: "Join us for special art events and workshops.\nExperience creativity in action!",
        sectionTitle: "Upcoming Events",
        eventTypeFilter: (eventType) => {
          // Show both "event" and "artist" event types
          return eventType === "event" || eventType === "artist";
        },
        layout: "list",
        cardConfig: {
          layout: "horizontal",
          showPrice: true,
          showSignupButton: true,
          showParticipantCount: true,
          showOptions: true,
          showImage: true,
          buttonText: "Register for Event",
        },
        emptyStateMessage: "No events currently scheduled.",
        emptyStateSubmessage: "Check back soon for upcoming special events!",
        emptyStateIcon: <FaUsers style={{ color: "black" }} />,
        loadingMessage: "Loading events...",
        fetchParticipantCounts: true,
        useEventPictures: true,
        baseUrl: "/events/events",
      }}
    />
  );
}
