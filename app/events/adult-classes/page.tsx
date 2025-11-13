"use client";

import EventsContainer from "@/components/classes/EventsContainer";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaPalette, FaUsers } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";
import { usePageContent } from "@/hooks/usePageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

export default function AdultClassesPage() {
  const { content } = usePageContent();

  // Convert PortableText to plain text
  const description = content?.eventPages?.adultClasses?.description
    ? portableTextToPlainText(content.eventPages.adultClasses.description)
    : DEFAULT_TEXT.eventPages.adultClasses.description;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl text-[#326C85]">
              <FaPalette />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#326C85]">
              {content?.eventPages?.adultClasses?.title || DEFAULT_TEXT.eventPages.adultClasses.title}
            </h1>
            <div className="text-4xl text-[#326C85]">
              <GiPaintBrush />
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-semibold">
            {description}
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="mb-12">
          <GalleryCarousel destination="adult-class" height="h-64" />
        </div>
      </div>

      {/* Events List */}
      <EventsContainer
        config={{
          title: "",
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
    </div>
  );
}
