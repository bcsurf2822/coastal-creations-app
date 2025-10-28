"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import { FaCampground, FaSun, FaMountain } from "react-icons/fa";

export default function SummerCampsPage() {
  return (
    <EventsContainer
      config={{
        title: "Art Camps",
        titleIcons: {
          left: <FaCampground />,
          right: <FaSun />,
        },
        subtitle: "Spend your time Creating at Coastal Creations!",
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
        loadingMessage: "Loading summer adventures...",
        fetchParticipantCounts: true,
        useEventPictures: false,
        baseUrl: "/events/camps",
      }}
    />
  );
}
