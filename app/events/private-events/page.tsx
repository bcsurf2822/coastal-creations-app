"use client";

import PageHeader from "@/components/classes/PageHeader";
import PrivateEvents from "@/components/classes/privateEvents/PrivateEvents";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { FaBirthdayCake } from "react-icons/fa";
import { GiBalloons } from "react-icons/gi";

export default function PrivateEventsPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Private Events"
        subtitle="Celebrate your special occasion with a private creative experience at our studio. Birthday parties, team building, bridal showers, and more."
        leftIcon={<FaBirthdayCake />}
        rightIcon={<GiBalloons />}
      />
      <div className="mb-12 px-4">
        <GalleryCarousel destination="private-event" height="h-64" />
      </div>
      <PrivateEvents />
    </div>
  );
}
