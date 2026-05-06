export type typeStatus = "approved" | "pending" | "rejected" | "canceled" | "waiting";
export type typeRoles = "donor" | "coordinator" | "user" | "admin" ;

export interface ILogin {
  email: string;
  password: string;
}
