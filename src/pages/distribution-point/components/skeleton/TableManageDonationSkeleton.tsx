import { Skeleton } from "../../../../components/common";
import { TableSkeleton } from "./TableSkeleton";

interface ITableManageDonationSkeletonProps {
  dashboardTab: string;
}

export function TableManageDonationSkeleton({
  dashboardTab,
}: ITableManageDonationSkeletonProps) {
  return (
    <TableSkeleton
      desktopHeader={
        <>
          <th>
            <Skeleton className="h-4 w-24" />
          </th>
          <th>
            <Skeleton className="h-4 w-32" />
          </th>
          <th>
            <Skeleton className="h-4 w-20" />
          </th>
          <th>
            <Skeleton className="h-4 w-24" />
          </th>
          <th className="text-center">
            <Skeleton className="h-4 w-16 mx-auto" />
          </th>
          {dashboardTab === "donations" && (
            <th className="text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </th>
          )}
        </>
      }
      desktopRowRender={(i) => (
        <>
          <td>
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>
          </td>
          <td>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-20" />
            </div>
          </td>
          <td>
            <Skeleton className="h-3 w-16" />
          </td>
          <td>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
          </td>
          <td>
            <Skeleton className="h-6 rounded-full w-20 mx-auto" />
          </td>
          {dashboardTab === "donations" && (
            <td className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </td>
          )}
        </>
      )}
      mobileItemRender={(i) => (
        <>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="bg-base-200/50 rounded-lg p-3 h-20"></div>
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-8 rounded-lg flex-1" />
            <Skeleton className="h-8 rounded-lg flex-1" />
          </div>
        </>
      )}
    />
  );
}
