"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaCampground, FaSun, FaMountain } from "react-icons/fa";
import { usePageContent } from "@/hooks/usePageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

export default function SummerCampsPage() {
  const { content } = usePageContent();

  // Convert PortableText to plain text
  const description = content?.eventPages?.camps?.description
    ? portableTextToPlainText(content.eventPages.camps.description)
    : DEFAULT_TEXT.eventPages.camps.description;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl text-[#326C85]">
              <FaCampground />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#326C85]">
              {content?.eventPages?.camps?.title || DEFAULT_TEXT.eventPages.camps.title}
            </h1>
            <div className="text-4xl text-[#326C85]">
              <FaSun />
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-semibold">
            {description}
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="mb-12">
          <GalleryCarousel destination="camp" height="h-64" />
        </div>
      </div>

      {/* Events List */}
      <EventsContainer
        config={{
          title: "",
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
    </div>
  );
}
