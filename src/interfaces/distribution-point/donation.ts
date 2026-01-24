import { IQueryRequest } from "./../default";

export enum DonationStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  DELIVERED = "DELIVERED",
}

export interface IUserSummary {
  name: string;
  email: string;
}

export interface IDonation {
  id: string;
  userId: string;
  requestedProductId: string;
  pointId: string;
  quantity: number;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  user: IUserSummary;
}

export interface ICreateDonation {
  requestedProductId: string;
  quantity: number;
}

export interface IUpdateDonation {
  quantity?: number;
}

export interface IQueryDonations extends IQueryRequest {
  distributionPointId?: string;
  requestedProductId?: string;
  status?: DonationStatus;
}

export interface IListDonations {
  items: IDonation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
