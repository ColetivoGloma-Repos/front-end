import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "../../../../components/common";

export function TableManageRequestedProductsSkeleton() {
  return (
    <TableSkeleton
      desktopHeader={
        <>
          <th>
            <Skeleton className="h-4 w-32" />
          </th>
          <th>
            <Skeleton className="h-4 w-24" />
          </th>
          <th>
            <Skeleton className="h-4 w-24" />
          </th>
          <th>
            <Skeleton className="h-4 w-24" />
          </th>
          <th className="text-right">
            <Skeleton className="h-4 w-16 ml-auto" />
          </th>
        </>
      }
      desktopRowRender={(i) => (
        <>
          <td>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </td>
          <td>
            <div className="flex flex-col gap-1 w-full max-w-[150px]">
              <Skeleton className="h-2 rounded-full w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </td>
          <td>
            <Skeleton className="h-6 rounded-full w-24" />
          </td>
          <td>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
          </td>
          <td className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="w-20 h-9 rounded-lg" />
            </div>
          </td>
        </>
      )}
      mobileItemRender={(i) => (
        <>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 rounded-full w-20" />
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <Skeleton className="h-3 rounded-full w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-2 w-20" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-8 rounded-lg flex-1" />
            <Skeleton className="h-8 rounded-lg flex-1" />
          </div>
        </>
      )}
    />
  );
}
