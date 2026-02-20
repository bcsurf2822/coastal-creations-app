import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

const EventDetailSkeleton = (): ReactElement => {
  return (
    <div className="mx-auto max-w-[800px] p-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Skeleton variant="rectangular" height={350} className="w-full" />
        <div className="flex flex-col gap-4 p-8">
          <Skeleton variant="text" height={32} className="w-3/4" />
          <div className="flex flex-wrap gap-3">
            <Skeleton variant="rounded" height={32} width={200} />
            <Skeleton variant="rounded" height={32} width={160} />
          </div>
          <Skeleton variant="text" height={14} className="w-full" />
          <Skeleton variant="text" height={14} className="w-full" />
          <Skeleton variant="text" height={14} className="w-full" />
          <Skeleton variant="text" height={14} className="w-2/3" />
          <div className="mt-4">
            <Skeleton variant="rounded" height={48} width={200} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailSkeleton;
