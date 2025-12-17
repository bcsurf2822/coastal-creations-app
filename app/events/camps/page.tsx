"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaCampground, FaSun, FaMountain } from "react-icons/fa";

export default function SummerCampsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <PageHeader
        title="Art Camps"
        subtitle="Let's create through imagination & exploration! Learn new techniques, make new friends & bring your imagination to life."
        variant="camps"
        leftIcon={<FaCampground />}
        rightIcon={<FaSun />}
      />

      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Gallery Carousel */}
          <div className="mb-12">
            <GalleryCarousel destination="camp" height="h-64" />
          </div>
        </div>

        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "Upcoming Art Camps",
            eventTypeFilter: (eventType) => eventType === "camp",
            layout: "grid",
            gridColumns: {
              mobile: 1,
              tablet: 2,
              desktop: 3,
            },
            cardConfig: {
              layout: "vertical",
              showPrice: true,
              showSignupButton: true,
              showParticipantCount: true,
              showOptions: false,
              showImage: true,
              buttonText: "Register",
            },
            emptyStateMessage: "Check back soon for exciting art adventures!",
            emptyStateIcon: <FaMountain style={{ color: "#42A5F5" }} />,
            loadingMessage: "Loading art camps...",
            fetchParticipantCounts: true,
            useEventPictures: false,
            baseUrl: "/events/camps",
          }}
        />
      </div>
    </div>
  );
}
