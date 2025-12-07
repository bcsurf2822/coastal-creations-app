"use client";

import { ReactElement } from "react";
import ReservationList from "@/components/reservations/ReservationList";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { usePageContent } from "@/hooks/usePageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

export default function ReservationsPage(): ReactElement {
  const { content } = usePageContent();

  // Convert PortableText to plain text
  const description = content?.otherPages?.reservations?.description
    ? portableTextToPlainText(content.otherPages.reservations.description)
    : DEFAULT_TEXT.otherPages.reservations.description;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#326C85] mb-4">
            {content?.otherPages?.reservations?.title || DEFAULT_TEXT.otherPages.reservations.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
            {description}
          </p>
        </div>

        <div className="mb-12 px-4">
          <GalleryCarousel destination="reservation" height="h-64" />
        </div>

        <ReservationList baseUrl="/reservations" />
      </div>
    </div>
  );
}
