"use client";

import { ReactElement } from "react";
import PageHeader from "@/components/classes/PageHeader";
import ReservationList from "@/components/reservations/ReservationList";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import { FaPaintBrush } from "react-icons/fa";
import { GiPaintBucket } from "react-icons/gi";

export default function ReservationsPage(): ReactElement {
  const { content } = usePageContent();

  const title = content?.otherPages?.reservations?.title
    || DEFAULT_TEXT.otherPages.reservations.title;

  const description = content?.otherPages?.reservations?.description
    ? portableTextToPlainText(content.otherPages.reservations.description)
    : DEFAULT_TEXT.otherPages.reservations.description;

  return (
    <div className="min-h-screen">
      <PageHeader
        title={title}
        subtitle={description}
        leftIcon={<FaPaintBrush />}
        rightIcon={<GiPaintBucket />}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 px-4">
          <GalleryCarousel destination="reservation" height="h-64" />
        </div>

        <ReservationList baseUrl="/reservations" />
      </div>
    </div>
  );
}
