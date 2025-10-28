"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function AdultClassesPage() {
  return (
    <EventsContainer
      config={{
        title: "Adult Classes",
        titleIcons: {
          left: <FaPalette />,
          right: <GiPaintBrush />,
        },
        subtitle: "Unleash your creativity with our adult art classes.\nNo experience necessary — just bring your passion!",
        sectionTitle: "Upcoming Adult Classes",
        eventTypeFilter: (eventType) => {
          // Only show events explicitly marked as "adult-class"
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
        emptyStateMessage: "No adult classes currently scheduled.",
        emptyStateSubmessage: "Check back soon for new creative opportunities!",
        emptyStateIcon: <FaUsers style={{ color: "black" }} />,
        loadingMessage: "Loading adult classes...",
        fetchParticipantCounts: true,
        useEventPictures: true,
        baseUrl: "/events/adult-classes",
      }}
    />
  );
}
