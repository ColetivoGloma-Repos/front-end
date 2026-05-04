import { Route } from "react-router-dom";
import { DistributionPointProvider } from "../context";
import DetailDistributionPoint from "../pages/detail";
import ListDistributionPoint from "../pages/list";
import CreateDistributionPoint from "../pages/create";
import EditDistributionPoint from "../pages/edit";
import ManageDistributionPoint from "../pages/manage";
import CoordinatorsPage from "../pages/coordinators";
import { PrivateRoleRoute } from "../../../routes/Auth/PrivateRoleRoute";

export const ROUTES = {
  list: "/",
  details: (id: string) => `/distribution-point/${id}`,
  detail: (id: string) => `/distribution-point/${id}`,
  coordinators: (id: string) => `/distribution-point/${id}/coordinators`,
  create: "/distribution-point/create",
  edit: (id: string) => `/distribution-point/${id}/edit`,
  manage: "/distribution-point/manage",
};

export function distributionPointRoutes() {
  return (
    <Route element={<DistributionPointProvider />}>
      <Route path="/" element={<ListDistributionPoint />} />
      <Route path="/distribution-point/:id" element={<DetailDistributionPoint />} />
      <Route path="/distribution-point/:id/coordinators" element={<CoordinatorsPage />} />

      <Route element={<PrivateRoleRoute roles={["admin", "coordinator"]} />}>
        <Route path="/distribution-point/create" element={<CreateDistributionPoint />} />
        <Route path="/distribution-point/:id/edit" element={<EditDistributionPoint />} />
        <Route path="/distribution-point/manage" element={<ManageDistributionPoint />} />
      </Route>
    </Route>
  );
}
