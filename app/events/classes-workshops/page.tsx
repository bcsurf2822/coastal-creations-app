"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function ClassesPage() {
  return (
    <EventsContainer
      config={{
        title: "Our Classes & Workshops",
        titleIcons: {
          left: <FaPalette />,
          right: <GiPaintBrush />,
        },
        subtitle: "No matter your skill level, we've got a class for you.\nLet's get creative — together!",
        sectionTitle: "Upcoming Classes & Workshops",
        eventTypeFilter: (eventType) => {
          const type = eventType.toLowerCase();
          return type.includes("class") || type.includes("workshop");
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
        emptyStateMessage: "No classes or workshops currently scheduled.",
        emptyStateSubmessage: "Check back soon for new creative opportunities!",
        emptyStateIcon: <FaUsers style={{ color: "black" }} />,
        loadingMessage: "Loading creative classes...",
        fetchParticipantCounts: true,
        useEventPictures: true,
      }}
    />
  );
}
