import { IQueryRequest } from "../default";
import { ICreateProduct, IProduct } from "../products";

export enum RequestedProductStatus {
  OPEN = "OPEN",
  FULL = "FULL",
  DELIVERED = "DELIVERED",
  REMOVED = "REMOVED",
}

export interface IRequestedProduct {
  id: string;
  distributionPointId: string;
  productId: string;
  requestedQuantity: number;
  donatedQuantity: number;
  deliveredQuantity: number;
  status: RequestedProductStatus;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: IProduct;
}

export interface ICreateProductRequestedProduct extends Omit<ICreateProduct, "active"> {
  requestedQuantity: number;
}

export interface ICreateRequestedProduct {
  distributionPointId: string;
  requestedProducts: ICreateProductRequestedProduct[];
}

export interface IUpdateRequestedProduct {
  requestedQuantity?: number;
  productName?: string;
  status?: RequestedProductStatus;
  closesAt?: string | null;
}

export interface IQueryRequestedProducts extends IQueryRequest {
  distributionPointId?: string;
  productId?: string;
  status?: RequestedProductStatus;
  activeOnly?: boolean;
}

export interface IListRequestedProducts {
  items: IRequestedProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
