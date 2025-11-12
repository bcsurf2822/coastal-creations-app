"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { motion } from "motion/react";
import type { GalleryDestination } from "@/types/interfaces";

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 300;
const MARGIN = 20;
const IMAGE_SIZE = IMAGE_WIDTH + MARGIN;

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

interface GallerySlideshowProps {
  destination?: GalleryDestination;
  height?: number;
}

export default function GallerySlideshow({ destination, height = IMAGE_HEIGHT }: GallerySlideshowProps) {
  const [images, setImages] = useState<SanityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const url = destination
          ? `/api/gallery?destination=${destination}`
          : "/api/gallery";
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch gallery images");
        }
        const result = await response.json();
        setImages(result.data || []);
      } catch (err) {
        console.error("[GallerySlideshow-fetchGalleryImages] Error fetching gallery images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, [destination]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const IMAGE_BUFFER =
    containerWidth > BREAKPOINTS.lg ? 3 : containerWidth > BREAKPOINTS.sm ? 2 : 1;

  const CAN_SHIFT_LEFT = offset < 0;
  const CAN_SHIFT_RIGHT =
    Math.abs(offset) < IMAGE_SIZE * (images.length - IMAGE_BUFFER);

  const shiftLeft = () => {
    if (!CAN_SHIFT_LEFT) return;
    setOffset((pv) => pv + IMAGE_SIZE);
  };

  const shiftRight = () => {
    if (!CAN_SHIFT_RIGHT) return;
    setOffset((pv) => pv - IMAGE_SIZE);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-lg font-bold">Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-gray-50/50 rounded-lg p-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          animate={{ x: offset }}
          className="flex"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {images.map((image, index) => {
            const imageUrl = image.image ? urlFor(image.image)?.width(600).url() : null;
            
            if (!imageUrl) return null;

            return (
              <div
                key={image._id || index}
                className="relative shrink-0 cursor-pointer rounded-2xl bg-white shadow-md transition-all hover:scale-[1.015] hover:shadow-xl overflow-hidden"
                style={{
                  width: IMAGE_WIDTH,
                  height: height,
                  marginRight: MARGIN,
                }}
              >
                <Image
                  src={imageUrl}
                  alt="Gallery image"
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <motion.button
        initial={false}
        animate={{
          x: CAN_SHIFT_LEFT ? "0%" : "-100%",
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 rounded-r-xl bg-white/80 hover:bg-white p-3 pl-2 text-2xl text-gray-800 backdrop-blur-sm transition-all hover:pl-3"
        onClick={shiftLeft}
        aria-label="Previous images"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </motion.button>

      <motion.button
        initial={false}
        animate={{
          x: CAN_SHIFT_RIGHT ? "0%" : "100%",
        }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 rounded-l-xl bg-white/80 hover:bg-white p-3 pr-2 text-2xl text-gray-800 backdrop-blur-sm transition-all hover:pr-3"
        onClick={shiftRight}
        aria-label="Next images"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </motion.button>
    </div>
  );
}