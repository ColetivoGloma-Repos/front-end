import React from "react";

interface ITableSkeletonProps {
  rowCount?: number;
  desktopHeader: React.ReactNode;
  desktopRowRender: (key: number) => React.ReactNode;
  mobileItemRender: (key: number) => React.ReactNode;
}

export function TableSkeleton({
  rowCount = 3,
  desktopHeader,
  desktopRowRender,
  mobileItemRender,
}: ITableSkeletonProps) {
  const rows = Array.from({ length: rowCount }, (_, i) => i + 1);

  return (
    <div className="animate-pulse">
      <div className="hidden md:block overflow-x-auto min-h-[400px]">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-base-content/70 uppercase">
              {desktopHeader}
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i} className="border-b border-base-200/50">
                {desktopRowRender(i)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col divide-y divide-base-200">
        {rows.map((i) => (
          <div key={i} className="p-4 flex flex-col gap-3">
            {mobileItemRender(i)}
          </div>
        ))}
      </div>
    </div>
  );
}
