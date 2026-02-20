import PrivateEventCardSkeleton from "@/components/classes/privateEvents/PrivateEventCardSkeleton";
import GalleryCarouselSkeleton from "@/components/gallery/GalleryCarouselSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="mb-12 px-4">
        <GalleryCarouselSkeleton height="h-64" />
      </div>
      <div className="mx-auto max-w-[1200px] px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PrivateEventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
