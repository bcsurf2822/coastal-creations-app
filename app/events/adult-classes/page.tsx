"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import PhotoCorral from "@/components/gallery/PhotoCorral";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function AdultClassesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <PageHeader
        title="Adult Workshops"
        subtitle="Whether you have more or less Art Experience, we guarantee that you can create something beautiful! Let's Create Together"
        variant="adult"
        leftIcon={<FaPalette />}
        rightIcon={<GiPaintBrush />}
      />

      <PhotoCorral destination="adult-class" />

      <div className="py-8">
        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "",
            eventTypeFilter: (eventType) => {
              return eventType === "adult-class";
            },
            layout: "list",
            cardConfig: {
              layout: "horizontal",
              showPrice: true,
              showSignupButton: true,
              showParticipantCount: true,
              showOptions: true,
              showImage: true,
              buttonText: "Sign Up for Class",
            },
            emptyStateMessage: "No adult workshops currently scheduled.",
            emptyStateSubmessage: "Check back soon for new creative opportunities!",
            emptyStateIcon: <FaUsers style={{ color: "black" }} />,
            loadingMessage: "Loading adult workshops...",
            fetchParticipantCounts: true,
            useEventPictures: true,
            baseUrl: "/events/adult-classes",
          }}
        />
      </div>
    </div>
  );
}
