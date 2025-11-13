"use client";

import React from "react";
import ImageGallery from "@/components/gallery/ImageGallery";
import { usePageContent } from "@/hooks/usePageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";

export default function GalleryPage() {
  const { content } = usePageContent();
  return (
    <div className="min-h-screen">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-12 text-center ">
              {content?.otherPages?.gallery?.title || DEFAULT_TEXT.otherPages.gallery.title}
            </h1>
            <ImageGallery />
          </div>
        </div>
      </section>
    </div>
  );
}
