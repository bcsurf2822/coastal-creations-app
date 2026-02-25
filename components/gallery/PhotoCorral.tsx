"use client";

import { useRef, useEffect, useState, useCallback, useMemo, ReactElement } from "react";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import type { GalleryDestination } from "@/types/interfaces";

interface PhotoCorralImage {
  id: string;
  src: string;
  alt: string;
  description?: string;
}

const GAP = 16;
const AUTO_SCROLL_SPEED = 0.5;
const FRICTION = 0.95;
const MIN_VELOCITY = 0.5;

// Approximate card width at largest breakpoint (280px + gap)
const CARD_SLOT_WIDTH = 280 + GAP;

// Minimum number of unique photos required before we enable scrolling.
// Below this, the corral shows a static centered row.
const MIN_PHOTOS_FOR_SCROLL = 5;

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource): string | null => {
  if (!projectId || !dataset) return null;
  return imageUrlBuilder({ projectId, dataset })
    .image(source)
    .width(600)
    .quality(85)
    .url();
};

interface GalleryApiImage {
  _id: string;
  title: string;
  description?: string;
  image: SanityImageSource;
}

interface PhotoCorralProps {
  destination: GalleryDestination;
}

const PhotoCard = ({ image }: { image: PhotoCorralImage }): ReactElement => (
  <div
    className="group relative h-[150px] w-[200px] shrink-0 overflow-hidden rounded-xl border border-white/30 transition-all duration-300 hover:border-white/60 hover:shadow-lg md:h-[170px] md:w-[240px] lg:h-[200px] lg:w-[280px]"
    style={{ boxShadow: "var(--shadow-card)" }}
  >
    <img
      src={image.src}
      alt={image.alt}
      className="h-full w-full object-cover"
      draggable={false}
    />

    {image.description && (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-6">
          <p className="text-xs leading-snug text-white/90 md:text-sm">
            {image.description}
          </p>
        </div>
      </div>
    )}
  </div>
);

// ── Static Corral (few photos, centered, no animation) ──────────────────

const StaticCorral = ({ photos }: { photos: PhotoCorralImage[] }): ReactElement => (
  <div
    className="relative mx-4 overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white/40 py-5 shadow-sm backdrop-blur-sm md:mx-8 lg:mx-12"
    role="region"
    aria-label="Photo gallery"
  >
    <div className="flex items-center justify-center" style={{ gap: GAP }}>
      {photos.map((image) => (
        <PhotoCard key={image.id} image={image} />
      ))}
    </div>
  </div>
);

// ── Scrolling Corral (enough photos for infinite loop) ──────────────────

const ScrollingCorral = ({ photos }: { photos: PhotoCorralImage[] }): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const scrollPos = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const lastTime = useRef(0);
  const singleSetWidth = useRef(0);
  const rafId = useRef(0);
  const prefersReducedMotion = useRef(false);

  const [containerWidth, setContainerWidth] = useState(0);

  // Repeat photos so one "set" always fills the container width
  const filledPhotos = useMemo(() => {
    const width = containerWidth || 2400;
    const slotsNeeded = Math.ceil(width / CARD_SLOT_WIDTH) + 2;
    const repeats = Math.max(1, Math.ceil(slotsNeeded / photos.length));
    if (repeats <= 1) return photos;
    const extended: PhotoCorralImage[] = [];
    for (let r = 0; r < repeats; r++) {
      photos.forEach((p, i) => {
        extended.push({ ...p, id: `${p.id}-r${r}-${i}` });
      });
    }
    return extended;
  }, [photos, containerWidth]);

  const measureSetWidth = useCallback((): void => {
    if (firstSetRef.current) {
      singleSetWidth.current = firstSetRef.current.scrollWidth + GAP;
    }
  }, []);

  // Observe container + first set
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    measureSetWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setContainerWidth(entry.contentRect.width);
        }
        if (entry.target === firstSetRef.current) {
          measureSetWidth();
        }
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (firstSetRef.current) observer.observe(firstSetRef.current);

    return () => observer.disconnect();
  }, [measureSetWidth]);

  // Re-measure when filledPhotos change
  useEffect(() => {
    measureSetWidth();
  }, [filledPhotos, measureSetWidth]);

  // Animation loop
  useEffect(() => {
    const animate = (): void => {
      if (!trackRef.current || singleSetWidth.current === 0) {
        rafId.current = requestAnimationFrame(animate);
        return;
      }

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > MIN_VELOCITY) {
          scrollPos.current += velocity.current;
          velocity.current *= FRICTION;
        } else {
          velocity.current = 0;
          if (!prefersReducedMotion.current) {
            scrollPos.current -= AUTO_SCROLL_SPEED;
          }
        }
      }

      const w = singleSetWidth.current;
      if (scrollPos.current <= -w) {
        scrollPos.current += w;
      } else if (scrollPos.current > 0) {
        scrollPos.current -= w;
      }

      trackRef.current.style.transform = `translate3d(${scrollPos.current}px, 0, 0)`;
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent): void => {
    isDragging.current = true;
    velocity.current = 0;
    lastPointerX.current = e.clientX;
    lastTime.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent): void => {
    if (!isDragging.current) return;

    const now = performance.now();
    const deltaX = e.clientX - lastPointerX.current;
    const deltaTime = now - lastTime.current;

    scrollPos.current += deltaX;

    if (deltaTime > 0) {
      velocity.current = (deltaX / deltaTime) * 16;
    }

    lastPointerX.current = e.clientX;
    lastTime.current = now;
  }, []);

  const handlePointerUp = useCallback((): void => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-4 overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white/40 px-0 py-5 shadow-sm backdrop-blur-sm md:mx-8 lg:mx-12"
      role="region"
      aria-label="Photo gallery"
    >
      {/* Left fade mask */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white/90 to-transparent md:w-20" />
      {/* Right fade mask */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white/90 to-transparent md:w-20" />

      <div
        ref={trackRef}
        className="flex cursor-grab select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ willChange: "transform" }}
      >
        {/* Set A */}
        <div ref={firstSetRef} className="flex shrink-0" style={{ gap: GAP }}>
          {filledPhotos.map((image, i) => (
            <PhotoCard key={`a-${image.id}-${i}`} image={image} />
          ))}
        </div>
        <div style={{ width: GAP, flexShrink: 0 }} />
        {/* Set B (duplicate for seamless loop) */}
        <div className="flex shrink-0" style={{ gap: GAP }}>
          {filledPhotos.map((image, i) => (
            <PhotoCard key={`b-${image.id}-${i}`} image={image} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main PhotoCorral (decides static vs scrolling) ──────────────────────

const PhotoCorral = ({ destination }: PhotoCorralProps): ReactElement | null => {
  const [photos, setPhotos] = useState<PhotoCorralImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/gallery?destination=${destination}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const mapped: PhotoCorralImage[] = result.data
            .map((img: GalleryApiImage) => {
              const url = urlFor(img.image);
              if (!url) return null;
              return {
                id: img._id,
                src: url,
                alt: img.title,
                description: img.description,
              };
            })
            .filter(Boolean) as PhotoCorralImage[];
          setPhotos(mapped);
        }
      } catch (error) {
        console.error(
          `[PhotoCorral-fetchImages] Error fetching images for ${destination}:`,
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [destination]);

  if (loading || photos.length === 0) {
    return null;
  }

  if (photos.length < MIN_PHOTOS_FOR_SCROLL) {
    return <StaticCorral photos={photos} />;
  }

  return <ScrollingCorral photos={photos} />;
};

export default PhotoCorral;
