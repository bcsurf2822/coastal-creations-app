import type { ReactElement } from "react";
import EventCardSkeleton from "./EventCardSkeleton";
import GalleryCarouselSkeleton from "@/components/gallery/GalleryCarouselSkeleton";

interface EventsPageSkeletonProps {
  layout?: "horizontal" | "vertical";
  count?: number;
  showCarousel?: boolean;
}

const EventsPageSkeleton = ({
  layout = "horizontal",
  count = 3,
  showCarousel = true,
}: EventsPageSkeletonProps): ReactElement => {
  return (
    <div className="min-h-screen">
      <div className="py-8">
        <div className="container mx-auto px-4">
          {showCarousel && (
            <div className="mb-12">
              <GalleryCarouselSkeleton height="h-64" />
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1200px] px-8 py-16">
          {layout === "horizontal" ? (
            <div className="flex flex-col gap-8">
              {Array.from({ length: count }).map((_, i) => (
                <EventCardSkeleton key={i} layout="horizontal" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: count }).map((_, i) => (
                <EventCardSkeleton key={i} layout="vertical" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPageSkeleton;
