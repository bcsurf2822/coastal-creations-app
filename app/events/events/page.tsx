"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
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

      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Gallery Carousel */}
          <div className="mb-12">
            <GalleryCarousel destination="event" height="h-64" />
          </div>
        </div>

        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "Upcoming Events",
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
