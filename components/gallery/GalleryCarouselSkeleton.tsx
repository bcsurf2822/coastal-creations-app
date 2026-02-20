import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

interface GalleryCarouselSkeletonProps {
  height?: string;
}

const GalleryCarouselSkeleton = ({
  height = "h-96",
}: GalleryCarouselSkeletonProps): ReactElement => {
  return (
    <Skeleton variant="rounded" className={`w-full ${height}`} />
  );
};

export default GalleryCarouselSkeleton;
