import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

import { AuthRoute } from "./Auth/AuthRoute";
import { PrivateRoute } from "./Auth/PrivateRoute";
import { Layout } from "../layout";

import LoginPointScreen from "../pages/auth/login";
import SignUpScreen from "../pages/auth/register";
import ForgotPasswordScreen from "../pages/auth/forgot-password";
import ResetPasswordScreen from "../pages/auth/reset-password";
import SheltersScreen from "../pages/shelters";
import CoordinatorsScreen from "../pages/shelters/id";
import DistribuitionPointsScreen from "../pages/distribuition-points";
import DistribuitionPointScreen from "../pages/distribuition-points/id";
import ProfileScreen from "../pages/profile";
import DemandsPointScreen from "../pages/demand-point";
import DemandPointScreen from "../pages/demand-point/id";
import AllCoordinatorsScreen from "../pages/approve-coordinators";
import { PrivateRoleRoute } from "./Auth/PrivateRoleRoute";
import { DashboardAdminScreen } from "../pages/dashboard-admin";

export function RoutesPage() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthRoute />}>
          <Route element={<LoginPointScreen />} path="/auth/login"></Route>
          <Route element={<SignUpScreen />} path="/auth/register"></Route>
        </Route>

        {/* Rotas públicas de recuperação de senha */}
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        <Route element={<Layout />}>
          <Route path="/" element={<DistribuitionPointsScreen />} />
          <Route
            path="/distribuition-points/:id"
            element={<DistribuitionPointScreen />}
          />

          <Route
            path="/demands-point"
            element={<DemandsPointScreen />}
          />
          
          <Route
            path="/demand-point/:id"
            element={<DemandPointScreen />}
          />
       
       
          <Route element={<PrivateRoute />}>
            <Route path="/shelters" element={<SheltersScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/shelters/:id" element={<CoordinatorsScreen />} />
            
          </Route>
          <Route element={<PrivateRoleRoute roles={['admin']} />}>
            <Route path="/coordinators" element={<AllCoordinatorsScreen />} />
            <Route path="/dashboard-admin" element={<DashboardAdminScreen />} />
          </Route>
          <Route path="*" element={<DemandsPointScreen />} />
        </Route>
      </Routes>
    </Router>
  );
}
