"use client";

import EventCategoryNav from "@/components/classes/EventCategoryNav";
import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import PhotoCorral from "@/components/gallery/PhotoCorral";
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

      <EventCategoryNav />

      <PhotoCorral destination="camp" />

      <div className="py-8">
        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "",
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
