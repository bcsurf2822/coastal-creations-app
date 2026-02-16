"use client";

import React from "react";
import PageHeader from "@/components/classes/PageHeader";
import ImageGallery from "@/components/gallery/ImageGallery";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { FaCamera } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function GalleryPage() {
  const { content } = usePageContent();

  return (
    <div className="min-h-screen">
      <PageHeader
        title={content?.otherPages?.gallery?.title || DEFAULT_TEXT.otherPages.gallery.title}
        subtitle="Browse photos from our classes, workshops, and events. See the amazing creations our community has made."
        leftIcon={<FaCamera />}
        rightIcon={<GiPaintBrush />}
      />
      <div className="py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <ImageGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
