import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton variant="text" height={32} width={200} />
          <div className="flex gap-2">
            <Skeleton variant="rounded" height={36} width={80} />
            <Skeleton variant="rounded" height={36} width={80} />
          </div>
        </div>
        <Skeleton variant="rounded" height={600} className="w-full" />
      </div>
    </div>
  );
}
