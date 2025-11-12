"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { motion, AnimatePresence } from "motion/react";

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function ImageGallery() {
  const [images, setImages] = useState<SanityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SanityDocument | null>(
    null
  );

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch("/api/gallery");
        if (!response.ok) {
          throw new Error("Failed to fetch gallery images");
        }
        const result = await response.json();
        setImages(result.data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const getEnlargedImageUrl = (imageSource: SanityImageSource) => {
    return urlFor(imageSource)?.width(1200).quality(80).url() || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-lg font-bold">Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-red-500 font-bold">Error: {error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-lg font-bold">No images found in the gallery.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {images.map((item) => {
          const imageUrl = item.image
            ? urlFor(item.image)?.width(800).url()
            : null;

          if (!imageUrl) return null;

          return (
            <div
              key={item._id}
              onClick={() => setSelectedImage(item)}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square relative w-full bg-black/5 dark:bg-white/5">
                <Image
                  src={imageUrl}
                  alt={item.description || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {item.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-bold">{item.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modified Modal: Smaller size with semi-transparent background */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              layoutId={`image-${selectedImage._id}`}
              className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "70vw",
                maxHeight: "70vh",
              }}
            >
              <Image
                src={getEnlargedImageUrl(selectedImage.image) || ""}
                alt={selectedImage.description || "Enlarged gallery image"}
                width={1000}
                height={800}
                className="object-contain"
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "auto",
                  maxHeight: "60vh",
                }}
                unoptimized
              />
              {selectedImage.description && (
                <div className="p-3 bg-white text-black">
                  <p className="text-base font-bold">
                    {selectedImage.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
