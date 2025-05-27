import { patch, post } from "./cg-api.service";
import { IUserCreate, IUserUpdate } from "../interfaces/user";
import { ILogin } from "../interfaces/auth";

export function login(data: ILogin) {
  return post(`/auth/login`, { data });
}

export function createUser(data: IUserCreate) {
  return post(`/auth/register`, { data });
}


export function updateUser(id: string, data: IUserUpdate) {
  delete data.id;
  return patch(`/auth/update/${id}`, {data})
}