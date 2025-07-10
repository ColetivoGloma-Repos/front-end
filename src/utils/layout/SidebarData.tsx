import { ISidebar } from "../../interfaces/layout";
import { IUser } from "../../interfaces/user";

export const sidebarData = (currentUser: IUser): ISidebar[] => {
 const admin = currentUser?.roles.includes("admin");


  const menuItems: ISidebar[] = [
    { id: "profile", text: "Perfil", route: "/profile" },
    { id: "distribuition-points", text: "Ponto de distribuição", route: "/" },
    { id: "shelters", text: "Abrigos", route: "/shelters" },
    { id: "dashboard", text: "Dashboard", route: "/dashboard-admin" }
  ];

  if (!admin) {
    return menuItems.filter(item => item.id !== "dashboard");
  }

  return menuItems;
};
