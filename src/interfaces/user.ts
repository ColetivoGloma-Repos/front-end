import { IAddress } from "./address";
import { typeRoles, typeStatus } from "./auth";
import { IParamsDefault } from "./default";
import { IShelter } from "./shelter";

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
}

export interface IUserUpdate extends IUserCreate {
  username: string;
  address?: IAddress;
  phone?: string;
  birthDate?: Date;
  isDonor?: boolean;
  isCoordinator?: boolean;
  hasVehicle?: boolean;
  vehicleType?: string;
  color?: string;
  identifier?: string;
  brand?: string;
  status?: typeStatus;
}

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  address: IAddress;
  phone: string;
  birthDate: Date;
  isDonor: boolean;
  isCoordinator: boolean;
  roles: typeRoles[];
  hasVehicle?: boolean;
  vehicleType?: string;
  status: typeStatus;
  shelter: IShelter;
  url?: string;
}


export interface IUserDash {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  url?: string;
}

export interface ISearchCoordinator extends IParamsDefault {
  name?: string
}

export interface IChangeStatus {
  id: string;
  status: string
}