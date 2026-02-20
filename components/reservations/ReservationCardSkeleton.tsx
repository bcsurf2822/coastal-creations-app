import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

const ReservationCardSkeleton = (): ReactElement => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="flex flex-1 flex-col gap-3 p-8">
        <Skeleton variant="text" height={24} className="w-3/4" />
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-1/2" />
        <div className="mt-2 flex flex-col gap-3">
          <Skeleton variant="rounded" height={32} width={180} />
          <Skeleton variant="rounded" height={32} width={220} />
        </div>
        <Skeleton variant="rounded" height={42} width={160} className="mt-3" />
      </div>
    </div>
  );
};

export default ReservationCardSkeleton;
