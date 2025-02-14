import { IUserCreate } from "../../../interfaces/user";

export interface IRegister extends IUserCreate {
  confirm: string;
}
