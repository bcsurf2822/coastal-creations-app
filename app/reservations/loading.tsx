import ReservationCardSkeleton from "@/components/reservations/ReservationCardSkeleton";
import GalleryCarouselSkeleton from "@/components/gallery/GalleryCarouselSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 px-4">
          <GalleryCarouselSkeleton height="h-64" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReservationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
