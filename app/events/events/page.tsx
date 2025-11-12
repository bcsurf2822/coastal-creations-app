"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function EventsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl text-[#326C85]">
              <FaPalette />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#326C85]">
              Events
            </h1>
            <div className="text-4xl text-[#326C85]">
              <GiPaintBrush />
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-semibold">
            Join us for special art events and workshops.
            <br />
            Experience creativity in action!
          </p>
        </div>

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
    </div>
  );
}
