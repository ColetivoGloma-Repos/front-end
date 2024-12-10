import { IParamsDefault } from "./default";
import { IUser } from "./user";

export type ProductType = "perishable" | "non_perishable";
export type StatusType = "requested" | "received" | "Aprovado" | "Reprovado" | "Pendente";
export interface IProductCreate {
  name: string;
  type: ProductType;
  quantity: number;
  weight?: string | null;
  description: string;
  status: StatusType;
  distributionPointId: string;
}

export interface IProductUpdate {
  name?: string;
  type?: ProductType;
  quantity?: number;
  weight?: string | null;
  description?: string;
}

export interface IProduct {
  id: string;
  name: string;
  type: ProductType;
  status: "received" | "requested" | "Approved" | "Rejected" | "Pending";
  quantity: number;
  weight?: string;
  description?: string;
  category?: string;
  creator?: IUser;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface ISearchProducts extends IParamsDefault {
  distributionPointId?: string;
  type?: string;
  status?: string;
}


export interface IProductDonate {
  quantity: number;  
  productReferenceID: string;
  weight?: string | null;
}

