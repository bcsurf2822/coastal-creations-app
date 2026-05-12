"use client";

import EventCategoryNav from "@/components/classes/EventCategoryNav";
import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import PhotoCorral from "@/components/gallery/PhotoCorral";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function KidClassesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <PageHeader
        title="Kid Workshops"
        subtitle="We encourage kids to bring their own creativity to the table! Our workshops will always have guided activities, but full creative freedom is encouraged."
        variant="kid"
        leftIcon={<FaPalette />}
        rightIcon={<GiPaintBrush />}
      />

      <EventCategoryNav />

      <PhotoCorral destination="kid-class" />

      <div className="py-8">
        {/* Events List */}
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "",
            eventTypeFilter: (eventType) => {
              return eventType === "kid-class";
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
            emptyStateMessage: "No kid workshops currently scheduled.",
            emptyStateSubmessage: "Check back soon for new creative opportunities!",
            emptyStateIcon: <FaUsers style={{ color: "black" }} />,
            loadingMessage: "Loading kid workshops...",
            fetchParticipantCounts: true,
            useEventPictures: true,
            baseUrl: "/events/kid-classes",
          }}
        />
      </div>
    </div>
  );
}
