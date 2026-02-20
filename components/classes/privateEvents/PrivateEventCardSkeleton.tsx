import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

const PrivateEventCardSkeleton = (): ReactElement => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton variant="rectangular" height={280} className="w-full" />
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height={24} className="w-2/3" />
          <Skeleton variant="text" height={18} width={80} />
        </div>
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-3/4" />
        <div className="mt-2 space-y-3">
          <Skeleton variant="rounded" height={80} className="w-full" />
        </div>
        <Skeleton variant="rounded" height={44} className="mt-2 w-full" />
      </div>
    </div>
  );
};

export default PrivateEventCardSkeleton;
