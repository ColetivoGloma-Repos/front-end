export type typeStatus = "approved" | "pending" | "rejected" | "canceled";
export type typeRoles = "donor" | "coordinator" | "user" | "admin" ;

export interface ILogin {
  email: string;
  password: string;
}
