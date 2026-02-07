import { IQueryRequest } from "./default";

export enum UnitType {
  UNIT = "UNIT",
  UN = "UN",
  KG = "KG",
  G = "G",
  L = "L",
  ML = "ML",
}

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  unit: UnitType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProduct {
  name: string;
  unit?: UnitType;
  slug?: string;
  active?: boolean;
}

export type IUpdateProduct = Partial<ICreateProduct>;

export interface IListProducts extends IQueryRequest {
  active?: boolean;
}
