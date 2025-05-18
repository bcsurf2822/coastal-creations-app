import React from "react";
import EventPictures from "@/components/classes/EventPictures";

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-12">
              Gallery
            </h1>

            <EventPictures />
          </div>
        </div>
      </section>
    </div>
  );
}
