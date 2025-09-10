export type typeStatus = "approved" | "pending" | "rejected";
export type typeRoles = "donor" | "coordinator" | "user" | "admin" | "initiative-administrator";

export interface ILogin {
  email: string;
  password: string;
}
