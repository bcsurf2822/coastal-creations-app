"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import PageHeader from "@/components/classes/PageHeader";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function AllEventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <PageHeader
        title="All Events"
        subtitle="Browse all our classes, workshops, events, and camps. Find your perfect creative experience!"
        variant="all"
        leftIcon={<FaPalette />}
        rightIcon={<GiPaintBrush />}
      />

      <div className="py-8">
        <EventsContainer
          config={{
            title: "",
            sectionTitle: "All Upcoming Events",
            eventTypeFilter: () => {
              return true;
            },
            layout: "list",
            cardConfig: {
              layout: "horizontal",
              showPrice: true,
              showSignupButton: true,
              showParticipantCount: true,
              showOptions: true,
              showImage: true,
              buttonText: "Register",
            },
            emptyStateMessage: "No events currently scheduled.",
            emptyStateSubmessage: "Check back soon for new creative opportunities!",
            emptyStateIcon: <FaUsers style={{ color: "black" }} />,
            loadingMessage: "Loading all events...",
            fetchParticipantCounts: true,
            useEventPictures: true,
            baseUrl: "/events/classes-workshops",
          }}
        />
      </div>
    </div>
  );
}
