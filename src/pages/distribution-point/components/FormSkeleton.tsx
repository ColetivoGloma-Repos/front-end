import { Skeleton } from "../../../components/common";

export function FormSkeleton() {
  return (
    <div className="py-8 animate-pulse">
      <div className="mb-6 h-8 w-24 bg-base-300 rounded"></div>

      <div className="card rounded-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <Skeleton className="h-8 w-1/3 rounded mb-6" />

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg space-y-4">
              <Skeleton className="h-6 w-48 rounded mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-8 w-full rounded-lg bg-base-100" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-8 w-full rounded-lg bg-base-100" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-8 w-full rounded-lg bg-base-100" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-8 w-full rounded-lg bg-base-100" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-8 w-full rounded-lg bg-base-100" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>

            <div className="space-y-3 bg-base-200 p-4 rounded-lg">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Skeleton className="h-9 flex-1 rounded bg-base-100" />
                  <Skeleton className="h-9 w-24 rounded bg-base-100" />
                  <Skeleton className="h-9 w-24 rounded bg-base-100" />
                  <Skeleton className="h-9 w-9 rounded-lg bg-base-100" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
