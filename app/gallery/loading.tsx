import GallerySkeleton from "@/components/gallery/GallerySkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <GallerySkeleton />
      </div>
    </div>
  );
}
