"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function KidClassesPage() {
  return (
    <EventsContainer
      config={{
        title: "Kid Classes",
        titleIcons: {
          left: <FaPalette />,
          right: <GiPaintBrush />,
        },
        subtitle: "Creative art classes designed for young artists.\nFun, educational, and inspiring!",
        sectionTitle: "Upcoming Kid Classes",
        eventTypeFilter: (eventType) => {
          // Only show events explicitly marked as "kid-class"
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
        emptyStateMessage: "No kid classes currently scheduled.",
        emptyStateSubmessage: "Check back soon for new creative opportunities!",
        emptyStateIcon: <FaUsers style={{ color: "black" }} />,
        loadingMessage: "Loading kid classes...",
        fetchParticipantCounts: true,
        useEventPictures: true,
        baseUrl: "/events/kid-classes",
      }}
    />
  );
}
