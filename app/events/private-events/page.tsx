"use client";

import PrivateEvents from "@/components/classes/privateEvents/PrivateEvents";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";

export default function PrivateEventsPage() {
  return (
    <>
      <div className="mb-12 px-4 pt-16">
        <GalleryCarousel destination="private-event" height="h-64" />
      </div>
      <PrivateEvents />
    </>
  );
}
