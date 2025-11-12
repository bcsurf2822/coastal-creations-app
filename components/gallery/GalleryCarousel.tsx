"use client";

import { useRef, useState, useCallback, useEffect, type ReactElement } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import type { GalleryDestination } from "@/types/interfaces";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

interface GalleryCarouselProps {
  destination: GalleryDestination;
  title?: string;
  showArrows?: boolean;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: string;
}

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  image: SanityImageSource;
}

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function GalleryCarousel({
  destination,
  title,
  showArrows = true,
  showIndicators = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  height = "h-96",
}: GalleryCarouselProps): ReactElement | null {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const touchStartRef = useRef(0);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images by destination
  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/gallery?destination=${destination}`);
        const result = await response.json();

        if (result.success && result.data) {
          setImages(result.data);
        }
      } catch (error) {
        console.error(`[GalleryCarousel] Error fetching images for ${destination}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [destination]);

  // Handle keyboard scrolling
  const scroll = useCallback(
    (direction: "left" | "right"): void => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / images.length;

      // Determine how many items to scroll based on viewport
      const viewportWidth = container.clientWidth;
      let itemsToScroll = 1;
      if (viewportWidth >= 1024) {
        itemsToScroll = 3; // Desktop: scroll 3 items
      } else if (viewportWidth >= 768) {
        itemsToScroll = 2; // Tablet: scroll 2 items
      }

      const scrollAmount = itemWidth * itemsToScroll;

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        setCurrentIndex((prev) => Math.max(0, prev - itemsToScroll));
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        setCurrentIndex((prev) => Math.min(images.length - 1, prev + itemsToScroll));
      }
    },
    [images.length]
  );

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent): void => {
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!isDragging) return;
    setDragStart(e.touches[0].clientX);
  };

  // Handle touch end
  const handleTouchEnd = (): void => {
    if (!isDragging) return;
    setIsDragging(false);

    const touchEnd = dragStart;
    const touchStart = touchStartRef.current;
    const swipeThreshold = 50;

    if (touchStart - touchEnd > swipeThreshold) {
      scroll("right");
    } else if (touchEnd - touchStart > swipeThreshold) {
      scroll("left");
    }
  };

  // Handle scroll to update indicator
  const handleScroll = (): void => {
    if (!scrollContainerRef.current || images.length === 0) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / images.length;
    const index = Math.round(container.scrollLeft / itemWidth);
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length === 0) return;

    const timer = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const itemWidth = container.scrollWidth / images.length;

        // Determine how many items are visible
        const viewportWidth = container.clientWidth;
        let itemsVisible = 1;
        if (viewportWidth >= 1024) {
          itemsVisible = 3;
        } else if (viewportWidth >= 768) {
          itemsVisible = 2;
        }

        setCurrentIndex((prev) => {
          const nextIndex = prev + itemsVisible >= images.length ? 0 : prev + itemsVisible;
          container.scrollTo({
            left: nextIndex * itemWidth,
            behavior: "smooth",
          });
          return nextIndex;
        });
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToSlide = (index: number): void => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / images.length;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  // Don't render if no images or still loading
  if (loading) {
    return (
      <div className="w-full">
        {title && (
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        <div className={`relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${height} animate-pulse`} />
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      )}

      <div className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-lg">
        {/* Main carousel container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide gap-4 p-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {images.map((image, index) => {
            const imageUrl = urlFor(image.image)?.width(800).quality(90).url();

            return (
              <div key={image._id} className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] flex-shrink-0 snap-start">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
                  {imageUrl ? (
                    <div className={`relative w-full ${height} flex items-center justify-center bg-white dark:bg-gray-800`}>
                      <Image
                        src={imageUrl}
                        alt={image.title}
                        width={800}
                        height={600}
                        className="w-full h-full object-contain p-4"
                        priority={index === 0}
                      />
                    </div>
                  ) : (
                    <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  )}

                  {/* Image title and description below image */}
                  {(image.title || image.description) && (
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                      {image.title && (
                        <h3 className="text-gray-900 dark:text-white text-base font-semibold mb-1">
                          {image.title}
                        </h3>
                      )}
                      {image.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {image.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Left arrow button */}
        {showArrows && images.length > 1 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 transition-colors rounded-full p-2 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
            disabled={currentIndex === 0}
          >
            <RiArrowLeftSLine className="w-6 h-6" />
          </button>
        )}

        {/* Right arrow button */}
        {showArrows && images.length > 1 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 transition-colors rounded-full p-2 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <RiArrowRightSLine className="w-6 h-6" />
          </button>
        )}

        {/* Indicator dots */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8 h-2"
                    : "bg-white/50 w-2 h-2 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
