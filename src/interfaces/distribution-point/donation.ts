import { IAddress } from "../address";
import { IQueryRequest } from "./../default";

export enum DonationStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  DELIVERED = "DELIVERED",
}

export enum DonationCollectionType {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

export interface IUserSummary {
  name: string;
  email: string;
  phone?: string;
  address?: IAddress;
}

export interface IDonation {
  id: string;
  userId: string;
  requestedProductId: string;
  distributionPointId: string;
  quantity: number;
  status: DonationStatus;
  collectionType?: DonationCollectionType | null;
  createdAt: string;
  updatedAt: string;
  user: IUserSummary;
  requestedProduct: {
    id: string;
    product: {
      id: string;
      name: string;
      unit: string;
    };
  };
}

export interface ICreateDonation {
  requestedProductId: string;
  quantity: number;
  collectionType?: DonationCollectionType;
}

export interface IUpdateDonation {
  quantity?: number;
}

export interface IQueryDonations extends IQueryRequest {
  distributionPointId?: string;
  requestedProductId?: string;
  status?: DonationStatus;
  userId?: string;
}

export interface IListDonations {
  items: IDonation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
