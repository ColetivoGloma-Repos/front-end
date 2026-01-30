import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { Button, Select } from "../../../components/common";
import { IQueryRequest } from "../../../interfaces/default";

interface ITablePaginationProps {
  onParams: (data: IQueryRequest) => void;
  params: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function TablePagination({ onParams, params }: ITablePaginationProps) {
  const limit = Number(params.limit ?? 10);
  const offset = Number(params.offset ?? 0);
  const totalItems = Number(params.total ?? 0);

  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, limit)));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Math.floor(offset / Math.max(1, limit)) + 1),
  );

  const handleParams = (partial: Partial<IQueryRequest>) => {
    const nextLimit = partial.limit !== undefined ? Number(partial.limit) : limit;
    const nextOffset = partial.offset !== undefined ? Number(partial.offset) : offset;

    const safeLimit = Math.max(1, nextLimit);
    const safeOffset = Math.max(0, nextOffset);

    onParams({
      limit: String(safeLimit),
      offset: String(safeOffset),
    } as IQueryRequest);
  };

  return (
    <div className="p-4 border-t border-base-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100">
      <div className="text-xs md:text-sm text-base-content/60 order-2 md:order-1">
        Mostrando <span className="font-medium text-base-content">{offset + 1}</span> -{" "}
        <span className="font-medium text-base-content">
          {Math.min(offset + limit, totalItems)}
        </span>{" "}
        de <span className="font-medium text-base-content">{totalItems}</span> resultados
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-4 order-1 md:order-2">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-base-content/60">Linhas por página:</span>
          <Select
            options={[
              { label: "1", value: "1" },
              { label: "5", value: "5" },
              { label: "10", value: "10" },
              { label: "20", value: "20" },
              { label: "50", value: "50" },
            ]}
            className="select-xs h-8 max-w-none !rounded-md"
            value={String(limit)}
            onChange={(e) =>
              onParams({
                limit: (e.target as HTMLSelectElement).value,
                offset: "0",
              } as IQueryRequest)
            }
          />
        </div>

        <div className="join w-full max-md:grid max-md:grid-cols-2 md:w-auto">
          <Button
            type="button"
            text={<IoChevronBack size={16} />}
            className="join-item btn-sm h-8 !rounded-tl-lg !rounded-bl-lg md:!rounded-tl-md md:!rounded-bl-md md:flex-none"
            disabled={currentPage === 1}
            onClick={() => handleParams({ offset: String(offset - limit) })}
          />

          <Button
            type="button"
            text={`Página ${currentPage} de ${totalPages}`}
            className="join-item btn btn-sm no-animation pointer-events-none h-8 hidden md:inline-flex"
          />

          <Button
            type="button"
            text={<IoChevronForward size={16} />}
            className="join-item btn-sm h-8 !rounded-tr-lg !rounded-br-lg md:!rounded-tr-md md:!rounded-br-md md:flex-none"
            disabled={currentPage === totalPages}
            onClick={() => handleParams({ offset: String(offset + limit) })}
          />
        </div>
      </div>
    </div>
  );
}
