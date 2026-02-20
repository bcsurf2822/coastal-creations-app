import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui";

const GallerySkeleton = (): ReactElement => {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            className="aspect-square w-full"
          />
        ))}
      </div>
    </div>
  );
};

export default GallerySkeleton;
