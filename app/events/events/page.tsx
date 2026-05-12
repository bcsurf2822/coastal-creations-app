"use client";

import EventCategoryNav from "@/components/classes/EventCategoryNav";
import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import PhotoCorral from "@/components/gallery/PhotoCorral";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <PageHeader
        title="Events"
        subtitle="Join us for Special Art Events and Workshops. Experience creativity in action!"
        variant="events"
        leftIcon={<FaPalette />}
        rightIcon={<GiPaintBrush />}
      />

      <EventCategoryNav />

      <PhotoCorral destination="event" />

      <div className="py-8">
        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "",
            eventTypeFilter: (eventType) => {
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
      </div>
    </div>
  );
}
