import { Skeleton } from "../../../../components/common";

export function ListDistributionPointSkeleton() {
  const cards = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="py-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="w-full md:w-1/2">
          <Skeleton className="h-10 w-3/4 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-12 w-full md:w-32 rounded-lg" />
          <Skeleton className="h-12 w-full md:w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((i) => (
          <div
            key={i}
            className="card rounded-2xl bg-base-100 shadow-xl overflow-hidden"
          >
            <Skeleton className="h-40 w-full" />
            <div className="card-body">
              <Skeleton className="h-6 w-3/4 mb-4 rounded" />
              <div className="space-y-2 mb-4">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-5/6 rounded" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>

              <div className="divider my-1"></div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
