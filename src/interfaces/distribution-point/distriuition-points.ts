import { IQueryRequest } from "../default";
import { IAddress, ICreateAddress } from "../address";
import { ICreateProductRequestedProduct } from "./point-requested-product";
import { IShelter } from "../shelter";

export enum DistributionPointStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IDistributionPointFile {
  id: string;
  filename: string;
  url: string;
  ref: string;
  type: string;
  createdAt: string;
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
  files?: IDistributionPointFile[];
  isFullyStocked: boolean;
  requestedProducts: number;
  address: IAddress;
  shelterId?: string | null;
  shelter?: IShelter | null;
}

export interface ICreateDistributionPoint {
  title: string;
  description?: string | null;
  phone: string;
  address: ICreateAddress;
  requestedProducts: ICreateProductRequestedProduct[];
  shelterId?: string | null;
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
