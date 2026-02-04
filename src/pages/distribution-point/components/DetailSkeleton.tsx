import { Skeleton } from "../../../components/common";

export function DetailSkeleton() {
  return (
    <div className="py-8 animate-pulse">
      <div className="mb-6 h-8 w-24 bg-base-300 rounded"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />

          <div className="card rounded-2xl bg-base-100 shadow-xl p-4 space-y-4 border border-base-200">
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-3/4 rounded" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-6 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
              <Skeleton className="h-3 w-4/6 rounded" />
            </div>
          </div>

          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-48 rounded" />
              <Skeleton className="h-6 w-24 rounded-2xl" />
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card rounded-2xl bg-base-100 shadow-sm p-4 border border-base-200 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>

                <Skeleton className="h-4 w-full rounded-full" />

                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
