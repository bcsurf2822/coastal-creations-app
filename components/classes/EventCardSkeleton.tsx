import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

interface EventCardSkeletonProps {
  layout?: "horizontal" | "vertical";
}

const EventCardSkeleton = ({
  layout = "horizontal",
}: EventCardSkeletonProps): ReactElement => {
  if (layout === "vertical") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Skeleton variant="rectangular" height={200} className="w-full" />
        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <Skeleton variant="text" height={24} className="w-3/4" />
            <Skeleton variant="text" height={20} width={50} />
          </div>
          <Skeleton variant="text" height={14} className="w-full" />
          <Skeleton variant="text" height={14} className="w-full" />
          <Skeleton variant="text" height={14} className="w-2/3" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Skeleton variant="rounded" height={28} width={140} />
            <Skeleton variant="rounded" height={28} width={120} />
          </div>
          <Skeleton variant="rounded" height={36} width={130} className="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton
        variant="rectangular"
        className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[180px]"
        height="auto"
      />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <Skeleton variant="text" height={24} className="w-3/4" />
          <Skeleton variant="text" height={20} width={50} />
        </div>
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-2/3" />
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton variant="rounded" height={28} width={160} />
            <Skeleton variant="rounded" height={28} width={120} />
          </div>
          <Skeleton variant="rounded" height={36} width={130} className="flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
