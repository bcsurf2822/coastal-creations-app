"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaPalette, FaUsers, FaEye } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function LiveArtistPage() {
  return (
    <>
      <div className="mb-12">
        <GalleryCarousel destination="artist" title="Live Artist Gallery" height="h-96" />
      </div>
      <EventsContainer
        config={{
          title: "Live Artist Painting",
          titleIcons: {
            left: <FaPalette />,
            right: <GiPaintBrush />,
          },
          subtitle: "Watch talented artists create beautiful works live! Observe the creative process, learn new techniques, and be inspired by artistic mastery in action.",
          sectionTitle: "Live Artist Events",
          eventTypeFilter: (eventType) => eventType.toLowerCase() === "artist",
          eventSort: (a, b) => {
            const dateA = new Date(a.dates.startDate);
            const dateB = new Date(b.dates.startDate);
            const now = new Date();

            const aIsUpcoming = dateA >= now;
            const bIsUpcoming = dateB >= now;

            if (aIsUpcoming && !bIsUpcoming) return -1;
            if (!aIsUpcoming && bIsUpcoming) return 1;

            if (aIsUpcoming && bIsUpcoming) {
              return dateA.getTime() - dateB.getTime();
            }

            return dateB.getTime() - dateA.getTime();
          },
          layout: "list",
          cardConfig: {
            layout: "horizontal",
            showPrice: false,
            showSignupButton: false,
            showParticipantCount: false,
            showOptions: true,
            showImage: true,
            badge: {
              text: "Live Demo",
              icon: FaEye,
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            },
          },
          emptyStateMessage: "No live artist events currently scheduled.",
          emptyStateSubmessage: "Check back soon for upcoming artist demonstrations!",
          emptyStateIcon: <FaUsers style={{ color: "#42A5F5" }} />,
          loadingMessage: "Loading live artist events...",
          fetchParticipantCounts: false,
          useEventPictures: true,
        }}
      />
    </>
  );
}
