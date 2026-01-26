import { IQueryRequest } from "../default";
import { IAddress, ICreateAddress } from "../address";
import { ICreateProductRequestedProduct } from "./point-requested-product";

export enum DistributionPointStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IDistributionPoint {
  id: string;
  title: string;
  description: string;
  phone: string;
  ownerId: string;
  status: DistributionPointStatus;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  isFullyStocked: boolean;
  requestedProducts: number;
  address: IAddress;
}

export interface ICreateDistributionPoint {
  title: string;
  description?: string | null;
  phone: string;
  address: ICreateAddress;
  requestedProducts: ICreateProductRequestedProduct[];
}

export type IUpdateDistributionPoint = Partial<
  Omit<ICreateDistributionPoint, "requestedProducts">
>;

export interface IQueryDistributionPoints extends IQueryRequest {
  ownerId?: string;
  active?: boolean;
  city?: string;
  state?: string;
}

export interface IListDistributionPoints {
  items: IDistributionPoint[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
