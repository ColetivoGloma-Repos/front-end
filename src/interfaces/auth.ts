export type typeStatus = "approved" | "pending" | "rejected";
export type typeRoles = "coordinator" | "user" | "admin";

export interface ILogin {
  email: string;
  password: string;
}
