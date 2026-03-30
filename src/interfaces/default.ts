import { ITableProps } from "../components/common/Table/interface";

export interface ITable extends Omit<ITableProps, "columns"> {}

export interface IParamsDefault {
  limit?: number | string;
  offset?: number | string;
  sortBy?: string;
  sort?: string;
  search?: string;
  q?: string;
}

export interface IQueryRequest {
  limit?: string;
  offset?: string;
  sortBy?: string;
  sort?: "asc" | "desc";
  q?: string;
}
